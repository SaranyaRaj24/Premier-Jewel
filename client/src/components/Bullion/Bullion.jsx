
// import React, { useEffect, useState } from "react";
// import DeleteIcon from "@mui/icons-material/Delete";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

// import axios from "axios";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   MenuItem,
//   IconButton,
//   Typography,
//   Box,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
// } from "@mui/material";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import "./Bullion.css";
// import { BACKEND_SERVER_URL } from "../../Config/Config";

// const Bullion = () => {
//   const [open, setOpen] = useState(false);
//   const [names, setNames] = useState([]);
//   const [selectedNameId, setSelectedNameId] = useState("");
//   const [grams, setGrams] = useState("");
//   const [touch, setTouch] = useState("");
//   const [purity, setPurity] = useState(0);
//   const [rate, setRate] = useState("");
//   const [amount, setAmount] = useState(0);
//   const [givenEntries, setGivenEntries] = useState([]);
//   const [newGiven, setNewGiven] = useState("");
//   const [allData, setAllData] = useState([]);
//   const [editId, setEditId] = useState(null);

//   const openDialog = async (editData = null) => {
//     setOpen(true);
//     try {
//       const res = await axios.get(`${BACKEND_SERVER_URL}/api/master-bullion/`);
//       setNames(res.data);
//     } catch (err) {
//       console.error("Failed to fetch bullion names:", err);
//     }

//     if (editData) {
//       setEditId(editData.id);
//       setSelectedNameId(editData.bullionId);
//       setGrams(editData.grams);
//       setTouch(editData.touch);
//       setPurity(editData.purity);
//       setRate(editData.rate);
//       setAmount(editData.amount);
//       setGivenEntries(editData.givenDetails || []);
//     }
//   };

//   const closeDialog = () => {
//     setOpen(false);
//     resetAll();
//   };

//   const resetAll = () => {
//     setSelectedNameId("");
//     setGrams("");
//     setTouch("");
//     setPurity(0);
//     setRate("");
//     setAmount(0);
//     setGivenEntries([]);
//     setNewGiven("");
//     setEditId(null);
//   };

//   const fetchAll = async () => {
//     try {
//       const res = await axios.get(
//         `${BACKEND_SERVER_URL}/api/bullion-purchase/`
//       );
//       setAllData(res.data);
//     } catch (err) {
//       console.error("Error fetching all bullion entries:", err);
//     }
//   };

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   const handlePurityCalculation = (
//     updatedGrams = grams,
//     updatedTouch = touch
//   ) => {
//     const g = parseFloat(updatedGrams);
//     const t = parseFloat(updatedTouch);
//     if (!isNaN(g) && !isNaN(t)) {
//       const purityVal = (g * t) / 100;
//       setPurity(purityVal);
//       if (rate) setAmount(purityVal * parseFloat(rate));
//     } else {
//       setPurity(0);
//       setAmount(0);
//     }
//   };

//   const handleRateChange = (val) => {
//     setRate(val);
//     if (purity) setAmount(purity * parseFloat(val));
//   };

//   const handleAddGiven = () => {
//     if (newGiven && rate) {
//       const gramVal = parseFloat(newGiven) / parseFloat(rate);
//       const updated = [
//         ...givenEntries,
//         { amount: parseFloat(newGiven), grams: gramVal },
//       ];
//       setGivenEntries(updated);
//       setNewGiven("");
//     }
//   };

//   const liveGivenGrams =
//     newGiven && rate && !isNaN(parseFloat(newGiven)) && !isNaN(parseFloat(rate))
//       ? parseFloat(newGiven) / parseFloat(rate)
//       : 0;

//   const confirmedGrams = givenEntries.reduce(
//     (sum, entry) => sum + entry.grams,
//     0
//   );
//   const balance = purity - (confirmedGrams + liveGivenGrams);

//   const handleSave = async () => {
//     let finalGivenEntries = [...givenEntries];
//     if (newGiven && rate) {
//       const gramVal = parseFloat(newGiven) / parseFloat(rate);
//       finalGivenEntries.push({ amount: parseFloat(newGiven), grams: gramVal });
//     }

//     const payload = {
//       bullionId: selectedNameId,
//       grams: parseFloat(grams),
//       touch: parseFloat(touch),
//       purity,
//       rate: parseFloat(rate),
//       amount,
//       givenDetails: finalGivenEntries,
//       balance: parseFloat(
//         (purity - confirmedGrams - liveGivenGrams).toFixed(2)
//       ),
//     };

//     try {
//       if (editId) {
//         await axios.put(
//           `${BACKEND_SERVER_URL}/api/bullion-purchase/given-details/${editId}`,
//           { givenDetails: finalGivenEntries }
//         );
//         toast.success("Bullion Purchase updated successfully");
//       } else {
//         await axios.post(
//           `${BACKEND_SERVER_URL}/api/bullion-purchase/create`,
//           payload
//         );
//         toast.success("Bullion purchase created successfully");
//       }
//       fetchAll();
//       closeDialog();
//     } catch (err) {
//       console.error("Failed to save bullion purchase", err);
//       toast.error("Failed to save purchase");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this purchase?"))
//       return;
//     try {
//       await axios.delete(
//         `${BACKEND_SERVER_URL}/api/bullion-purchase/delete/${id}`
//       );
//       toast.success("Purchase deleted successfully");
//       fetchAll();
//     } catch (err) {
//       console.error("Failed to delete purchase", err);
//       toast.error("Failed to delete purchase");
//     }
//   };

//   return (
//     <div className="bullion-container">
//       <Button variant="contained" onClick={() => openDialog()}>
//         New Purchase
//       </Button>

//       <Table>
//      <TableHead
//                        sx={{
//                          backgroundColor: "#e3f2fd",
//                          "& th": {
//                            backgroundColor: "#e3f2fd",
//                            color: "#0d47a1",
//                            fontWeight: "bold",
//                            fontSize: "1rem",
//                          },
//                        }}
//                      >
//           <TableRow>
//             <TableCell>Name</TableCell>
//             <TableCell>Grams</TableCell>
//             <TableCell>Touch</TableCell>
//             <TableCell>Purity</TableCell>
//             <TableCell>Rate</TableCell>
//             <TableCell>Amount</TableCell>
//             <TableCell>Given Details</TableCell>
//             <TableCell>Balance</TableCell>
//             <TableCell>Action</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {allData.map((row) => {
//             const totalGiven =
//               row.givenDetails?.reduce((sum, entry) => sum + entry.grams, 0) ||
//               0;
//             const balance = (row.purity - totalGiven).toFixed(2);

//             return (
//               <TableRow key={row.id}>
//                 <TableCell>{row.bullion?.name}</TableCell>
//                 <TableCell>{row.grams}</TableCell>
//                 <TableCell>{row.touch}</TableCell>
//                 <TableCell>{row.purity.toFixed(2)}</TableCell>
//                 <TableCell>{row.rate}</TableCell>
//                 <TableCell>{row.amount.toFixed(2)}</TableCell>

//                 <TableCell>
//                   {row.givenDetails?.length > 0 ? (
//                     row.givenDetails.map((entry, index) => (
//                       <Typography key={index}>
//                         ₹ {entry.amount} → {entry.grams.toFixed(2)} g
//                       </Typography>
//                     ))
//                   ) : (
//                     <Typography>-</Typography>
//                   )}
//                 </TableCell>

//                 <TableCell style={{ color: balance <= 0 ? "green" : "red" }}>
//                   {balance} g
//                 </TableCell>

//                 <TableCell>
//                   <IconButton onClick={() => openDialog(row)}>
//                     <VisibilityIcon />
//                   </IconButton>
//                   <IconButton onClick={() => handleDelete(row.id)}>
//                     <DeleteIcon color="error" />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             );
//           })}
//         </TableBody>
//       </Table>

//       <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
//         <DialogTitle>{editId ? "Update" : "New"} Bullion Purchase</DialogTitle>
//         <DialogContent>
//           <TextField
//             select
//             label="Name"
//             fullWidth
//             margin="normal"
//             value={selectedNameId}
//             onChange={(e) => setSelectedNameId(e.target.value)}
//           >
//             {names.map((item) => (
//               <MenuItem key={item.id} value={item.id}>
//                 {item.name}
//               </MenuItem>
//             ))}
//           </TextField>

//           <Box className="input-row">
//             <TextField
//               label="Grams"
//               type="number"
//               value={grams}
//               onChange={(e) => {
//                 const v = e.target.value;
//                 setGrams(v);
//                 handlePurityCalculation(v, touch);
//               }}
//               fullWidth
//             />
//             <TextField
//               label="Touch"
//               type="number"
//               value={touch}
//               onChange={(e) => {
//                 const v = e.target.value;
//                 setTouch(v);
//                 handlePurityCalculation(grams, v);
//               }}
//               fullWidth
//             />
//             <TextField
//               label="Purity"
//               type="number"
//               value={purity.toFixed(2)}
//               InputProps={{ readOnly: true }}
//               fullWidth
//             />
//           </Box>

//           <Box className="input-row">
//             <TextField
//               label="Rate"
//               type="number"
//               value={rate}
//               onChange={(e) => handleRateChange(e.target.value)}
//               fullWidth
//             />
//             <TextField
//               label="Amount"
//               type="number"
//               value={amount.toFixed(2)}
//               InputProps={{ readOnly: true }}
//               fullWidth
//             />
//           </Box>

//           <Box mt={3}>
//             <Typography variant="subtitle1">Given Details</Typography>
//             {givenEntries.map((entry, index) => (
//               <Box key={index} className="given-entry">
//                 <Typography>₹ {entry.amount}</Typography>
//                 <Typography>{entry.grams.toFixed(2)} g</Typography>
//               </Box>
//             ))}

//             <Box className="given-input">
//               <TextField
//                 label="Enter Amount"
//                 type="number"
//                 value={newGiven}
//                 onChange={(e) => setNewGiven(e.target.value)}
//                 fullWidth
//               />
//               <IconButton onClick={handleAddGiven}>
//                 <AddCircleOutlineIcon color="primary" />
//               </IconButton>
//               {liveGivenGrams > 0 && (
//                 <Typography sx={{ marginLeft: 2, whiteSpace: "nowrap" }}>
//                   = {liveGivenGrams.toFixed(2)} g
//                 </Typography>
//               )}
//             </Box>

//             <Box mt={2}>
//               <Typography>
//                 <strong>Balance:</strong> {balance.toFixed(2)} g
//               </Typography>
//             </Box>
//           </Box>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={closeDialog}>Cancel</Button>
//           <Button variant="contained" onClick={handleSave}>
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// };

// export default Bullion;









import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./Bullion.css";
import { BACKEND_SERVER_URL } from "../../Config/Config";

const Bullion = () => {
  const [open, setOpen] = useState(false);
  const [names, setNames] = useState([]);
  const [selectedNameId, setSelectedNameId] = useState("");
  const [grams, setGrams] = useState(""); 
  const [rate, setRate] = useState("");
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0); 
  const [givenEntries, setGivenEntries] = useState([]);
  const [newGivenAmount, setNewGivenAmount] = useState(""); 
  const [newGivenGramsCalculated, setNewGivenGramsCalculated] = useState(0); 
  const [newGivenTouch, setNewGivenTouch] = useState(""); 
  const [newGivenPurityCalculated, setNewGivenPurityCalculated] = useState(0);
  const [allData, setAllData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); 

  const openDialog = async (editData = null) => {
    setOpen(true);
    try {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/master-bullion/`);
      setNames(res.data);
    } catch (err) {
      console.error("Failed to fetch bullion names:", err);
    }

    if (editData) {
      setEditId(editData.id);
      setIsEditMode(true);
      setSelectedNameId(editData.bullionId);
      setGrams(editData.grams);
      setRate(editData.rate);
      setTotalPurchaseAmount(editData.amount); 
      setGivenEntries(editData.givenDetails || []);
      setNewGivenAmount("");
      setNewGivenGramsCalculated(0);
      setNewGivenTouch("");
      setNewGivenPurityCalculated(0);
    } else {
      setIsEditMode(false);
    }
  };

  const closeDialog = () => {
    setOpen(false);
    resetAll();
  };

  const resetAll = () => {
    setSelectedNameId("");
    setGrams("");
    setRate("");
    setTotalPurchaseAmount(0);
    setGivenEntries([]);
    setNewGivenAmount("");
    setNewGivenGramsCalculated(0);
    setNewGivenTouch("");
    setNewGivenPurityCalculated(0);
    setEditId(null);
    setIsEditMode(false);
  };

  const fetchAll = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_SERVER_URL}/api/bullion-purchase/`
      );
      setAllData(res.data);
    } catch (err) {
      console.error("Error fetching all bullion entries:", err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const g = parseFloat(grams);
    const r = parseFloat(rate);
    if (!isNaN(g) && !isNaN(r)) {
      setTotalPurchaseAmount(g * r);
    } else {
      setTotalPurchaseAmount(0);
    }
  }, [grams, rate]);


  useEffect(() => {
    const currentRate = parseFloat(rate);
    const amountVal = parseFloat(newGivenAmount);

    if (!isNaN(amountVal) && !isNaN(currentRate) && currentRate > 0) {
      const calculatedGrams = amountVal / currentRate;
      setNewGivenGramsCalculated(calculatedGrams);

      const touchVal = parseFloat(newGivenTouch);
      if (!isNaN(touchVal) && touchVal > 0) {
   
        setNewGivenPurityCalculated((calculatedGrams / touchVal) * 100);
      } else {
        setNewGivenPurityCalculated(0);
      }
    } else {
      setNewGivenGramsCalculated(0);
      setNewGivenPurityCalculated(0);
    }
  }, [newGivenAmount, rate, newGivenTouch]);

  const calculateTotalGivenGrams = (entries) => {
    return entries.reduce((sum, entry) => {
      const g = parseFloat(entry.grams);
      return !isNaN(g) ? sum + g : sum;
    }, 0);
  };

  const handleAddGiven = () => {
    const currentRate = parseFloat(rate);
    const amountVal = parseFloat(newGivenAmount);
    const touchVal = parseFloat(newGivenTouch);

    if (
      !isNaN(amountVal) &&
      !isNaN(touchVal) &&
      !isNaN(currentRate) &&
      currentRate > 0 &&
      touchVal > 0 
    ) {
      const gramsForEntry = amountVal / currentRate;
      const purityForEntry = (gramsForEntry / touchVal) * 100;

      const updated = [
        ...givenEntries,
        {
          amount: amountVal,
          grams: gramsForEntry,
          touch: touchVal,
          purity: purityForEntry,
        },
      ];
      setGivenEntries(updated);
      setNewGivenAmount("");
      setNewGivenTouch("");
      setNewGivenGramsCalculated(0);
      setNewGivenPurityCalculated(0);
    } else {
      toast.error(
        "Please enter valid Amount, Touch (must be > 0), and Rate before adding."
      );
    }
  };

  const handleSave = async () => {
    let finalGivenEntries = [...givenEntries];
    const currentRate = parseFloat(rate);
    const amountVal = parseFloat(newGivenAmount);
    const touchVal = parseFloat(newGivenTouch);

    if (
      !isNaN(amountVal) &&
      !isNaN(touchVal) &&
      !isNaN(currentRate) &&
      currentRate > 0 &&
      touchVal > 0
    ) {
      const gramsForEntry = amountVal / currentRate;
      const purityForEntry = (gramsForEntry / touchVal) * 100;
      finalGivenEntries.push({
        amount: amountVal,
        grams: gramsForEntry,
        touch: touchVal,
        purity: purityForEntry,
      });
    }

    const totalGivenGrams = calculateTotalGivenGrams(finalGivenEntries);
    const finalBalanceInGrams = parseFloat(grams) - totalGivenGrams;
    const payload = {
      bullionId: selectedNameId,
      grams: parseFloat(grams),
      rate: parseFloat(rate),
      amount: parseFloat(totalPurchaseAmount.toFixed(2)),
      givenDetails: finalGivenEntries,
      balance: parseFloat(finalBalanceInGrams.toFixed(2)), 
    };

    try {
      if (editId) {
        await axios.put(
          `${BACKEND_SERVER_URL}/api/bullion-purchase/${editId}`,
          payload
        );
        toast.success("Bullion Purchase updated successfully");
      } else {
        await axios.post(
          `${BACKEND_SERVER_URL}/api/bullion-purchase/create`,
          payload
        );
        toast.success("Bullion purchase created successfully");
      }
      fetchAll();
      closeDialog();
    } catch (err) {
      console.error("Failed to save bullion purchase", err);
      toast.error("Failed to save purchase");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase?"))
      return;
    try {
      await axios.delete(
        `${BACKEND_SERVER_URL}/api/bullion-purchase/delete/${id}`
      );
      toast.success("Purchase deleted successfully");
      fetchAll();
    } catch (err) {
      console.error("Failed to delete purchase", err);
      toast.error("Failed to delete purchase");
    }
  };


  const currentTotalGivenGrams = calculateTotalGivenGrams(givenEntries);
  const liveTotalGivenGramsWithPending =
    currentTotalGivenGrams + (newGivenGramsCalculated || 0);
  const liveBalanceInGrams =
    (parseFloat(grams) || 0) - liveTotalGivenGramsWithPending;

  return (
    <div className="bullion-container">
      <Button variant="contained" onClick={() => openDialog()}>
     New Purchase
      </Button>

      <Table>
        <TableHead
          sx={{
            backgroundColor: "#e3f2fd",
            "& th": {
              backgroundColor: "#e3f2fd",
              color: "#0d47a1",
              fontWeight: "bold",
              fontSize: "1rem",
            },
          }}
        >
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Grams (Total)</TableCell> 
            <TableCell>Rate</TableCell>
            <TableCell>Amount (Total)</TableCell>
            <TableCell>Given Details</TableCell>
            <TableCell>Balance (Grams)</TableCell> 
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allData.map((row) => {
            const rowTotalGivenGrams =
              row.givenDetails?.reduce(
                (sum, entry) => sum + (entry.grams || 0),
                0
              ) || 0;
            const rowBalanceInGrams = row.grams - rowTotalGivenGived.toFixed(2);

            return (
              <TableRow key={row.id}>
                <TableCell>{row.bullion?.name}</TableCell>
                <TableCell>{row.grams}</TableCell>
                <TableCell>{row.rate}</TableCell>
                <TableCell>{row.amount?.toFixed(2) || "0.00"}</TableCell>
                <TableCell>
                  {row.givenDetails?.length > 0 ? (
                    row.givenDetails.map((entry, index) => (
                      <Typography key={index}>
                        ₹ {entry.amount?.toFixed(2) || "0.00"} (
                        {(entry.grams || 0).toFixed(2)} g @{" "}
                        {(entry.touch || 0).toFixed(2)} T) → P:{" "}
                        {(entry.purity || 0).toFixed(2)} g
                      </Typography>
                    ))
                  ) : (
                    <Typography>-</Typography>
                  )}
                </TableCell>
                <TableCell
                  style={{
                    color: parseFloat(rowBalanceInGrams) <= 0 ? "green" : "red",
                  }}
                >
                  {rowBalanceInGrams} g
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => openDialog(row)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(row.id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={closeDialog} maxWidth="lg" fullWidth>
        <DialogTitle>{editId ? "Update" : "New"} Bullion Purchase</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Name"
            fullWidth
            margin="normal"
            value={selectedNameId}
            onChange={(e) => setSelectedNameId(e.target.value)}
            disabled={isEditMode}
          >
            {names.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>

          <Box className="input-row">
            <TextField
              label="Total Grams"
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              fullWidth
              disabled={isEditMode}
            />
            <TextField
              label="Rate per gram"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              fullWidth
            />
            <TextField
              label="Total Purchase Amount"
              type="number"
              value={totalPurchaseAmount.toFixed(2)}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>

          <Box mt={3}>
            <Typography variant="subtitle1">Given Details</Typography>
            {givenEntries.map((entry, index) => (
              <Box key={index} className="given-entry">
                <Typography>
                  ₹ {entry.amount?.toFixed(2) || "0.00"} (
                  {(entry.grams || 0).toFixed(2)} g @{" "}
                  {(entry.touch || 0).toFixed(2)} T) → P:{" "}
                  {(entry.purity || 0).toFixed(2)} g
                </Typography>
              </Box>
            ))}

            <Box className="given-input">
              <TextField
                label="Enter Given Amount"
                type="number"
                value={newGivenAmount}
                onChange={(e) => setNewGivenAmount(e.target.value)}
                fullWidth
              />
              <TextField
                label="Grams (Calculated)"
                type="number"
                value={newGivenGramsCalculated.toFixed(2)}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Touch (for this given amount)"
                type="number"
                value={newGivenTouch}
                onChange={(e) => setNewGivenTouch(e.target.value)}
                fullWidth
              />
              <TextField
                label="Purity (Calculated)"
                type="number"
                value={newGivenPurityCalculated.toFixed(2)}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <IconButton
                onClick={handleAddGiven}
                disabled={!rate || !newGivenAmount || !newGivenTouch}
              >
                <AddCircleOutlineIcon color="primary" />
              </IconButton>
            </Box>

            <Box mt={2}>
           
              <Typography
                variant="h6"
                color={liveBalanceInGrams <= 0 ? "success.main" : "error.main"}
              >
                <strong>Balance:</strong> {liveBalanceInGrams.toFixed(2)} g
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Bullion;