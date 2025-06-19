
import React, { useState } from "react";
import { useParams } from "react-router-dom";

const format = (val) =>
  isNaN(parseFloat(val)) ? "" : parseFloat(val).toFixed(3);

const NewJobCard = () => {
  const { name } = useParams();
  const today = new Date().toISOString().split("T")[0];

  const [description, setDescription] = useState("");

  const [rows, setRows] = useState([{ weight: "", touch: "", purity: "" }]);

  const [balance1, setBalance1] = useState("99.550");
  const [balance2, setBalance2] = useState("96.000");
  const openingBalance = 10.0;
  const finalBalance = format(balance1 - balance2);


  const [items, setItems] = useState([{ weight: "", name: "" }]);
  const [stoneWeight, setStoneWeight] = useState("");
  const [netWeight, setNetWeight] = useState("0.000");
  const [percentage, setPercentage] = useState("5");
  const [touch, setTouch] = useState("");

  const calculatePurity = (w, t) =>
    !isNaN(w) && !isNaN(t) ? ((w * t) / 100).toFixed(3) : "";

  const handleRowChange = (i, field, val) => {
    const copy = [...rows];
    copy[i][field] = val;
    copy[i].purity = calculatePurity(copy[i].weight, copy[i].touch);
    setRows(copy);
  };

  const handleItemChange = (i, field, val) => {
    const updated = [...items];
    updated[i][field] = val;
    setItems(updated);

    const totalWeight = updated.reduce(
      (acc, cur) => acc + parseFloat(cur.weight || 0),
      0
    );
    const net = totalWeight - parseFloat(stoneWeight || 0);
    setNetWeight(format(net));
  };

  const handleStoneChange = (val) => {
    setStoneWeight(val);
    const total = items.reduce((sum, i) => sum + parseFloat(i.weight || 0), 0);
    setNetWeight(format(total - parseFloat(val || 0)));
  };

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <div>Name: {name}</div>
        <div>Date: {today}</div>
      </div>

    
      <div style={styles.section}>
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          style={styles.textarea}
        />
      </div>

 
      <div style={styles.section}>
        <h4>Gold Calculation</h4>
        {rows.map((row, i) => (
          <div key={i} style={styles.row}>
            <input
              type="number"
              placeholder="Weight"
              value={row.weight}
              onChange={(e) => handleRowChange(i, "weight", e.target.value)}
              style={styles.input}
            />
            <span>x</span>
            <input
              type="number"
              placeholder="Touch"
              value={row.touch}
              onChange={(e) => handleRowChange(i, "touch", e.target.value)}
              style={styles.input}
            />
            <span>=</span>
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
            setRows([...rows, { weight: "", touch: "", purity: "" }])
          }
          style={styles.plusBtn}
        >
          +
        </button>
      </div>

      {/* Balance */}
      <div style={styles.section}>
        <h4>Balance</h4>
        <div>Opening Balance = {format(openingBalance)}</div>
        <div style={styles.balanceBlock}>
          <div>Balance = {format(balance1)}</div>
          <div style={{ paddingLeft: "80px" }}>{format(balance2)}</div>
          <div style={styles.line}></div>
          <div style={{ fontWeight: "bold" }}>Balance = {finalBalance}</div>
        </div>
      </div>

      <div style={styles.section}>
        <h4>Item Delivery</h4>
        {items.map((item, i) => (
          <div key={i} style={styles.row}>
            <input
              type="number"
              placeholder="Item Weight"
              value={item.weight}
              onChange={(e) => handleItemChange(i, "weight", e.target.value)}
              style={styles.input}
            />
            <select
              value={item.name}
              onChange={(e) => handleItemChange(i, "name", e.target.value)}
              style={styles.input}
            >
              <option value="">Item Name</option>
              <option value="Ring">Ring</option>
              <option value="Chain">Chain</option>
              <option value="Bangle">Bangle</option>
            </select>
          </div>
        ))}
        <button
          onClick={() => setItems([...items, { weight: "", name: "" }])}
          style={styles.plusBtn}
        >
          +
        </button>

     
        <div style={{ marginTop: "10px" }}>
          <label>Stone (less): </label>
          <input
            type="number"
            value={stoneWeight}
            onChange={(e) => handleStoneChange(e.target.value)}
            style={styles.input}
          />
          <div>Net Weight = {netWeight}</div>
        </div>


        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <select
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            style={styles.input}
          >
            <option value="5">5%</option>
            <option value="6">6%</option>
            <option value="7">7%</option>
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
    maxWidth: "700px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "monospace",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 0 6px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold",
    fontSize: "18px",
    marginBottom: "20px",
  },
  section: {
    marginBottom: "25px",
  },
  textarea: {
    width: "100%",
    padding: "8px",
    fontSize: "14px",
  },
  row: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
  },
  input: {
    padding: "6px 8px",
    width: "120px",
    fontSize: "14px",
  },
  inputReadOnly: {
    padding: "6px 8px",
    width: "120px",
    fontSize: "14px",
    backgroundColor: "#e9ecef",
    border: "1px solid #ccc",
  },
  plusBtn: {
    fontSize: "20px",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    border: "none",
    backgroundColor: "#28a745",
    color: "#fff",
    cursor: "pointer",
  },
  balanceBlock: {
    marginTop: "10px",
    lineHeight: "1.6",
  },
  line: {
    borderTop: "1px solid #000",
    width: "160px",
    marginLeft: "80px",
    margin: "4px 0",
  },
};

export default NewJobCard;
