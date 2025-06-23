import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./NewJobCard.css"; 

const format = (val) =>
  isNaN(parseFloat(val)) ? "" : parseFloat(val).toFixed(3);

const NewJobCard = () => {
  const { name } = useParams();
  const today = new Date().toISOString().split("T")[0];
  const [description, setDescription] = useState("");
  const [goldRows, setGoldRows] = useState([
    { weight: "", touch: "", purity: "" },
  ]);
  const [itemRows, setItemRows] = useState([{ weight: "", name: "" }]);
  const fixedOpeningBalance = 10.0;
  const [deductionRows, setDeductionRows] = useState([
    { type: "Stone", customType: "", weight: "" },
  ]);
  const [netWeight, setNetWeight] = useState("0.000");
  const [percentageSymbol, setPercentageSymbol] = useState("%");
  const [touch, setTouch] = useState("");

  const totalPurity = goldRows.reduce(
    (sum, row) => sum + parseFloat(row.purity || 0),
    0
  );
  const totalBalance = parseFloat(fixedOpeningBalance) + totalPurity;

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

  useEffect(() => {
    const totalItemWeight = itemRows.reduce(
      (sum, item) => sum + parseFloat(item.weight || 0),
      0
    );

    const totalDeductionWeight = deductionRows.reduce(
      (sum, deduction) => sum + parseFloat(deduction.weight || 0),
      0
    );

    let calculatedNetWeight = totalItemWeight + totalDeductionWeight;

    if (!isNaN(parseFloat(touch)) && calculatedNetWeight !== 0) {
      const touchValue = parseFloat(touch);
      if (percentageSymbol === "%") {
        const percentageToAdd = (calculatedNetWeight * touchValue) / 100;
        calculatedNetWeight += percentageToAdd;
      } else if (percentageSymbol === "+") {
        calculatedNetWeight += touchValue;
      }
    }
    setNetWeight(format(calculatedNetWeight));
  }, [itemRows, deductionRows, percentageSymbol, touch]);

  const symbolOptions = ["%", "+"];
  const itemOptions = ["Ring", "Chain", "Bangle"];
  const stoneOptions = ["Stone", "Enamel", "Beeds", "Others"];

  const ownerGivesBalance =
    parseFloat(netWeight) > parseFloat(format(totalBalance));
  const balanceDifference = Math.abs(
    parseFloat(netWeight) - parseFloat(format(totalBalance))
  );

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
        <div className="deduction-section">
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
        </div>
        <div className="net-weight-display">
          Net Weight = <span className="net-weight-value">{netWeight}</span>
        </div>
        <div className="input-group-fluid">
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
            placeholder="Touch"
            value={touch}
            onChange={(e) => setTouch(e.target.value)}
            className="input"
          />
        </div>
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








