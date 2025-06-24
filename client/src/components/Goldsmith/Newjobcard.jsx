import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import "./NewJobCard.css";

const format = (val) =>
  isNaN(parseFloat(val)) ? "" : parseFloat(val).toFixed(3);

const NewJobCard = () => {
  const { name } = useParams();
  const today = new Date().toLocaleDateString("en-IN");

  const [description, setDescription] = useState("");
  const [goldRows, setGoldRows] = useState([
    { weight: "", touch: "", purity: "" },
  ]);
  const [itemRows, setItemRows] = useState([{ weight: "", name: "" }]);
  const [deductionRows, setDeductionRows] = useState([
    { type: "Stone", customType: "", weight: "" },
  ]);

  const fixedOpeningBalance = 10.0;

  const [netWeight, setNetWeight] = useState("0.000");
  const [touch, setTouch] = useState(""); 
  const [percentageSymbol, setPercentageSymbol] = useState("%");

  const [itemTouch, setItemTouch] = useState("");
  const [itemPurity, setItemPurity] = useState("0.000");

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
    setItemPurity(calculatePurity(totalItemWeight, parseFloat(itemTouch)));
  }, [totalItemWeight, itemTouch]);

  useEffect(() => {
    let calculatedNetWeight = totalItemWeight - totalDeductionWeight;
    setNetWeight(format(calculatedNetWeight));
  }, [itemRows, deductionRows]);

  const getFinalPurityWithAdjustment = () => {
    const base = parseFloat(netWeight);

    if (isNaN(base)) return "0.000";

    const adjustment = parseFloat(touch);
    if (isNaN(adjustment)) return format(base);

    let finalValue = base;

    if (percentageSymbol === "%") {
      finalValue = (base * adjustment) / 100;
    } else if (percentageSymbol === "+") {
      finalValue += adjustment;
    }

    return format(finalValue);
  };

  const finalPurityForBalance = getFinalPurityWithAdjustment();

  const ownerGivesBalance =
    parseFloat(finalPurityForBalance) > parseFloat(totalBalance);

  const balanceDifference = Math.abs(
    parseFloat(finalPurityForBalance) - parseFloat(totalBalance)
  );

  const symbolOptions = ["%", "+"];
  const itemOptions = ["Ring", "Chain", "Bangle"];
  const stoneOptions = ["Stone", "Enamel", "Beads", "Others"];

  return (
    <div className="container">
      <div className="header">
        <div className="header-item">
          <span className="header-label">Name:</span> {name}
        </div>
        <div className="header-item">
          <span className="header-label">Date:</span> {today}
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
        />
      </div>

      <div className="section">
        <h3 className="section-title">Gold Calculation</h3>
        {goldRows.map((row, i) => (
          <div key={i} className="row">
            <input
              type="number"
              placeholder="Weight"
              value={row.weight}
              onChange={(e) => handleGoldRowChange(i, "weight", e.target.value)}
              className="input"
            />
            <span className="operator">x</span>
            <input
              type="number"
              placeholder="Touch"
              value={row.touch}
              onChange={(e) => handleGoldRowChange(i, "touch", e.target.value)}
              className="input"
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
            setGoldRows([...goldRows, { weight: "", touch: "", purity: "" }])
          }
          className="circle-button"
        >
          +
        </button>
        <div className="total-purity-container">
          <span className="total-purity-label">Total Purity:</span>
          <span className="total-purity-value">{format(totalPurity)}</span>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Balance</h3>
        <div className="balance-block">
          <div className="balance-display-row">
            <span className="balance-label">Opening Balance:</span>
            <span className="balance-value">{format(fixedOpeningBalance)}</span>
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

      <div className="section">
        <h3 className="section-title">Item Delivery</h3>
        {itemRows.map((item, i) => (
          <div key={i} className="row">
            <input
              type="number"
              placeholder="Item Weight"
              value={item.weight}
              onChange={(e) => handleItemRowChange(i, "weight", e.target.value)}
              className="input"
            />
            <select
              value={item.name}
              onChange={(e) => handleItemRowChange(i, "name", e.target.value)}
              className="select"
            >
              <option value="">Select Item</option>
              {itemOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          onClick={() => setItemRows([...itemRows, { weight: "", name: "" }])}
          className="circle-button"
        >
          +
        </button>
        <div className="total-purity-container">
          <span className="total-purity-label">Total Item Weight:</span>
          <span className="total-purity-value">{format(totalItemWeight)}</span>
        </div>

        <div className="deduction-section">
          <h4>Deductions </h4>
          {deductionRows.map((deduction, i) => (
            <div key={i} className="deduction-row">
              <select
                value={deduction.type}
                onChange={(e) =>
                  handleDeductionChange(i, "type", e.target.value)
                }
                className="deduction-select"
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
              />
            </div>
          ))}
          <button
            onClick={() =>
              setDeductionRows([
                ...deductionRows,
                { type: "Stone", customType: "", weight: "" },
              ])
            }
            className="circle-button"
          >
            +
          </button>
          <div className="total-purity-container">
            <span className="total-purity-label">Total Stone Weight:</span>
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
              value={percentageSymbol}
              onChange={(e) => setPercentageSymbol(e.target.value)}
              className="select-small"
            >
              {symbolOptions.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Wastage Value"
              value={touch}
              onChange={(e) => setTouch(e.target.value)}
              className="input"
            />
            <span className="operator">=</span>
            <span className="net-weight-value" style={{ color: "red" }}>
              {finalPurityForBalance}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <Button variant="contained" color="success">
          SAVE
        </Button>
      </div>

      {parseFloat(netWeight) !== 0 && (
        <div className="final-balance-section">
          {ownerGivesBalance ? (
            <p className="balance-text-owner">
              Owner should give balance:{" "}
              <span className="balance-amount">
                {format(balanceDifference)}
              </span>
            </p>
          ) : (
            <p className="balance-text-goldsmith">
              Goldsmith should give balance:{" "}
              <span className="balance-amount">
                {format(balanceDifference)}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NewJobCard;
