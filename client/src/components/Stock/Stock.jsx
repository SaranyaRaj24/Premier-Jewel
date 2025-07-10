
import React, { useState, useEffect } from "react";
import "./stock.css";
import { BACKEND_SERVER_URL } from "../../Config/Config";

const Stock = () => {
  const [stockSummary, setStockSummary] = useState([
    { label: "Total Items", value: 0 },
    { label: "Total Weight", value: "0g" },
    { label: "Total Purity", value: "0" }, 
  ]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
        console.log("Fetched raw assignments data:", data);

        let totalItems = 0;
        let totalWeight = 0;
        let sumOfPurities = 0;

        const processedStockData = data.flatMap((assignment) => {
          return assignment.finishedProducts.map((product) => {
            const productWeight = parseFloat(product.weight || 0);
            const productPurity = assignment.finalPurity
              ? parseFloat(assignment.finalPurity)
              : 0;

            totalItems += 1;
            totalWeight += productWeight;
            sumOfPurities += productPurity;

            const status = "In Stock";
            const createdAtDate = new Date(assignment.createdAt);
            const rawDateForFiltering = createdAtDate
              .toISOString()
              .split("T")[0];

            const indianDateFormat = createdAtDate.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            return {
              type: product.itemType || "N/A",
              purity: productPurity ? `${productPurity.toFixed(3)}` : "N/A",
              weight: productWeight.toFixed(3),
              status: status,
              rawDateIn: rawDateForFiltering, 
              displayDateIn: indianDateFormat, 
            };
          });
        });

        setStockData(processedStockData);
        setStockSummary([
          { label: "Total Items", value: totalItems },
          { label: "Total Weight", value: `${totalWeight.toFixed(3)}g` },
          { label: "Total Purity", value: `${sumOfPurities.toFixed(3)}` },
        ]);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching stock data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setFilterDate(e.target.value);
  };

  const filteredStockData = stockData.filter((item, index) => {
    const matchesSearch =
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (index + 1).toString().includes(searchTerm);

    const matchesStatus =
      filterStatus === "" ||
      (filterStatus === "in" && item.status === "In Stock") ||
      (filterStatus === "sold" && item.status === "Sold");

 
    const matchesDate = filterDate === "" || item.rawDateIn === filterDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return <div className="stock-container">Loading stock data...</div>;
  }

  if (error) {
    return (
      <div className="stock-container error-message">
        <h2>Error Loading Stock:</h2>
        <p>{error}</p>
        <p>
          Please ensure the backend server is running on **`{BACKEND_SERVER_URL}
     
        </p>
        <p>Check your browser's console and network tab for more details.</p>
      </div>
    );
  }

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
        <input
          type="text"
          placeholder="Search Serial No or Type"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select value={filterStatus} onChange={handleStatusFilterChange}>
          <option value="">All Status</option>
          <option value="in">In Stock</option>
          <option value="sold">Sold</option>
        </select>
        <input
          type="date"
          value={filterDate} 
          onChange={handleDateFilterChange}
        />
      </div>

      <div className="stock-table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Serial No</th>
              <th>Type</th>
              <th>Purity</th>
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
                  <td>{item.purity}</td>
                  <td>{item.weight}</td>
                  <td
                    className={
                      item.status === "Sold" ? "sold-status" : "in-stock-status"
                    }
                  >
                    {item.status}
                  </td>
                  <td>{item.displayDateIn}</td>{" "}
                
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  No finished products found in stock. Adjust filters or check
                  backend data.
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