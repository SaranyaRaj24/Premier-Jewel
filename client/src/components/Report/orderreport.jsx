import React, { useState } from "react";
import "./orderreport.css";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Box,
  IconButton,
} from "@mui/material";
import {
  Search,
  CalendarToday,
  CheckCircle,
  PendingActions,
  Print,
} from "@mui/icons-material";

const OrderReport = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const orders = [
    {
      id: "#ORD-1001",
      date: "2023-05-15",
      customer: "John Doe",
      items: [
        { name: "Gold Ring", quantity: 1, weight: "5.2g", status: "Delivered" },
       
      ],
      total: "1,250.00",
    },
    {
      id: "#ORD-1002",
      date: "2023-05-18",
      customer: "Jane Smith",
      items: [
        {
          name: "Diamond Bracelet",
          quantity: 1,
          weight: "8.2g",
          status: "Pending",
        },
      ],
      total: "2,800.00",
    },
    {
      id: "#ORD-1003",
      date: "2023-05-20",
      customer: "Robert Johnson",
      items: [
        {
          name: "Platinum Ring",
          quantity: 1,
          weight: "6.7g",
          status: "Delivered",
        },
        
      ],
      total: "3,150.00",
    },
  ];

  const filteredOrders = orders.filter((order) => {
  
    const orderHasFilteredStatus = order.items.some(
      (item) => filter === "all" || item.status === filter
    );

    if (!orderHasFilteredStatus) return false;

   
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.customer.toLowerCase().includes(searchLower) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchLower)
        )
      );
    }

    return true;
  });

  const getStatusIcon = (status) => {
    return status === "Delivered" ? (
      <CheckCircle fontSize="small" />
    ) : (
      <PendingActions fontSize="small" />
    );
  };

  return (
    <div className="order-report-container">
      <div className="report-header">
        <Typography
          variant="h4"
          component="h1"
          sx={{
            textAlign: "center",
            width: "100%",
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          Order Report
        </Typography>

        <div className="report-actions">
          <IconButton color="primary" aria-label="print">
            <Print />
          </IconButton>
        </div>
      </div>

      <div className="report-filters">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search orders..."
          InputProps={{
            startAdornment: <Search color="action" />,
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, maxWidth: 400 }}
        />

        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead
            sx={{
              backgroundColor: "#e3f2fd",
              "& th": {
                backgroundColor: "#e3f2fd",
                color: "#0d47a1",
                fontWeight: "bold",
                fontSize: "1rem",
              },
            }}
          >
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Status</TableCell>{" "}
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarToday fontSize="small" color="action" />
                    {order.date}
                  </Box>
                </TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>
                  {order.items.map((item, index) => (
                    <Box
                      key={index}
                      display="flex"
                      alignItems="center"
                      gap={1}
                      mb={1}
                    >
                      <Avatar
                        sx={{ width: 24, height: 24, fontSize: "0.8rem" }}
                      >
                        {item.name.charAt(0)}
                      </Avatar>
                      <span>
                        {item.name} ({item.weight})
                      </span>
                    </Box>
                  ))}
                </TableCell>
                <TableCell>
                  {order.items.map((item, index) => (
                    <Chip
                      key={index}
                      label={item.status}
                      icon={getStatusIcon(item.status)}
                      size="small"
                      sx={{
                        mr: 1, 
                        mb: 1, 
                        ...(item.status === "Delivered" && {
                          backgroundColor: "success.light",
                          color: "success.dark",
                        }),
                        ...(item.status === "Pending" && {
                          backgroundColor: "warning.light",
                          color: "warning.dark",
                        }),
                      }}
                    />
                  ))}
                </TableCell>
                <TableCell>{order.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredOrders.length === 0 && (
        <Paper sx={{ p: 3, mt: 3, textAlign: "center" }}>
          <Typography variant="body1">
            No orders found matching your criteria
          </Typography>
        </Paper>
      )}
    </div>
  );
};

export default OrderReport;
