import React, { useState } from "react";
import "./Repair.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Checkbox,
  FormControlLabel,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const Repair = () => {
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [givenWeights, setGivenWeights] = useState([0]);
  const [itemWeights, setItemWeights] = useState([0]);
  const [showWastage, setShowWastage] = useState(false);
  const [stoneValue, setStoneValue] = useState("");
  const [wastageType, setWastageType] = useState("");
  const [multiInput1, setMultiInput1] = useState("");
  const [multiInput2, setMultiInput2] = useState("");

  const total = (arr) => arr.reduce((acc, val) => acc + Number(val || 0), 0);
  const totalGiven = total(givenWeights);
  const totalItem = total(itemWeights);
  const difference = totalGiven - totalItem;

  const handleAddField = (setFunc, arr) => setFunc([...arr, 0]);

  return (
    <div className="repair-container">
      <Button variant="contained" onClick={() => setOpen(true)}>
        New Repair
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Repair</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Name</InputLabel>
            <Select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              label="Name"
            >
              <MenuItem value="Customer 1">Customer 1</MenuItem>
              <MenuItem value="Customer 2">Customer 2</MenuItem>
            </Select>
          </FormControl>
          <div className="weight-section">
            <div className="section-header">
              <strong>Given Weight</strong>
              <IconButton
                onClick={() => handleAddField(setGivenWeights, givenWeights)}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            </div>
            {givenWeights.map((weight, idx) => (
              <TextField
                key={idx}
                type="number"
                label={`Given Weight ${idx + 1}`}
                value={weight}
                onChange={(e) => {
                  const updated = [...givenWeights];
                  updated[idx] = e.target.value;
                  setGivenWeights(updated);
                }}
                fullWidth
                margin="dense"
              />
            ))}
            <p>
              <strong>Total Given Weight:</strong> {totalGiven}
            </p>
          </div>
          <div className="weight-section">
            <div className="section-header">
              <strong>Item Weight</strong>
              <IconButton
                onClick={() => handleAddField(setItemWeights, itemWeights)}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            </div>
            {itemWeights.map((weight, idx) => (
              <TextField
                key={idx}
                type="number"
                label={`Item Weight ${idx + 1}`}
                value={weight}
                onChange={(e) => {
                  const updated = [...itemWeights];
                  updated[idx] = e.target.value;
                  setItemWeights(updated);
                }}
                fullWidth
                margin="dense"
              />
            ))}
            <p>
              <strong>Total Item Weight:</strong> {totalItem}
            </p>
          </div>
          <p>
            <strong>Difference:</strong> {difference}
          </p>
          <FormControlLabel
            control={
              <Checkbox
                checked={showWastage}
                onChange={(e) => setShowWastage(e.target.checked)}
              />
            }
            label="Wastage"
          />

          {showWastage && (
            <>
              <TextField
                label="Stone"
                fullWidth
                margin="normal"
                value={stoneValue}
                onChange={(e) => setStoneValue(e.target.value)}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Wastage Type</InputLabel>
                <Select
                  value={wastageType}
                  onChange={(e) => setWastageType(e.target.value)}
                  label="Wastage Type"
                >
                  <MenuItem value="%">%</MenuItem>
                  <MenuItem value="Touch">Touch</MenuItem>
                </Select>
              </FormControl>

              <div className="input-multiplication">
                <TextField
                  label="Input 1"
                  type="number"
                  value={multiInput1}
                  onChange={(e) => setMultiInput1(e.target.value)}
                  margin="normal"
                  style={{ marginRight: "1rem" }}
                />
                <span style={{ fontSize: "1.5rem", marginTop: "1.5rem" }}>
                  *
                </span>
                <TextField
                  label="Input 2"
                  type="number"
                  value={multiInput2}
                  onChange={(e) => setMultiInput2(e.target.value)}
                  margin="normal"
                  style={{ marginLeft: "1rem" }}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Repair;
