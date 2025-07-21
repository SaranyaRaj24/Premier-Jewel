
import React, { useState, useEffect } from "react";
import "./Stock.css";
import { BACKEND_SERVER_URL } from "../../Config/Config";

const Stock = () => {
  const [allStockData, setAllStockData] = useState([]);
  const [filteredStockData, setFilteredStockData] = useState([]);
  const [stockSummary, setStockSummary] = useState([
    { label: "Total Items", value: 0 },
    { label: "Total Weight", value: "0g" },
    { label: "Total Wastage (Goldsmith)", value: "0g" },
    { label: "Total Purity (Jewel Stock)", value: "0g" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterSource, setFilterSource] = useState(""); 

  useEffect(() => {
    const fetchAllStockData = async () => {
      try {
        setLoading(true);
        const assignmentsResponse = await fetch(
          `${BACKEND_SERVER_URL}/api/assignments`
        );
        if (!assignmentsResponse.ok) {
          const errorBody = await assignmentsResponse.text();
          throw new Error(
            `HTTP error! Assignments status: ${
              assignmentsResponse.status
            }, message: ${errorBody.substring(0, 100)}...`
          );
        }
        const assignmentsData = await assignmentsResponse.json();

        const jewelStockResponse = await fetch(
          `${BACKEND_SERVER_URL}/api/jewel-stock`
        );
        if (!jewelStockResponse.ok) {
          const errorBody = await jewelStockResponse.text();
          throw new Error(
            `HTTP error! Jewel Stock status: ${
              jewelStockResponse.status
            }, message: ${errorBody.substring(0, 100)}...`
          );
        }
        const jewelStockData = await jewelStockResponse.json();

        let processedStock = [];

        assignmentsData.forEach((assignment) => {
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
            processedStock.push({
              id: `assign-${product._id || Math.random()}`, 
              type: product.itemType || "N/A",
              weight: parseFloat(product.weight || 0),
              wastage: wastage,
              status: "In Stock", 
              rawDateIn: rawDate,
              displayDateIn: displayDate,
              source: "Goldsmith", 
              purityValue: null, 
            });
          });
        });

        jewelStockData.forEach((jewel) => {
          const createdAtDate = new Date(jewel.createdAt || Date.now()); 
          const rawDate = createdAtDate.toISOString().split("T")[0];
          const displayDate = createdAtDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          processedStock.push({
            id: `jewel-${jewel._id || Math.random()}`, 
            type: jewel.jewelName || "N/A",
            weight: parseFloat(jewel.finalWeight || 0),
            stoneWeight: parseFloat(jewel.stoneWeight || 0),
            touch: parseFloat(jewel.touch || 0),
            purityValue: parseFloat(jewel.purityValue || 0),
            wastage: 0, 
            status: "In Stock", 
            rawDateIn: rawDate,
            displayDateIn: displayDate,
            source: "Jewel Stock", 
          });
        });

        setAllStockData(processedStock);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAllStockData();
  }, []); 

  useEffect(() => {
    const filtered = allStockData.filter((item) => {
      const matchesType =
        filterType === "" ||
        item.type.toLowerCase().includes(filterType.toLowerCase());
      const matchesStatus =
        filterStatus === "" ||
        (filterStatus === "in" && item.status === "In Stock") ||
        (filterStatus === "sold" && item.status === "Sold");

      const matchesDate = filterDate === "" || item.rawDateIn === filterDate;

      const matchesSource = filterSource === "" || item.source === filterSource;

      return matchesType && matchesStatus && matchesDate && matchesSource;
    });

    setFilteredStockData(filtered);

    const totalItems = filtered.length;
    const totalWeight = filtered.reduce((sum, item) => sum + item.weight, 0);
    const totalWastage = filtered
      .filter((item) => item.source === "Goldsmith")
      .reduce((sum, item) => sum + item.wastage, 0);
    const totalPurityJewelStock = filtered
      .filter((item) => item.source === "Jewel Stock")
      .reduce((sum, item) => sum + item.purityValue, 0);

    setStockSummary([
      { label: "Total Items", value: totalItems },
      { label: "Total Weight", value: `${totalWeight.toFixed(3)}g` },
      {
        label: "Total Wastage (Goldsmith)",
        value: `${totalWastage.toFixed(3)}g`,
      },
      {
        label: "Total Purity (Jewel Stock)",
        value: `${totalPurityJewelStock.toFixed(3)}g`,
      },
    ]);
  }, [allStockData, filterType, filterStatus, filterDate, filterSource]); 

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

  const uniqueTypes = [
    ...new Set(allStockData.map((item) => item.type)),
  ].sort();

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
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
        >
          <option value="">All Sources</option>
          <option value="Goldsmith">Goldsmith</option>
          <option value="Jewel Stock">Jewel Stock</option>
        </select>
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
              <th>Source</th>
              <th>Type</th>
              <th>Weight (g)</th>
              <th>Purity (g)</th>
              <th>Wastage (g)</th>
              <th>Status</th>
              <th>Date In</th>
            </tr>
          </thead>
          <tbody>
            {filteredStockData.length > 0 ? (
              filteredStockData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.source}</td>
                  <td>{item.type}</td>
                  <td>{item.weight.toFixed(3)}</td>
                  <td>
                    {item.source === "Jewel Stock" && item.purityValue !== null
                      ? item.purityValue.toFixed(3)
                      : "N/A"}
                  </td>
                  <td>
                    {item.source === "Goldsmith" && item.wastage !== null
                      ? item.wastage.toFixed(3)
                      : "N/A"}
                  </td>
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
                <td colSpan="8">
                  No stock entries found for the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stock;