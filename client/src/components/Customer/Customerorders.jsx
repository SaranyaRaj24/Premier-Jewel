
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Box,
  Divider,
  Avatar,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  AddCircleOutline,
  Add,
  Close,
  CheckCircle,
  PendingActions,
  Event,
  Scale,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.light, 0.15),
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  minWidth: 120,
  ...(status === "Pending" && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}`,
  }),
  ...(status === "Delivered" && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}`,
  }),
}));

const OrderCard = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  padding: theme.spacing(3),
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  background: theme.palette.background.paper,
  transition: "all 0.3s ease",
}));

const CustomerOrders = () => {
  const theme = useTheme();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const customerName = queryParams.get("name");

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {
      itemName: "",
      quantity: "",
      weight: "",
      dueDate: "",
      status: "Pending",
    },
  ]);

  const [orders, setOrders] = useState([
   
    {
      orderDate: new Date(Date.now() - 3 * 86400000),
      orderId: "#ORD-1000",
      items: [
        {
          itemName: "Diamond Bracelet",
          quantity: 1,
          weight: "8.2g",
          dueDate: new Date(Date.now() - 86400000),
          status: "Delivered",
        },
      ],
    },
  ]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItems([
      {
        itemName: "",
        quantity: "",
        weight: "",
        dueDate: "",
        status: "Pending",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemName: "",
        quantity: "",
        weight: "",
        dueDate: "",
        status: "Pending",
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleSave = () => {
    const newOrder = {
      orderDate: new Date(),
      orderId: `#ORD-${1000 + orders.length + 1}`,
      items: items.map((item) => ({
        ...item,
        dueDate: item.dueDate || new Date(Date.now() + 7 * 86400000),
      })),
    };

    setOrders([newOrder, ...orders]);
    handleClose();
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle fontSize="small" />;
      case "Pending":
        return <PendingActions fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {customerName}'s Orders
          </Typography>
         
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleOutline />}
          onClick={handleOpen}
          sx={{
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
            px: 3,
            py: 1.5,
            borderRadius: "8px",
            textTransform: "none",
          }}
        >
          New Order
        </Button>
      </Box>

      {orders.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: "12px" }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No orders found for {customerName}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={handleOpen}
            sx={{ mt: 2 }}
          >
            Create First Order
          </Button>
        </Paper>
      ) : (
        orders.map((order, idx) => (
          <OrderCard key={idx}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Order {order.orderId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Order Date: {formatDate(order.orderDate)}
                </Typography>
              </Box>
              <Chip
                label={`${order.items.length} ${
                  order.items.length === 1 ? "item" : "items"
                }`}
                variant="outlined"
                color="primary"
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <TableContainer>
              <Table>
                <TableHead
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    "& th": {
                      fontWeight: 700,
                    },
                  }}
                >
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="center">Weight</TableCell>
                    <TableCell align="center">Due Date</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, iIdx) => (
                    <StyledTableRow key={iIdx}>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              width: 36,
                              height: 36,
                              color: "white",
                            }}
                          >
                            {item.itemName.charAt(0)}
                          </Avatar>
                          {item.itemName}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Scale
                            fontSize="small"
                            color="action"
                            sx={{ mr: 1 }}
                          />
                          {item.weight}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Event
                            fontSize="small"
                            color="action"
                            sx={{ mr: 1 }}
                          />
                          {formatDate(item.dueDate)}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <StatusChip
                          label={item.status}
                          status={item.status}
                          icon={getStatusIcon(item.status)}
                        />
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OrderCard>
        ))
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Create New Order</Typography>
          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Order Items
          </Typography>
          {items.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
                mb: 3,
                alignItems: "center",
              }}
            >
              <TextField
                select
                label="Item Name"
                value={item.itemName}
                onChange={(e) =>
                  handleChange(index, "itemName", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
              >
                <MenuItem value="Gold Ring">Gold Ring</MenuItem>
                <MenuItem value="Silver Chain">Silver Chain</MenuItem>
             
              </TextField>
              <TextField
                label="Quantity"
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleChange(index, "quantity", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Weight (grams)"
                type="text"
                value={item.weight}
                onChange={(e) => handleChange(index, "weight", e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
              />
              <TextField
                label="Due Date"
                type="date"
                value={
                  item.dueDate
                    ? new Date(item.dueDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleChange(index, "dueDate", e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split("T")[0],
                }}
              />
              <TextField
                select
                label="Status"
                value={item.status}
                onChange={(e) => handleChange(index, "status", e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
              </TextField>
              {items.length > 1 && (
                <Tooltip title="Remove item">
                  <IconButton
                    onClick={() => handleRemoveItem(index)}
                    color="error"
                    sx={{ alignSelf: "center" }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddItem}
            sx={{ mt: 1 }}
          >
            Add Another Item
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              !items.every(
                (item) =>
                  item.itemName && item.quantity && item.weight && item.dueDate
              )
            }
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              px: 3,
              textTransform: "none",
            }}
          >
            Save Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomerOrders;
