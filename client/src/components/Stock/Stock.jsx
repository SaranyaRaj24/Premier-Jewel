import React, { useState, useEffect } from "react";
import "./Stock.css";
import { BACKEND_SERVER_URL } from "../../Config/Config";

const Stock = () => {
  const [allStockData, setAllStockData] = useState([]);
  const [filteredStockData, setFilteredStockData] = useState([]);
  const [stockSummary, setStockSummary] = useState([
    { label: "Total Items", value: 0 },
    { label: "Total Weight", value: "0g" },
    { label: "Total Wastage", value: "0" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch(`${BACKEND_SERVER_URL}/api/assignments`);
        if (!response.ok) {
          const errorBody = await response.text();
          try {
            const errorJson = JSON.parse(errorBody);
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${
                errorJson.error || "Unknown error"
              }`
            );
          } catch (e) {
            throw new Error(
              `HTTP error! status: ${
                response.status
              }, received non-JSON: ${errorBody.substring(0, 100)}...`
            );
          }
        }

        const data = await response.json();
        let allProcessed = [];

        data.forEach((assignment) => {
          const wastage = assignment.wastage
            ? parseFloat(assignment.wastage)
            : 0;

          const createdAtDate = new Date(assignment.createdAt);
          const rawDate = createdAtDate.toISOString().split("T")[0];
          const displayDate = createdAtDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          assignment.finishedProducts.forEach((product) => {
            allProcessed.push({
              type: product.itemType || "N/A",
              weight: parseFloat(product.weight || 0),
              wastage: wastage,
              status: "In Stock",
              rawDateIn: rawDate,
              displayDateIn: displayDate,
            });
          });
        });

        setAllStockData(allProcessed);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  useEffect(() => {
    const filtered = allStockData.filter((item) => {
      const matchesType =
        filterType === "" ||
        item.type.toLowerCase() === filterType.toLowerCase();
      const matchesStatus =
        filterStatus === "" ||
        (filterStatus === "in" && item.status === "In Stock") ||
        (filterStatus === "sold" && item.status === "Sold");
      const matchesDate = filterDate === "" || item.rawDateIn === filterDate;
      return matchesType && matchesStatus && matchesDate;
    });

    setFilteredStockData(filtered);

    const totalItems = filtered.length;
    const totalWeight = filtered.reduce((sum, item) => sum + item.weight, 0);
    const totalWastage = filtered.reduce((sum, item) => sum + item.wastage, 0);

    setStockSummary([
      { label: "Total Items", value: totalItems },
      { label: "Total Weight", value: `${totalWeight.toFixed(3)}g` },
      { label: "Total Wastage", value: `${totalWastage.toFixed(3)}` },
    ]);
  }, [allStockData, filterType, filterStatus, filterDate]);

  if (loading) {
    return <div className="stock-container">Loading stock data...</div>;
  }

  if (error) {
    return (
      <div className="stock-container error-message">
        <h2>Error Loading Stock:</h2>
        <p>{error}</p>
        <p>
          Please ensure the backend server is running at{" "}
          <b>{BACKEND_SERVER_URL}</b>
        </p>
      </div>
    );
  }

  const uniqueTypes = [...new Set(allStockData.map((item) => item.type))];

  return (
    <div className="stock-container">
      <h2 className="stock-heading">Stock Dashboard</h2>

      <div className="stock-summary">
        {stockSummary.map((item, index) => (
          <div key={index} className="stock-card">
            <p className="stock-label">{item.label}</p>
            <p className="stock-value">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="stock-filters">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {uniqueTypes.map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="in">In Stock</option>
          <option value="sold">Sold</option>
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <div className="stock-table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Serial No</th>
              <th>Type</th>
              <th>Wastage</th>
              <th>Weight (g)</th>
              <th>Status</th>
              <th>Date In</th>
            </tr>
          </thead>
          <tbody>
            {filteredStockData.length > 0 ? (
              filteredStockData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.type}</td>
                  <td>{item.wastage.toFixed(3)}</td>
                  <td>{item.weight.toFixed(3)}</td>
                  <td
                    className={
                      item.status === "Sold" ? "sold-status" : "in-stock-status"
                    }
                  >
                    {item.status}
                  </td>
                  <td>{item.displayDateIn}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No finished products in stock.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stock;
