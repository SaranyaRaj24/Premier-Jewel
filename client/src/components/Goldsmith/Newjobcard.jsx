
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
import "./Newjobcard.css";

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
    {
      id: null,
      weight: "",
      name: "",
      wastageValue: "",
      wastageType: "Touch",
      deductions: [{ id: null, type: "Stone", customType: "", weight: "" }],
    },
  ]);
  const [receivedMetalReturns, setReceivedMetalReturns] = useState([
    { id: null, weight: "", touch: "", purity: "" },
  ]);
  const [openingBalance, setOpeningBalance] = useState(0.0);
  const [netWeight, setNetWeight] = useState("0.000");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

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
        setMasterItemOptions(data.map((item) => item.itemName));
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
    const fetchGoldsmithLastBalance = async () => {
      if (!artisanId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${BACKEND_SERVER_URL}/api/assignments/artisans/${artisanId}/last-balance`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setOpeningBalance(0.0);
          } else {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch last Balance: ${response.status} ${response.statusText} - ${errorText}`
            );
          }
        } else {
          const data = await response.json();
          let lastBalance = parseFloat(data.balanceAmount || 0);
          if (data.balanceDirection === "Goldsmith") {
            lastBalance = lastBalance;
          } else {
            lastBalance = -lastBalance;
          }
          setOpeningBalance(lastBalance);
        }
      } catch (err) {
        console.error("Error fetching goldsmith's last balance:", err);
        setError(`Failed to load opening balance: ${err.message}`);
        setOpeningBalance(0.0);
      } finally {
        setIsLoading(false);
      }
    };
    if (!initialData && artisanId) {
      fetchGoldsmithLastBalance();
    }
  }, [artisanId, initialData]);

  useEffect(() => {
    if (initialData) {
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
              wastageValue:
                product.adjustmentValue !== undefined
                  ? String(product.adjustmentValue)
                  : "",
              wastageType: product.adjustmentType || "Touch",
              deductions:
                product.materialLosses && product.materialLosses.length > 0
                  ? product.materialLosses.map((loss) => ({
                      id: loss.id,
                      type: loss.type || "Stone",
                      customType: loss.customType || "",
                      weight:
                        loss.weight !== undefined ? String(loss.weight) : "",
                    }))
                  : [{ id: null, type: "Stone", customType: "", weight: "" }],
            }))
          : [
              {
                id: null,
                weight: "",
                name: "",
                wastageValue: "",
                wastageType: "Touch",
                deductions: [
                  { id: null, type: "Stone", customType: "", weight: "" },
                ],
              },
            ]
      );
      setReceivedMetalReturns(
        initialData.receivedMetalReturns &&
          initialData.receivedMetalReturns.length > 0
          ? initialData.receivedMetalReturns.map((received) => ({
              id: received.id,
              weight:
                received.weight !== undefined ? String(received.weight) : "",
              touch: received.touch !== undefined ? String(received.touch) : "",
              purity:
                received.purity !== undefined ? String(received.purity) : "",
            }))
          : [{ id: null, weight: "", touch: "", purity: "" }]
      );
      setNetWeight(
        initialData.netWeight !== undefined
          ? format(initialData.netWeight)
          : "0.000"
      );
      setDisplayDate(
        initialData.date
          ? new Date(initialData.date).toLocaleDateString("en-IN")
          : new Date().toLocaleDateString("en-IN")
      );
      setOpeningBalance(
        initialData.openingBalance !== undefined
          ? parseFloat(initialData.openingBalance)
          : 0.0
      );
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

  const handleDeductionChange = (itemIndex, deductionIndex, field, val) => {
    const updated = [...itemRows];
    updated[itemIndex].deductions[deductionIndex][field] = val;
    setItemRows(updated);
  };

  const handleReceivedRowChange = (i, field, val) => {
    const copy = [...receivedMetalReturns];
    copy[i][field] = val;
    copy[i].purity = calculatePurity(
      parseFloat(copy[i].weight),
      parseFloat(copy[i].touch)
    );
    setReceivedMetalReturns(copy);
  };

  const totalInputPurityGiven = goldRows.reduce(
    (sum, row) => sum + parseFloat(row.purity || 0),
    0
  );

  const totalItemWeight = itemRows.reduce(
    (sum, item) => sum + parseFloat(item.weight || 0),
    0
  );

  const totalDeductionWeight = itemRows.reduce(
    (sum, item) =>
      sum +
      item.deductions.reduce(
        (dSum, deduction) => dSum + parseFloat(deduction.weight || 0),
        0
      ),
    0
  );

  const totalFinishedPurity = itemRows.reduce((sum, item) => {
    const totalDeductions = item.deductions.reduce(
      (dSum, deduction) => dSum + parseFloat(deduction.weight || 0),
      0
    );
    const itemNetWeight = parseFloat(item.weight || 0) - totalDeductions;
    const wastageValue = parseFloat(item.wastageValue || 0);
    let itemFinalPurity = 0;

    if (item.wastageType === "Touch") {
      itemFinalPurity = (itemNetWeight * wastageValue) / 100;
    } else if (item.wastageType === "%") {
      itemFinalPurity = itemNetWeight + (itemNetWeight * wastageValue) / 100;
    } else if (item.wastageType === "+") {
      itemFinalPurity = itemNetWeight + wastageValue;
    }
    return sum + itemFinalPurity;
  }, 0);

  const totalReceivedPurity = receivedMetalReturns.reduce(
    (sum, row) => sum + parseFloat(row.purity || 0),
    0
  );
  useEffect(() => {
    let calculatedNetWeight = totalItemWeight - totalDeductionWeight;
    setNetWeight(format(calculatedNetWeight));
  }, [itemRows, totalItemWeight, totalDeductionWeight]);

  const totalGivenToGoldsmith = openingBalance + totalInputPurityGiven;
  const totalFromGoldsmith = totalFinishedPurity + totalReceivedPurity;
  const ownerGivesBalance = totalFromGoldsmith > totalGivenToGoldsmith;
  const balanceDifference = Math.abs(
    totalFromGoldsmith - totalGivenToGoldsmith
  );

  const handleSaveInitialAssignment = async () => {
    setIsLoading(true);
    setError(null);
    setMessage("");

    try {
      const payload = {
        title: `Job for ${goldsmithName} - ${displayDate}`,
        description,
        artisanId,
        openingBalance: parseFloat(format(openingBalance)),
        totalInputPurity: parseFloat(format(totalInputPurityGiven)),
        totalBalance: parseFloat(format(totalGivenToGoldsmith)),
        metalInputs: goldRows.map((row) => ({
          weight: parseFloat(row.weight || 0),
          touch: parseFloat(row.touch || 0),
          purity: parseFloat(row.purity || 0),
        })),
      };

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
        finalPurity: parseFloat(totalFinishedPurity),
        totalReceivedPurity: parseFloat(totalReceivedPurity),
        balanceDifference: parseFloat(balanceDifference),
        ownerGivesBalance,
        date: displayDate,
        name: goldsmithName,
      };

      onSave(jobCardData);

      setMessage("Initial Assignment saved successfully!");
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
        description,
        netWeight: parseFloat(netWeight),
        itemTouch: parseFloat(totalFinishedPurity),
        finalPurity: parseFloat(totalFinishedPurity),
        totalReceivedPurity: parseFloat(totalReceivedPurity),
        balanceDirection: ownerGivesBalance ? "Owner" : "Goldsmith",
        balanceAmount: parseFloat(balanceDifference),
        finishedProducts: itemRows.map((item) => ({
          id: item.id,
          weight: parseFloat(item.weight || 0),
          itemType: item.name,
          adjustmentValue: parseFloat(item.wastageValue || 0),
          adjustmentType: item.wastageType,
        })),
        materialLosses: itemRows.flatMap((item) =>
          item.deductions.map((deduction) => ({
            id: deduction.id,
            type: deduction.type,
            customType:
              deduction.type === "Others" ? deduction.customType : null,
            weight: parseFloat(deduction.weight || 0),
          }))
        ),
        metalInputs: goldRows.map((row) => ({
          id: row.id,
          weight: parseFloat(row.weight || 0),
          touch: parseFloat(row.touch || 0),
          purity: parseFloat(row.purity || 0),
        })),
        receivedMetalReturns: receivedMetalReturns.map((row) => ({
          id: row.id,
          weight: parseFloat(row.weight || 0),
          touch: parseFloat(row.touch || 0),
          purity: parseFloat(row.purity || 0),
        })),
        openingBalance: parseFloat(format(openingBalance)),
        totalInputPurity: parseFloat(format(totalInputPurityGiven)),
        totalBalance: parseFloat(format(totalGivenToGoldsmith)),
      };

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
        finalPurity: parseFloat(totalFinishedPurity),
        totalReceivedPurity: parseFloat(totalReceivedPurity),
        balanceDifference: parseFloat(balanceDifference),
        ownerGivesBalance,
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
  const isReceivedSectionEnabled = assignmentId !== null;

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
            width: "96%",
            minWidth: "1100px",
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
                placeholder="Enter job Description...."
                disabled={isLoading || assignmentId !== null}
              />
            </div>

            <div className="section">
              <h3 className="section-title">Given Details</h3>
              {goldRows.map((row, i) => (
                <div key={row.id || `gold-${i}`} className="row">
                  <input
                    type="number"
                    placeholder="Weight"
                    value={row.weight}
                    onChange={(e) =>
                      handleGoldRowChange(i, "weight", e.target.value)
                    }
                    className="input"
                    disabled={isLoading || assignmentId !== null}
                    onWheel={(e) => e.target.blur()}
                  />
                  <span className="operator">x</span>
                  <input
                    type="number"
                    placeholder="Touch"
                    value={row.touch}
                    onChange={(e) =>
                      handleGoldRowChange(i, "touch", e.target.value)
                    }
                    onWheel={(e) => e.target.blur()}
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
                  {format(totalInputPurityGiven)}
                </span>
              </div>
            </div>

            <div className="section">
              <h3 className="section-title">Balance</h3>
              <div className="balance-block">
                <div className="balance-display-row">
                  <span className="balance-label">Opening Balance:</span>
                  <span className="balance-value">
                    {format(openingBalance)}
                  </span>
                </div>
                <div className="balance-display-row">
                  <span className="balance-label">Total Purity:</span>
                  <span className="balance-value">
                    {format(totalInputPurityGiven)}
                  </span>
                </div>
                <div>----------</div>
                <div className="balance-display-row">
                  <span className="balance-label">
                    Total Given to Goldsmith:
                  </span>
                  <span className="balance-value">
                    {format(totalGivenToGoldsmith)}
                  </span>
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
              <div className="item-delivery-container">
                <div className="item-delivery-header">
                  <span>Item Weight</span>
                  <span>Item Name</span>
                  <span>Deductions</span>
                  <span>Net Weight</span>
                  <span>Wastage Type</span>
                  <span>Wastage Value</span>
                  <span>Final Purity</span>
                </div>

                {itemRows.map((item, itemIndex) => {
                  const totalDeductions = item.deductions.reduce(
                    (sum, deduction) => sum + parseFloat(deduction.weight || 0),
                    0
                  );
                  const itemNetWeight =
                    parseFloat(item.weight || 0) - totalDeductions;
                  const wastageValue = parseFloat(item.wastageValue || 0);
                  let finalPurity = 0;

                  if (item.wastageType === "Touch") {
                    finalPurity = (itemNetWeight * wastageValue) / 100;
                  } else if (item.wastageType === "%") {
                    finalPurity =
                      itemNetWeight + (itemNetWeight * wastageValue) / 100;
                  } else if (item.wastageType === "+") {
                    finalPurity = itemNetWeight + wastageValue;
                  }

                  return (
                    <div
                      key={item.id || `item-${itemIndex}`}
                      className="item-delivery-row"
                    >
                      <input
                        type="number"
                        placeholder="Weight"
                        value={item.weight}
                        onChange={(e) =>
                          handleItemRowChange(
                            itemIndex,
                            "weight",
                            e.target.value
                          )
                        }
                        className="input-small"
                        disabled={isLoading || !isItemDeliveryEnabled}
                        onWheel={(e) => e.target.blur()}
                      />

                      <select
                        value={item.name}
                        onChange={(e) =>
                          handleItemRowChange(itemIndex, "name", e.target.value)
                        }
                        className="select-small"
                        disabled={isLoading || !isItemDeliveryEnabled}
                      >
                        <option value="">Item</option>
                        {masterItemOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      <div className="deductions-column">
                        {item.deductions.map((deduction, deductionIndex) => (
                          <div key={deductionIndex} className="deduction-row">
                            <select
                              value={deduction.type}
                              onChange={(e) =>
                                handleDeductionChange(
                                  itemIndex,
                                  deductionIndex,
                                  "type",
                                  e.target.value
                                )
                              }
                              className="select-small"
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
                                value={deduction.customType}
                                onChange={(e) =>
                                  handleDeductionChange(
                                    itemIndex,
                                    deductionIndex,
                                    "customType",
                                    e.target.value
                                  )
                                }
                                placeholder="Specify"
                                className="input-small"
                                disabled={isLoading || !isItemDeliveryEnabled}
                              />
                            )}

                            <input
                              type="number"
                              value={deduction.weight}
                              onChange={(e) =>
                                handleDeductionChange(
                                  itemIndex,
                                  deductionIndex,
                                  "weight",
                                  e.target.value
                                )
                              }
                              placeholder="Weight"
                              className="input-small"
                              disabled={isLoading || !isItemDeliveryEnabled}
                              onWheel={(e) => e.target.blur()}
                            />

                            <button
                              onClick={() => {
                                const updated = [...itemRows];
                                updated[itemIndex].deductions.splice(
                                  deductionIndex,
                                  1
                                );
                                setItemRows(updated);
                              }}
                              className="remove-button"
                              disabled={
                                isLoading ||
                                !isItemDeliveryEnabled ||
                                item.deductions.length <= 1
                              }
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const updated = [...itemRows];
                            updated[itemIndex].deductions.push({
                              id: null,
                              type: "Stone",
                              customType: "",
                              weight: "",
                            });
                            setItemRows(updated);
                          }}
                          className="add-deduction-button"
                          disabled={isLoading || !isItemDeliveryEnabled}
                        >
                          + 
                        </button>
                      </div>

                      <input
                        type="text"
                        readOnly
                        value={format(itemNetWeight)}
                        className="input-small input-read-only"
                      />

                      <select
                        value={item.wastageType}
                        onChange={(e) =>
                          handleItemRowChange(
                            itemIndex,
                            "wastageType",
                            e.target.value
                          )
                        }
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
                        placeholder="Value"
                        value={item.wastageValue}
                        onChange={(e) =>
                          handleItemRowChange(
                            itemIndex,
                            "wastageValue",
                            e.target.value
                          )
                        }
                        className="input-small"
                        disabled={isLoading || !isItemDeliveryEnabled}
                        onWheel={(e) => e.target.blur()}
                      />

                      <span className="final-purity-value">
                        {format(finalPurity)}
                      </span>
                    </div>
                  );
                })}

                <button
                  onClick={() => {
                    setItemRows([
                      ...itemRows,
                      {
                        id: null,
                        weight: "",
                        name: "",
                        wastageValue: "",
                        wastageType: "Touch",
                        deductions: [
                          {
                            id: null,
                            type: "Stone",
                            customType: "",
                            weight: "",
                          },
                        ],
                      },
                    ]);
                  }}
                  className="circle-button"
                  disabled={isLoading || !isItemDeliveryEnabled}
                >
                  +
                </button>
              </div>
              <div className="totals-section">
                <div className="total-row">
                  <span className="total-purity-label">Total Item Purity:</span>
                  <span className="total-purity-value">
                    {format(totalFinishedPurity)}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="section"
              style={{
                opacity: isReceivedSectionEnabled ? 1 : 0.5,
                pointerEvents: isReceivedSectionEnabled ? "auto" : "none",
              }}
            >
              <h3 className="section-title">Received Section</h3>
              <div className="received-section-container">
                <div className="received-section-header">
                  <span>Weight</span>
                  <span>Touch</span>
                  <span>Purity</span>
                </div>
                {receivedMetalReturns.map((row, i) => (
                  <div
                    key={row.id || `received-${i}`}
                    className="received-section-row"
                  >
                    <input
                      type="number"
                      placeholder="Weight"
                      value={row.weight}
                      onChange={(e) =>
                        handleReceivedRowChange(i, "weight", e.target.value)
                      }
                      className="input-small"
                      disabled={isLoading || !isReceivedSectionEnabled}
                      onWheel={(e) => e.target.blur()}
                    />
                    <span className="operator">x</span>
                    <input
                      type="number"
                      placeholder="Touch"
                      value={row.touch}
                      onChange={(e) =>
                        handleReceivedRowChange(i, "touch", e.target.value)
                      }
                      className="input-small"
                      disabled={isLoading || !isReceivedSectionEnabled}
                      onWheel={(e) => e.target.blur()}
                    />
                    <span className="operator">=</span>
                    <input
                      type="text"
                      readOnly
                      placeholder="Purity"
                      value={format(row.purity)}
                      className="input-read-only input-small"
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    setReceivedMetalReturns([
                      ...receivedMetalReturns,
                      { id: null, weight: "", touch: "", purity: "" },
                    ])
                  }
                  className="circle-button"
                  disabled={isLoading || !isReceivedSectionEnabled}
                >
                  +
                </button>
              </div>
              <div className="totals-section">
                <div className="total-row">
                  <span className="total-purity-label">
                    Total Received Purity:
                  </span>
                  <span className="total-purity-value">
                    {format(totalReceivedPurity)}
                  </span>
                </div>
              </div>
            </div>

            {parseFloat(totalGivenToGoldsmith) !== 0 && (
              <div className="final-balance-section">
                <h3 className="section-title">Final Balance</h3>
                <div className="balance-block">
                  <div className="balance-display-row">
                    <span className="balance-label">
                      Total Given to Goldsmith:
                    </span>
                    <span className="balance-value">
                      {format(totalGivenToGoldsmith)}
                    </span>
                  </div>
                  <div className="balance-display-row">
                    <span className="balance-label">Total From Goldsmith:</span>
                    <span className="balance-value">
                      {format(totalFromGoldsmith)}
                    </span>
                  </div>
                  <div>----------</div>
                  {ownerGivesBalance ? (
                    <p className="balance-text-owner">
                      Owner should give balance:
                      <span className="balance-amount">
                        {format(balanceDifference)}
                      </span>
                    </p>
                  ) : (
                    <p className="balance-text-artisan">
                      Goldsmith should give balance:
                      <span className="balance-amount">
                        {format(balanceDifference)}
                      </span>
                    </p>
                  )}
                </div>
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