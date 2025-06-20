
import React, { useState } from "react";
import { useParams } from "react-router-dom";


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


  const [balance1, setBalance1] = useState(""); 
  const [balance2, setBalance2] = useState(""); 


  const finalBalance = format(
    parseFloat(balance1 || 0) - parseFloat(balance2 || 0)
  );

  const [stoneWeight, setStoneWeight] = useState("");
  const [netWeight, setNetWeight] = useState("0.000"); 
  const [percentageSymbol, setPercentageSymbol] = useState("%"); 
  const [touch, setTouch] = useState("");


  const symbolOptions = ["%", "+"];

 
  const itemOptions = [
    "Ring",
    "Chain",
    "Bangle",
  ];

 
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
   
    const totalWeight = updated.reduce(
      (acc, cur) => acc + parseFloat(cur.weight || 0),
      0
    );
    const net = totalWeight - parseFloat(stoneWeight || 0);
    setNetWeight(format(net));
  };

  const handleStoneChange = (val) => {
    setStoneWeight(val);
    const total = itemRows.reduce(
      (sum, i) => sum + parseFloat(i.weight || 0),
      0
    );
    setNetWeight(format(total - parseFloat(val || 0)));
  };

  return (
    <div style={styles.container}>
    
      <div style={styles.header}>
        <div style={styles.headerItem}>
          <span style={styles.headerLabel}>Name:</span> {name}
        </div>
        <div style={styles.headerItem}>
          <span style={styles.headerLabel}>Date:</span> {today}
        </div>
      </div>

     
      <div style={styles.section}>
        <label htmlFor="description" style={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          style={styles.textarea}
          placeholder="Enter job description..."
        />
      </div>

     
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Gold Calculation</h3>
        {goldRows.map((row, i) => (
          <div key={i} style={styles.row}>
            <input
              type="number"
              placeholder="Weight"
              value={row.weight}
              onChange={(e) => handleGoldRowChange(i, "weight", e.target.value)}
              style={styles.input}
            />
            <span style={styles.operator}>x</span>
            <input
              type="number"
              placeholder="Touch"
              value={row.touch}
              onChange={(e) => handleGoldRowChange(i, "touch", e.target.value)}
              style={styles.input}
            />
            <span style={styles.operator}>=</span>
            <input
              type="text"
              readOnly
              placeholder="Purity"
              value={format(row.purity)}
              style={styles.inputReadOnly}
            />
          </div>
        ))}
        <button
          onClick={() =>
            setGoldRows([...goldRows, { weight: "", touch: "", purity: "" }])
          }
          style={styles.circleButton}
        >
          +
        </button>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Balance</h3>
        <div style={styles.balanceBlock}>
          <div style={styles.balanceDisplayRow}>
            <span style={styles.balanceLabel}>Opening Balance:</span>
            <span style={styles.balanceValue}>
              {format(fixedOpeningBalance)}
            </span>
          </div>

          <div style={styles.balanceCalculationGroup}>
            <div style={styles.balanceInputRow}>
              <span style={styles.balanceLabel}>Balance:</span>
              <input
                type="number"
                value={balance1}
                onChange={(e) => setBalance1(e.target.value)}
                style={styles.balanceInput}
                placeholder="0.000"
              />
            </div>
            <div style={styles.balanceInputRow}>
              <span style={styles.balanceLabel}></span>{" "}
           
              <input
                type="number"
                value={balance2}
                onChange={(e) => setBalance2(e.target.value)}
                style={styles.balanceInput}
                placeholder="0.000"
              />
            </div>
            <div style={styles.balanceLine}></div>{" "}
       
            <div style={styles.finalBalance}>Balance: {finalBalance}</div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Item Delivery</h3>
        {itemRows.map((item, i) => (
          <div key={i} style={styles.row}>
            <input
              type="number"
              placeholder="Item Weight"
              value={item.weight}
              onChange={(e) => handleItemRowChange(i, "weight", e.target.value)}
              style={styles.input}
            />
            <select
              value={item.name}
              onChange={(e) => handleItemRowChange(i, "name", e.target.value)}
              style={styles.select}
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
          style={styles.circleButton}
        >
          +
        </button>

        <div style={styles.inputGroup}>
          <label htmlFor="stoneWeight" style={styles.label}>
            Stone (less):
          </label>
          <input
            id="stoneWeight"
            type="number"
            value={stoneWeight}
            onChange={(e) => handleStoneChange(e.target.value)}
            style={styles.input}
            placeholder="0.000"
          />
        </div>
        <div style={styles.netWeightDisplay}>
          Net Weight = <span style={styles.netWeightValue}>{netWeight}</span>
        </div>

        <div style={styles.inputGroupFluid}>
          <select
            value={percentageSymbol}
            onChange={(e) => setPercentageSymbol(e.target.value)}
            style={styles.selectSmall}
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
            style={styles.input}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "30px auto",
    padding: "30px",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "15px",
    borderBottom: "1px solid #f0f0f0",
  },
  headerItem: {
    fontSize: "1.1rem",
    color: "#333",
  },
  headerLabel: {
    fontWeight: "bold",
    marginRight: "5px",
    color: "#555",
  },
  section: {
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#fefefe",
    borderRadius: "8px",
    border: "1px solid #f5f5f5",
  },
  sectionTitle: {
    fontSize: "1.4rem",
    color: "#2c3e50",
    marginBottom: "20px",
    borderBottom: "2px solid #3498db",
    paddingBottom: "10px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#555",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "vertical",
    boxSizing: "border-box",
    transition: "border-color 0.3s ease",
    "&:focus": {
      borderColor: "#3498db",
      outline: "none",
    },
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
  },
  input: {
    flex: "1",
    padding: "10px 12px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    minWidth: "100px",
    transition: "border-color 0.3s ease",
    "&:focus": {
      borderColor: "#3498db",
      outline: "none",
    },
  },
  operator: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#777",
  },
  inputReadOnly: {
    flex: "1",
    padding: "10px 12px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#f5f5f5",
    color: "#666",
    cursor: "not-allowed",
    boxSizing: "border-box",
    minWidth: "100px",
  },
  circleButton: {
    fontSize: "1.5rem",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    border: "none",
    backgroundColor: "#3498db", 
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    "&:hover": {
      backgroundColor: "#2980b9",
      transform: "scale(1.05)",
    },
    "&:active": {
      backgroundColor: "#2471a3",
      transform: "scale(1.0)",
    },
  },
  balanceBlock: {
    padding: "15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "1px dashed #e0e0e0",
  },
  balanceDisplayRow: {
    
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    paddingBottom: "5px",
    borderBottom: "1px solid #eee", 
  },
  balanceCalculationGroup: {
 
    marginTop: "15px",
  },
  balanceInputRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", 
    marginBottom: "8px",
  },
  balanceLabel: {
    flexShrink: 0,
    width: "150px", 
    fontWeight: "normal",
    color: "#555",
  },
  balanceValue: {
   
    fontWeight: "bold",
    color: "#333",
    fontSize: "1.1rem",
  },
  balanceInput: {
    padding: "8px 10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    width: "150px",
    transition: "border-color 0.3s ease",
    "&:focus": {
      borderColor: "#3498db",
      outline: "none",
    },
  },
  balanceLine: {
  
    borderTop: "1px solid #bbb",
    width: "150px", 
    marginLeft: "auto", 
    marginRight: "0",
    marginTop: "10px",
    marginBottom: "10px",
  },
  finalBalance: {
    fontWeight: "bold",
    fontSize: "1.2rem",
    color: "#34495e",
    textAlign: "right",
    paddingRight: "5px",
  },
  select: {
    flex: "1",
    padding: "10px 12px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
    boxSizing: "border-box",
    minWidth: "150px",
    transition: "border-color 0.3s ease",
    "&:focus": {
      borderColor: "#3498db",
      outline: "none",
    },
  },
  selectSmall: {
    width: "60px", 
    padding: "10px 8px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
    boxSizing: "border-box",
    textAlignLast: "center", 
    transition: "border-color 0.3s ease",
    "&:focus": {
      borderColor: "#3498db",
      outline: "none",
    },
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px",
    marginBottom: "10px",
  },
  inputGroupFluid: {
    display: "flex",
    gap: "15px",
    marginTop: "20px",
    alignItems: "center",
  },
  netWeightDisplay: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: "15px",
    textAlign: "right",
    paddingRight: "5px", // Small padding for alignment
  },
  netWeightValue: {
    color: "#e74c3c", // Highlight net weight
  },
};

export default NewJobCard;