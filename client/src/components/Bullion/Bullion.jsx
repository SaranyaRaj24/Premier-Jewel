import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Bullion.css";
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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { BACKEND_SERVER_URL } from "../../Config/Config";

const Bullion = () => {
  const [open, setOpen] = useState(false);
  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [grams, setGrams] = useState("");
  const [touch, setTouch] = useState("");
  const [purity, setPurity] = useState(0);
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState(0);
  const [givenEntries, setGivenEntries] = useState([]);
  const [newGiven, setNewGiven] = useState("");
  const[weight,setWeight]=useState("");
const[netWeight,setNetWeight]= useState("0");


 
  const openDialog = async () => {
    setOpen(true);
    try {
        const res = await axios.get(
          `${BACKEND_SERVER_URL}/api/master-bullion/`
        );
      setNames(res.data); 
    } catch (err) {
      console.error("Failed to fetch bullion names:", err);
    }
  };

  const closeDialog = () => {
    setOpen(false);
    resetAll();
  };

  const resetAll = () => {
    setSelectedName("");
    setGrams("");
    setTouch("");
    setPurity(0);
    setRate("");
    setAmount(0);
    setGivenEntries([]);
    setNewGiven("");
  };

  const handlePurityCalculation = (
    updatedGrams = grams,
    updatedTouch = touch
  ) => {
    const g = parseFloat(updatedGrams);
    const t = parseFloat(updatedTouch);

    if (!isNaN(g) && !isNaN(t)) {
      const purityVal = (g * t) / 100;
      setPurity(purityVal);

      if (rate) {
        setAmount(purityVal * parseFloat(rate));
      }
    } else {
      setPurity(0);
      setAmount(0);
    }
  };

  const handleRateChange = (val) => {
    setRate(val);
    if (purity) {
      setAmount(purity * parseFloat(val));
    }
  };

  const handleAddGiven = () => {
    if (newGiven && rate) {
      const gramVal = parseFloat(newGiven) / parseFloat(rate);
      const updated = [...givenEntries, { amount: newGiven, grams: gramVal }];
      setGivenEntries(updated);
      setNewGiven("");
    }
  };

  const liveGivenGrams =
    newGiven && rate && !isNaN(parseFloat(newGiven)) && !isNaN(parseFloat(rate))
      ? parseFloat(newGiven) / parseFloat(rate)
      : 0;

  const confirmedGrams = givenEntries.reduce(
    (sum, entry) => sum + entry.grams,
    0
  );
  const balance = purity - (confirmedGrams + liveGivenGrams);

  return (
    <div className="bullion-container">
      <Button variant="contained" onClick={openDialog}>
        New Purchase
      </Button>

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Bullion Purchase</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Name"
            fullWidth
            margin="normal"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
          >
            {names.map((item) => (
              <MenuItem key={item.id} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>

          <Box className="input-row">
            <TextField
              label="Grams"
              type="number"
              value={grams}
              onChange={(e) => {
                const value = e.target.value;
                setGrams(value);
                handlePurityCalculation(value, touch);
              }}
              fullWidth
            />
            <TextField
              label="Touch"
              type="number"
              value={touch}
              onChange={(e) => {
                const value = e.target.value;
                setTouch(value);
                handlePurityCalculation(grams, value);
              }}
              fullWidth
            />
            <TextField
              label="Purity"
              type="number"
              value={purity.toFixed(2)}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>

          <Box className="input-row">
            <TextField
              label="Rate"
              type="number"
              value={rate}
              onChange={(e) => handleRateChange(e.target.value)}
              fullWidth
            />
            <TextField
              label="Amount"
              type="number"
              value={amount.toFixed(2)}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>

          <Box mt={3}>
            <Typography variant="subtitle1">Given Details</Typography>
            {givenEntries.map((entry, index) => (
              <Box key={index} className="given-entry">
                <Typography>₹ {entry.amount}</Typography>
                <Typography>{entry.grams.toFixed(2)} g</Typography>
              </Box>
            ))}

            <Box className="given-input">
              <TextField
                label="Enter Amount"
                type="number"
                value={newGiven}
                onChange={(e) => setNewGiven(e.target.value)}
                fullWidth
              />
              <IconButton onClick={handleAddGiven}>
                <AddCircleOutlineIcon color="primary" />
              </IconButton>
              {liveGivenGrams > 0 && (
                <Typography sx={{ marginLeft: 2, whiteSpace: "nowrap" }}>
                  = {liveGivenGrams.toFixed(2)} g
                </Typography>
              )}
            </Box>

            <Box mt={2}>
              <Typography>
                <strong>Balance:</strong> {balance.toFixed(2)} g
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => console.log("Save logic here")}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Bullion;
