
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import { BACKEND_SERVER_URL } from "../../Config/Config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./NewJobCard.css";

const format = (val) =>
  isNaN(parseFloat(val)) ? "" : parseFloat(val).toFixed(3);

const NewJobCard = ({
  onClose,
  onSave,
  initialData,
  artisanId,
  goldsmithName,
}) => {
  const [assignmentId, setAssignmentId] = useState(null);
  const [description, setDescription] = useState("");
  const [goldRows, setGoldRows] = useState([
    { id: null, weight: "", touch: "", purity: "" },
  ]);
  const [itemRows, setItemRows] = useState([
    { id: null, weight: "", name: "" },
  ]); 
  const [deductionRows, setDeductionRows] = useState([
    { id: null, type: "Stone", customType: "", weight: "" }, 
  ]);

  const fixedOpeningBalance = 10.0;
  const [netWeight, setNetWeight] = useState("0.000");
  const [touch, setTouch] = useState("");
  const [percentageSymbol, setPercentageSymbol] = useState("Touch");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [wastage, setWastage] = useState(0);

  const symbolOptions = ["Touch", "%", "+"];

  const [masterItemOptions, setMasterItemOptions] = useState([]);
  const stoneOptions = ["Stone", "Enamel", "Beads", "Others"];

  const [displayDate, setDisplayDate] = useState(
    new Date().toLocaleDateString("en-IN")
  );

  useEffect(() => {
    const fetchMasterItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_SERVER_URL}/api/master-items`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch master items: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Fetched Master Items Data:", data);

        const itemNames = data.map((item) => item.itemName);

        setMasterItemOptions(itemNames);
      } catch (err) {
        console.error("Error fetching master items:", err);
        setError(`Failed to load item options: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasterItems();
  }, []);

  useEffect(() => {
    if (initialData) {
      console.log("Initial Data received:", initialData);
      setAssignmentId(initialData.id || null);
      setDescription(initialData.description || "");
      setGoldRows(
        initialData.metalInputs && initialData.metalInputs.length > 0
          ? initialData.metalInputs.map((input) => ({
              id: input.id, 
              weight: input.weight !== undefined ? String(input.weight) : "",
              touch: input.touch !== undefined ? String(input.touch) : "",
              purity: input.purity !== undefined ? String(input.purity) : "",
            }))
          : [{ id: null, weight: "", touch: "", purity: "" }]
      );
      setItemRows(
        initialData.finishedProducts && initialData.finishedProducts.length > 0
          ? initialData.finishedProducts.map((product) => ({
              id: product.id, 
              weight:
                product.weight !== undefined ? String(product.weight) : "",
              name: product.itemType || "",
            }))
          : [{ id: null, weight: "", name: "" }]
      );
      setDeductionRows(
        initialData.materialLosses && initialData.materialLosses.length > 0
          ? initialData.materialLosses.map((loss) => ({
              id: loss.id, 
              type: loss.type || "Stone",
              customType: loss.customType || "",
              weight: loss.weight !== undefined ? String(loss.weight) : "",
            }))
          : [{ id: null, type: "Stone", customType: "", weight: "" }]
      );
      setNetWeight(
        initialData.netWeight !== undefined
          ? format(initialData.netWeight)
          : "0.000"
      );
      setTouch(
        initialData.itemTouch !== undefined ? String(initialData.itemTouch) : ""
      );
      setPercentageSymbol(initialData.adjustmentType || "Touch");
      setWastage(initialData.wastage !== undefined ? initialData.wastage : 0);
      if (initialData.date) {
        setDisplayDate(new Date(initialData.date).toLocaleDateString("en-IN"));
      } else {
        setDisplayDate(new Date().toLocaleDateString("en-IN"));
      }
    } else {
      setAssignmentId(null);
      setDescription("");
      setGoldRows([{ id: null, weight: "", touch: "", purity: "" }]);
      setItemRows([{ id: null, weight: "", name: "" }]);
      setDeductionRows([
        { id: null, type: "Stone", customType: "", weight: "" },
      ]);
      setNetWeight("0.000");
      setTouch("");
      setPercentageSymbol("Touch");
      setWastage(0);
      setDisplayDate(new Date().toLocaleDateString("en-IN"));
    }
  }, [initialData]);

  const calculatePurity = (w, t) =>
    !isNaN(w) && !isNaN(t) ? ((w * t) / 100).toFixed(3) : "";

  const handleGoldRowChange = (i, field, val) => {
    const copy = [...goldRows];
    copy[i][field] = val;
    copy[i].purity = calculatePurity(
      parseFloat(copy[i].weight),
      parseFloat(copy[i].touch)
    );
    setGoldRows(copy);
  };

  const handleItemRowChange = (i, field, val) => {
    const updated = [...itemRows];
    updated[i][field] = val;
    setItemRows(updated);
  };

  const handleDeductionChange = (i, field, val) => {
    const updated = [...deductionRows];
    updated[i][field] = val;
    setDeductionRows(updated);
  };

  const totalPurity = goldRows.reduce(
    (sum, row) => sum + parseFloat(row.purity || 0),
    0
  );
  const totalBalance = parseFloat(fixedOpeningBalance) + totalPurity;
  const totalItemWeight = itemRows.reduce(
    (sum, item) => sum + parseFloat(item.weight || 0),
    0
  );
  const totalDeductionWeight = deductionRows.reduce(
    (sum, deduction) => sum + parseFloat(deduction.weight || 0),
    0
  );

  useEffect(() => {
    let calculatedNetWeight = totalItemWeight - totalDeductionWeight;
    setNetWeight(format(calculatedNetWeight));
  }, [itemRows, deductionRows, totalItemWeight, totalDeductionWeight]);

  const getFinalPurityWithAdjustment = () => {
    const base = parseFloat(netWeight);
    const value = parseFloat(touch);

    if (isNaN(base) || isNaN(value)) return "0.000";

    let finalValue = base;
    if (percentageSymbol === "Touch") {
      finalValue = (base * value) / 100;
    } else if (percentageSymbol === "%") {
      finalValue = base + (base * value) / 100;
    } else if (percentageSymbol === "+") {
      finalValue = base + value;
    }

    return format(finalValue);
  };

  const finalPurityForBalance = getFinalPurityWithAdjustment();
  const ownerGivesBalance =
    parseFloat(finalPurityForBalance) > parseFloat(totalBalance);
  const balanceDifference = Math.abs(
    parseFloat(finalPurityForBalance) - parseFloat(totalBalance)
  );

  useEffect(() => {
    setWastage(parseFloat(finalPurityForBalance || 0));
    console.log(
      "Wastage set to finalPurityForBalance:",
      finalPurityForBalance,
      "Current Wastage State:",
      wastage
    );
  }, [finalPurityForBalance]);

  const handleSaveInitialAssignment = async () => {
    setIsLoading(true);
    setError(null);
    setMessage("");

    try {
      const payload = {
        title: `Job for ${goldsmithName} - ${displayDate}`,
        description,
        artisanId,
        openingBalance: parseFloat(fixedOpeningBalance),
        totalInputPurity: parseFloat(format(totalPurity)),
        totalBalance: parseFloat(format(totalBalance)),
        metalInputs: goldRows.map((row) => ({
          weight: parseFloat(row.weight || 0),
          touch: parseFloat(row.touch || 0),
          purity: parseFloat(row.purity || 0),
        })),
      };

      console.log("Payload for initial assignment:", payload);

      const response = await fetch(`${BACKEND_SERVER_URL}/api/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create assignment");
      }

      const data = await response.json();
      setAssignmentId(data.id);

      const fullDataRes = await fetch(
        `${BACKEND_SERVER_URL}/api/assignments/${data.id}`
      );
      if (!fullDataRes.ok) {
        throw new Error("Failed to fetch newly created assignment details.");
      }
      const fullData = await fullDataRes.json();

      const jobCardData = {
        ...fullData,
        netWeight: parseFloat(netWeight),
        finalPurity: parseFloat(finalPurityForBalance),
        balanceDifference: parseFloat(balanceDifference),
        ownerGivesBalance,
        adjustmentType: percentageSymbol,
        adjustmentValue: parseFloat(touch || 0),
        date: displayDate,
        name: goldsmithName,
      };

      onSave(jobCardData);

      setMessage("Initial assignment saved successfully!");
      toast.success("Initial assignment saved successfully!", {
        autoClose: 3000,
      });
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAssignment = async () => {
    if (!assignmentId) {
      setError("No assignment ID found to update.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage("");

    try {
      const payload = {
        description: description,
        netWeight: parseFloat(netWeight),
        itemTouch: parseFloat(touch || 0),
        adjustmentType: percentageSymbol,
        finalPurity: parseFloat(finalPurityForBalance),
        balanceDirection: ownerGivesBalance ? "Owner" : "Artisan",
        balanceAmount: parseFloat(balanceDifference),
        wastage: parseFloat(wastage || 0),
        finishedProducts: itemRows.map((item) => ({
          id: item.id, 
          weight: parseFloat(item.weight || 0),
          itemType: item.name,
        })),
        materialLosses: deductionRows.map((deduction) => ({
          id: deduction.id,
          type: deduction.type,
          customType: deduction.type === "Others" ? deduction.customType : null,
          weight: parseFloat(deduction.weight || 0),
        })),
        metalInputs: goldRows.map((row) => ({
          id: row.id, 
          weight: parseFloat(row.weight || 0),
          touch: parseFloat(row.touch || 0),
          purity: parseFloat(row.purity || 0),
        })),
      };

      console.log("Payload for update assignment:", payload);

      const response = await fetch(
        `${BACKEND_SERVER_URL}/api/assignments/${assignmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update assignment");
      }

      const fullDataRes = await fetch(
        `${BACKEND_SERVER_URL}/api/assignments/${assignmentId}`
      );
      if (!fullDataRes.ok) {
        throw new Error("Failed to fetch updated assignment details.");
      }
      const fullData = await fullDataRes.json();

      const jobCardData = {
        ...fullData,
        netWeight: parseFloat(netWeight),
        finalPurity: parseFloat(finalPurityForBalance),
        balanceDifference: parseFloat(balanceDifference),
        ownerGivesBalance,
        adjustmentType: percentageSymbol,
        adjustmentValue: parseFloat(touch || 0),
        date: displayDate,
        name: goldsmithName,
      };
      toast.success("Assignment updated successfully!", { autoClose: 3000 });
      onSave(jobCardData);
      setMessage("Assignment updated successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const isItemDeliveryEnabled = assignmentId !== null;

  return (
    <>
      <ToastContainer position="top-center" />
      <Dialog
        open={true}
        onClose={onClose}
        fullWidth
        maxWidth="xl"
        scroll="paper"
        sx={{
          "& .MuiDialog-paper": {
            width: "95%",
            minWidth: "800px",
          },
        }}
      >
        <DialogContent>
          {isLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                zIndex: 1000,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <div className="container">
            <div className="header">
              <div className="header-item">
                <span className="header-label">Name:</span> {goldsmithName}
              </div>
              <div className="header-item">
                <span className="header-label">Date:</span> {displayDate}
              </div>
            </div>

            <div className="section">
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="textarea"
                placeholder="Enter job description..."
                disabled={isLoading || assignmentId !== null}
              />
            </div>

            <div className="section">
              <h3 className="section-title">Gold Calculation</h3>
              {goldRows.map((row, i) => (
                <div key={row.id || `gold-${i}`} className="row">
                  {" "}
           
                  <input
                    type="number"
                    placeholder="Weight"
                    value={row.weight}
                    onChange={(e) =>
                      handleGoldRowChange(i, "weight", e.target.value)
                    }
                    className="input"
                    disabled={isLoading || assignmentId !== null}
                  />
                  <span className="operator">x</span>
                  <input
                    type="number"
                    placeholder="Touch"
                    value={row.touch}
                    onChange={(e) =>
                      handleGoldRowChange(i, "touch", e.target.value)
                    }
                    className="input"
                    disabled={isLoading || assignmentId !== null}
                  />
                  <span className="operator">=</span>
                  <input
                    type="text"
                    readOnly
                    placeholder="Purity"
                    value={format(row.purity)}
                    className="input-read-only"
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  setGoldRows([
                    ...goldRows,
                    { id: null, weight: "", touch: "", purity: "" }, 
                  ])
                }
                className="circle-button"
                disabled={isLoading || assignmentId !== null}
              >
                +
              </button>
              <div className="total-purity-container">
                <span className="total-purity-label">Total Purity:</span>
                <span className="total-purity-value">
                  {format(totalPurity)}
                </span>
              </div>
            </div>

            <div className="section">
              <h3 className="section-title">Balance</h3>
              <div className="balance-block">
                <div className="balance-display-row">
                  <span className="balance-label">Opening Balance:</span>
                  <span className="balance-value">
                    {format(fixedOpeningBalance)}
                  </span>
                </div>
                <div className="balance-display-row">
                  <span className="balance-label">Total Purity:</span>
                  <span className="balance-value">{format(totalPurity)}</span>
                </div>
                <div>----------</div>
                <div className="balance-display-row">
                  <span className="balance-label">Total Balance:</span>
                  <span className="balance-value">{format(totalBalance)}</span>
                </div>
              </div>
            </div>

            <div
              className="section"
              style={{
                opacity: isItemDeliveryEnabled ? 1 : 0.5,
                pointerEvents: isItemDeliveryEnabled ? "auto" : "none",
              }}
            >
              <h3 className="section-title">Item Delivery</h3>
              {itemRows.map((item, i) => (
                <div key={item.id || `item-${i}`} className="row">
                  {" "}
             
                  <input
                    type="number"
                    placeholder="Item Weight"
                    value={item.weight}
                    onChange={(e) =>
                      handleItemRowChange(i, "weight", e.target.value)
                    }
                    className="input"
                    disabled={isLoading || !isItemDeliveryEnabled}
                  />
                  <select
                    value={item.name}
                    onChange={(e) =>
                      handleItemRowChange(i, "name", e.target.value)
                    }
                    className="select"
                    disabled={isLoading || !isItemDeliveryEnabled}
                  >
                    <option value="">Select Item</option>

                    {masterItemOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <button
                onClick={
                  () =>
                    setItemRows([
                      ...itemRows,
                      { id: null, weight: "", name: "" },
                    ]) 
                }
                className="circle-button"
                disabled={isLoading || !isItemDeliveryEnabled}
              >
                +
              </button>
              <div className="total-purity-container">
                <span className="total-purity-label">Total Item Weight:</span>
                <span className="total-purity-value">
                  {format(totalItemWeight)}
                </span>
              </div>

              <div className="deduction-section">
                <h4>Deductions</h4>
                {deductionRows.map((deduction, i) => (
                  <div
                    key={deduction.id || `deduction-${i}`}
                    className="deduction-row"
                  >
                    {" "}
             
                    <select
                      value={deduction.type}
                      onChange={(e) =>
                        handleDeductionChange(i, "type", e.target.value)
                      }
                      className="deduction-select"
                      disabled={isLoading || !isItemDeliveryEnabled}
                    >
                      {stoneOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {deduction.type === "Others" && (
                      <input
                        type="text"
                        placeholder="Specify type"
                        value={deduction.customType}
                        onChange={(e) =>
                          handleDeductionChange(i, "customType", e.target.value)
                        }
                        className="deduction-input"
                        disabled={isLoading || !isItemDeliveryEnabled}
                      />
                    )}
                    <input
                      type="number"
                      value={deduction.weight}
                      onChange={(e) =>
                        handleDeductionChange(i, "weight", e.target.value)
                      }
                      className="deduction-input"
                      placeholder="Weight"
                      disabled={isLoading || !isItemDeliveryEnabled}
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    setDeductionRows([
                      ...deductionRows,
                      { id: null, type: "Stone", customType: "", weight: "" }, 
                    ])
                  }
                  className="circle-button"
                  disabled={isLoading || !isItemDeliveryEnabled}
                >
                  +
                </button>
                <div className="total-purity-container">
                  <span className="total-purity-label">
                    Total Stone Weight:
                  </span>
                  <span className="total-purity-value">
                    {format(totalDeductionWeight)}
                  </span>
                </div>
              </div>

              <div className="net-weight-display">
                <span className="header-label">Net Weight:</span>
                <span className="net-weight-value" style={{ color: "blue" }}>
                  {netWeight}
                </span>
              </div>

              <div className="input-group-fluid" style={{ marginTop: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    style={{ width: "6rem" }}
                    value={percentageSymbol}
                    onChange={(e) => setPercentageSymbol(e.target.value)}
                    className="select-small"
                    disabled={isLoading || !isItemDeliveryEnabled}
                  >
                    {symbolOptions.map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Enter Value"
                    value={touch}
                    onChange={(e) => setTouch(e.target.value)}
                    className="input"
                    disabled={isLoading || !isItemDeliveryEnabled}
                  />

                  <span className="operator">=</span>
                  <span className="net-weight-value" style={{ color: "red" }}>
                    {finalPurityForBalance}
                  </span>
                </div>
              </div>
            </div>

            {parseFloat(netWeight) !== 0 && (
              <div className="final-balance-section">
                {ownerGivesBalance ? (
                  <p className="balance-text-owner">
                    Owner should give balance:
                    <span className="balance-amount">
                      {format(balanceDifference)}
                    </span>
                  </p>
                ) : (
                  <p className="balance-text-goldsmith">
                    Goldsmith should give balance:
                    <span className="balance-amount">
                      {format(balanceDifference)}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {error && (
              <p style={{ color: "red", marginBottom: "10px" }}>
                Error: {error}
              </p>
            )}
            {message && (
              <p style={{ color: "green", marginBottom: "10px" }}>{message}</p>
            )}
            <Button
              variant="contained"
              color={assignmentId ? "primary" : "success"}
              onClick={
                assignmentId
                  ? handleUpdateAssignment
                  : handleSaveInitialAssignment
              }
              disabled={isLoading}
            >
              {assignmentId ? "UPDATE JOB CARD" : "SAVE INITIAL"}
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewJobCard;






















