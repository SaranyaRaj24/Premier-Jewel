
import React, { useState } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Button,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  IconButton,
  MenuItem,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { MdDeleteForever } from "react-icons/md";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./billing.css";

const Billing = () => {
  const [customers] = useState([{ customer_id: 1, customer_name: "John Doe" }]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [billId] = useState(1);
  const [date] = useState(new Date().toLocaleDateString("en-IN"));
  const [time] = useState(
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );

  const initialProductWeights = {
    Chain: 400,
    Ring: 300,
  };

  const [rows, setRows] = useState([1]);
  const [billDetailRows, setBillDetailRows] = useState([
    { productName: "", wt: "", stWt: "", awt: "", percent: "", fwt: "" },
  ]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        date: new Date().toISOString().slice(0, 10),
        goldRate: "",
        givenGold: "",
        touch: "",
        purityWeight: "",
        amount: "",
      },
    ]);
  };

  const handleDeleteRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleAddBillDetailRow = () => {
    setBillDetailRows([
      ...billDetailRows,
      { productName: "", wt: "", stWt: "", awt: "", percent: "", fwt: "" },
    ]);
  };

  const handleBillDetailChange = (index, field, value) => {
    const updated = [...billDetailRows];
    updated[index][field] = value;

    const wt = parseFloat(updated[index].wt) || 0;
    const stWt = parseFloat(updated[index].stWt) || 0;
    const percent = parseFloat(updated[index].percent) || 0;

    const awt = wt - stWt;
    updated[index].awt = awt.toFixed(3);
    updated[index].fwt = ((awt * percent) / 100).toFixed(3);

    setBillDetailRows(updated);
  };

  const inputStyle = {
    minWidth: "130px",
    padding: "15px",
    fontSize: "15px",
    height: "35px",
  };

  return (
    <Box className="billing-wrapper">
      <Box className="left-panel">
        <h1 className="heading">Estimate Only</h1>
        <Box className="bill-header">
          <Box className="bill-number">
            <p>
              <strong>Bill No:</strong> {billId}
            </p>
          </Box>
          <Box className="bill-info">
            <p>
              <strong>Date:</strong> {date}
              <br />
              <br />
              <strong>Time:</strong> {time}
            </p>
          </Box>
        </Box>

        <Box className="search-section no-print">
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => option.customer_name || ""}
            onChange={(_, newValue) => setSelectedCustomer(newValue)}
            value={selectedCustomer}
            renderInput={(params) => (
              <TextField
                {...params}
                style={{ width: "15rem" }}
                label="Select Customer"
                variant="outlined"
                size="small"
              />
            )}
          />
        </Box>

        {selectedCustomer && (
          <Box className="customer-details">
            <h3 className="no-print">Customer Details:</h3>
            <p>
              <strong>Name:</strong> {selectedCustomer.customer_name}
            </p>
          </Box>
        )}

        <Box className="items-section">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>Bill Details:</h3>
            <IconButton onClick={handleAddBillDetailRow} className="no-print">
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>

          <Table className="table">
            <TableHead>
              <TableRow>
                <TableCell className="th">S.No</TableCell>
                <TableCell className="th">Product Name</TableCell>
                <TableCell className="th">Wt</TableCell>
                <TableCell className="th">St. WT</TableCell>
                <TableCell className="th">AWT</TableCell>
                <TableCell className="th">%</TableCell>
                <TableCell className="th">FWT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billDetailRows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="td">{index + 1}</TableCell>
                  <TableCell className="td">
                    <TextField
                      select
                      size="small"
                      value={row.productName}
                      onChange={(e) =>
                        handleBillDetailChange(
                          index,
                          "productName",
                          e.target.value
                        )
                      }
                      inputProps={{ style: inputStyle }}
                    >
                      <MenuItem value="Chain">Chain</MenuItem>
                      <MenuItem value="Ring">Ring</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell className="td">
                    <TextField
                      size="small"
                      type="number"
                      value={row.wt}
                      onChange={(e) =>
                        handleBillDetailChange(index, "wt", e.target.value)
                      }
                      inputProps={{ style: inputStyle }}
                    />
                  </TableCell>
                  <TableCell className="td">
                    <TextField
                      size="small"
                      type="number"
                      value={row.stWt}
                      onChange={(e) =>
                        handleBillDetailChange(index, "stWt", e.target.value)
                      }
                      inputProps={{ style: inputStyle }}
                    />
                  </TableCell>
                  <TableCell className="td">
                    <TextField
                      size="small"
                      type="number"
                      value={row.awt}
                      disabled
                      inputProps={{ style: inputStyle }}
                    />
                  </TableCell>
                  <TableCell className="td">
                    <TextField
                      size="small"
                      type="number"
                      value={row.percent}
                      onChange={(e) =>
                        handleBillDetailChange(index, "percent", e.target.value)
                      }
                      inputProps={{ style: inputStyle }}
                    />
                  </TableCell>
                  <TableCell className="td">
                    <TextField
                      size="small"
                      type="number"
                      value={row.fwt}
                      disabled
                      inputProps={{ style: inputStyle }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box className="items-section" sx={{ marginTop: 2 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>Received Details:</h3>
              <IconButton onClick={handleAddRow} className="no-print">
                <AddCircleOutlineIcon />
              </IconButton>
            </div>

            <Table className="table received-details-table">
              <TableHead>
                <TableRow>
                  <TableCell className="th">S.No</TableCell>
                  <TableCell className="th">Date</TableCell>
                  <TableCell className="th">Gold Rate</TableCell>
                  <TableCell className="th">Gold</TableCell>
                  <TableCell className="th">Touch</TableCell>
                  <TableCell className="th">Purity WT</TableCell>
                  <TableCell className="th">Amount</TableCell>
                  <TableCell className="th no-print">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="td">{index + 1}</TableCell>
                      <TableCell className="td">
                        <TextField
                          size="small"
                          type="date"
                          value={row.date}
                          inputProps={{ style: inputStyle }}
                        />
                      </TableCell>
                      <TableCell className="td">
                        <TextField
                          size="small"
                          value={row.goldRate}
                          type="number"
                          inputProps={{ style: inputStyle }}
                        />
                      </TableCell>
                      <TableCell className="td">
                        <TextField
                          size="small"
                          value={row.givenGold}
                          type="number"
                          inputProps={{ style: inputStyle }}
                        />
                      </TableCell>
                      <TableCell className="td">
                        <TextField
                          size="small"
                          value={row.touch}
                          type="number"
                          inputProps={{ style: inputStyle }}
                        />
                      </TableCell>
                      <TableCell className="td">
                        <TextField
                          size="small"
                          value={row.purityWeight}
                          inputProps={{ style: inputStyle }}
                        />
                      </TableCell>
                      <TableCell className="td">
                        <TextField
                          size="small"
                          value={row.amount}
                          type="number"
                          inputProps={{ style: inputStyle }}
                        />
                      </TableCell>
                      <TableCell className="td no-print">
                        <IconButton onClick={() => handleDeleteRow(index)}>
                          <MdDeleteForever />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="no-products-message">
                      No received details added
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <Box className="closing-balance">
            <div className="flex">
              <strong>Excess Cash Balance: 0.00</strong>
              <strong>Excess Pure: 0.000</strong>
              <strong>Pure Balance: 0.000</strong>
            </div>
          </Box>

          <Button
            variant="contained"
            color="primary"
            className="save-button no-print"
          >
            Save
          </Button>
        </Box>
      </Box>
      <Box className="right-panel no-print">
        <h3 className="heading">Available Product Weights</h3>
        <Table className="table">
          <TableHead>
            <TableRow>
              <TableCell className="th">S.No</TableCell>
              <TableCell className="th">Product</TableCell>
              <TableCell className="th">Remaining Weight</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(initialProductWeights)
              .filter((product) =>
                billDetailRows.some((row) => row.productName === product)
              )
              .map((product, index) => {
                const totalUsed = billDetailRows
                  .filter((row) => row.productName === product)
                  .reduce((acc, row) => acc + (parseFloat(row.wt) || 0), 0);

                const remaining =
                  (initialProductWeights[product] || 0) - totalUsed;

                return (
                  <TableRow key={index}>
                    <TableCell className="td">{index + 1}</TableCell>
                    <TableCell className="td">{product}</TableCell>
                    <TableCell className="td">{remaining.toFixed(3)}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <ToastContainer />
      </Box>
    </Box>
  );
};

export default Billing;
