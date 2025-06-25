import React, { useState, useEffect } from "react";
import axios from "axios";

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
  Tooltip,
  useTheme,
  Modal,
} from "@mui/material";
import {
  AddCircleOutline,
  Add,
  Close,
  CheckCircle,
  PendingActions,
  Image as ImageIcon,
  Edit,
  Delete,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_SERVER_URL } from "../../Config/Config";

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

const ImagePreview = styled("div")(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: 4,
  backgroundColor: "#f5f5f5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  cursor: "pointer",
  position: "relative",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

const FullSizeImageModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& .MuiBox-root": {
    outline: "none",
    position: "relative",
    maxWidth: "90%",
    maxHeight: "90%",
  },
  "& img": {
    maxWidth: "100%",
    maxHeight: "90vh",
    boxShadow: theme.shadows[10],
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: 10,
  top: 10,
  backgroundColor: alpha(theme.palette.common.black, 0.5),
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.8),
  },
}));

const CustomerOrders = () => {
  const theme = useTheme();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const customerId = queryParams.get("id");

  const customerName = queryParams.get("name") || "Customer";

  const [open, setOpen] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [items, setItems] = useState([
    {
      itemName: "",
      description: "",
      weight: "",
      dueDate: "",
      images: [],
      imagePreviews: [],
      status: "Pending",
    },
  ]);

  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditingOrder(null);
    setItems([
      {
        itemName: "",
        description: "",
        weight: "",
        dueDate: "",
        images: [],
        imagePreviews: [],
        status: "Pending",
      },
    ]);
  };

  const fetchCustomerOrders = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_SERVER_URL}/api/customerOrder/getCustomerInfo/${customerId}`
      );
      console.log("Data :", res.data);
      const data = res.data;

      if (data?.orderdetails) {
        const transformedOrders = data.orderdetails.map((order) => ({
          id: order.id,
          orderId: `#ORD-${order.id}`,
          orderDate: new Date(),
          items: [
            {
              itemName: order.item_name,
              description: order.description,
              weight: order.weight,
              status: order.status || "Pending",
              dueDate: formatDate(order.due_date),
              imagePreviews:
                order.productImages?.map(
                  (img) => `${BACKEND_SERVER_URL}/uploads/${img.filename}`
                ) || [],
            },
          ],
        }));

        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error("Error fetching customer orders:", error);
    }
  };
  useEffect(() => {
    if (customerId) fetchCustomerOrders();
  }, [customerId]);
  const handleOpenImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenImageModal(true);
  };

  const handleCloseImageModal = () => {
    setSelectedImage("");
    setOpenImageModal(false);
  };

  const handleChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleImageChange = (index, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const previews = files.map((file) => URL.createObjectURL(file));
    const updatedItems = [...items];

    updatedItems[index].images = [
      ...(updatedItems[index].images || []),
      ...files,
    ];
    updatedItems[index].imagePreviews = [
      ...(updatedItems[index].imagePreviews || []),
      ...previews,
    ];

    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemName: "",
        description: "",
        weight: "",
        dueDate: "",
        images: [],
        imagePreviews: [],
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

  // const handleSave = async () => {
  //   try {
  //     const formData = new FormData();

  //     formData.append("customer_id", customerId);

  //     items.forEach((item, index) => {
  //       formData.append("item_name", item.itemName);
  //       formData.append("description", item.description);
  //       formData.append("weight", item.weight);
  //       formData.append("due_date", item.dueDate);

  //       if (item.images && item.images.length > 0) {
  //         item.images.forEach((file) => {
  //           formData.append(`images_${index}[]`, file);
  //         });
  //       }
  //     });

  //     const res = await axios.post(
  //       `${BACKEND_SERVER_URL}/api/customerOrder/create`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     if (res.data?.data) {
  //       toast.success("Customer order created successfully");
  //       await fetchCustomerOrders();
  //       handleClose();
  //     }
  //   } catch (error) {
  //     console.error("Error creating order:", error);
  //     toast.error("Failed to create order");
  //   }
  // };

 const handleSave = async () => {
  try {
    const formData = new FormData();
    formData.append("customer_id", customerId);

    const isEditing = Boolean(editingOrder);
    const item = items[0]; 
    formData.append("item_name", item.itemName);
    formData.append("description", item.description);
    formData.append("weight", item.weight);
    formData.append("due_date", item.dueDate);
    formData.append("status", item.status);

    if (item.images && item.images.length > 0) {
      item.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    let response;
    if (isEditing) {
      const orderId = editingOrder.id;
      response = await axios.put(
        `${BACKEND_SERVER_URL}/api/customerOrder/update/${orderId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    } else {
      response = await axios.post(
        `${BACKEND_SERVER_URL}/api/customerOrder/create`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    }

    if (response.data?.data) {
      toast.success(isEditing ? "Order updated successfully" : "Order created successfully");
      setTimeout(() => fetchCustomerOrders(), 500); 
      handleClose();
    }
  } catch (error) {
    console.error("Error saving order:", error);
    toast.error("Failed to save order");
  }
};


const handleEditOrder = (order) => {
  const orderId = parseInt(order.orderId.replace("#ORD-", ""));
  setEditingOrder({ ...order, id: orderId });

  const item = order.items[0];
  setItems([
    {
      ...item,
      dueDate: item.dueDate
        ? new Date(item.dueDate).toISOString().split("T")[0]
        : "",
      imagePreviews: item.imagePreviews || [],
      images: [], 
    },
  ]);

  handleOpen();
};



  const handleDeleteOrder = async (orderId) => {
    try {
      const id = orderId.replace("#ORD-", "");
      const res = await axios.delete(
        `${BACKEND_SERVER_URL}/api/customerOrder/delete/${id}`
      );
      if (res.status === 200) {
        toast.success("Order deleted successfully!");
        await fetchCustomerOrders();
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
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

  // return (
  //   <Container maxWidth="xl" sx={{ py: 4 }}>
  //     <ToastContainer
  //       position="top-right"
  //       autoClose={3000}
  //       hideProgressBar={false}
  //       newestOnTop={false}
  //       closeOnClick
  //       rtl={false}
  //       pauseOnFocusLoss
  //       draggable
  //       pauseOnHover
  //     />
  //     <Box
  //       sx={{
  //         display: "flex",
  //         justifyContent: "space-between",
  //         alignItems: "center",
  //         mb: 4,
  //       }}
  //     >
  //       <Box>
  //         <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
  //           Order History of {customerName}
  //         </Typography>
  //       </Box>
  //       <Button
  //         variant="contained"
  //         startIcon={<AddCircleOutline />}
  //         onClick={handleOpen}
  //         sx={{
  //           bgcolor: "primary.main",
  //           "&:hover": { bgcolor: "primary.dark" },
  //           px: 3,
  //           py: 1.5,
  //           borderRadius: "8px",
  //           textTransform: "none",
  //         }}
  //       >
  //         New Order
  //       </Button>
  //     </Box>

  //     {orders.length === 0 ? (
  //       <Paper sx={{ p: 6, textAlign: "center", borderRadius: "12px" }}>
  //         <Typography variant="h6" color="textSecondary" gutterBottom>
  //           No orders found for {customerName}
  //         </Typography>
  //         <Button
  //           variant="contained"
  //           startIcon={<AddCircleOutline />}
  //           onClick={handleOpen}
  //           sx={{ mt: 2 }}
  //         >
  //           Create First Order
  //         </Button>
  //       </Paper>
  //     ) : (
  //       orders.map((order, orderIdx) => (
  //         <OrderCard key={order.orderId || orderIdx}>
  //           {" "}
  //           <Box
  //             sx={{
  //               display: "flex",
  //               justifyContent: "space-between",
  //               alignItems: "center",
  //               mb: 2,
  //               flexWrap: "wrap",
  //               gap: 2,
  //             }}
  //           >
  //             <Box>
  //               <Typography variant="h6" sx={{ fontWeight: 600 }}>
  //                 Order {order.orderId}
  //               </Typography>
  //               <Typography variant="body2" color="text.secondary">
  //                 Order Date: {formatDate(order.orderDate)}
  //               </Typography>
  //             </Box>
  //             <Box sx={{ display: "flex", gap: 1 }}>
  //               <Chip
  //                 label={`${order.items.length} ${
  //                   order.items.length === 1 ? "item" : "items"
  //                 }`}
  //                 variant="outlined"
  //                 color="primary"
  //               />
  //               <Tooltip title="Edit Order">
  //                 <IconButton
  //                   color="info"
  //                   onClick={() => handleEditOrder(order)}
  //                 >
  //                   <Edit />
  //                 </IconButton>
  //               </Tooltip>
  //               <Tooltip title="Delete Order">
  //                 <IconButton
  //                   color="error"
  //                   onClick={() => handleDeleteOrder(order.orderId)}
  //                 >
  //                   <Delete />
  //                 </IconButton>
  //               </Tooltip>
  //             </Box>
  //           </Box>
  //           <Divider sx={{ my: 2 }} />
  //           <TableContainer>
  //             <Table>
  //               <TableHead
  //                 sx={{
  //                   backgroundColor: "#f5f5f5 !important",
  //                   "& th": {
  //                     fontWeight: 700,
  //                     color: "#000 !important",
  //                     backgroundColor: "#f5f5f5 !important",
  //                   },
  //                 }}
  //               >
  //                 <TableRow>
  //                   <TableCell>Item</TableCell>
  //                   <TableCell>Description</TableCell>
  //                   <TableCell align="center">Weight</TableCell>
  //                   <TableCell align="center">Due Date</TableCell>
  //                   <TableCell align="center">Status</TableCell>
  //                 </TableRow>
  //               </TableHead>
  //               <TableBody>
  //                 {order.items.map((item, iIdx) => (
  //                   <StyledTableRow key={iIdx}>
  //                     <TableCell>

  //                       <Box
  //                         sx={{
  //                           display: "flex",
  //                           flexDirection: "column",
  //                           gap: 1,
  //                         }}
  //                       >
  //                         <Box
  //                           sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
  //                         >
  //                           {item.imagePreviews?.length > 0 && (
  //                             <Box
  //                               sx={{
  //                                 mt: 1,
  //                                 display: "flex",
  //                                 gap: 1,
  //                                 flexWrap: "wrap",
  //                               }}
  //                             >
  //                               {item.imagePreviews.map((preview, pIdx) => (
  //                                 <Box key={pIdx} sx={{ position: "relative" }}>
  //                                   <ImagePreview
  //                                     onClick={() =>
  //                                       handleOpenImageModal(preview)
  //                                     }
  //                                   >
  //                                     <img
  //                                       src={preview}
  //                                       alt={`preview-${pIdx}`}
  //                                     />
  //                                   </ImagePreview>
  //                                   <IconButton
  //                                     size="small"
  //                                     onClick={() => {
  //                                       const updatedItems = [...items];
  //                                       updatedItems[
  //                                         index
  //                                       ].imagePreviews.splice(pIdx, 1);
  //                                       updatedItems[index].images.splice(
  //                                         pIdx,
  //                                         1
  //                                       );
  //                                       setItems(updatedItems);
  //                                     }}
  //                                     sx={{
  //                                       position: "absolute",
  //                                       top: -6,
  //                                       right: -6,
  //                                       backgroundColor: "#fff",
  //                                       border: "1px solid #ccc",
  //                                       p: 0.2,
  //                                     }}
  //                                   >
  //                                     <Close fontSize="small" />
  //                                   </IconButton>
  //                                 </Box>
  //                               ))}
  //                             </Box>
  //                           )}
  //                         </Box>

  //                         <Typography variant="body2" sx={{ fontWeight: 500 }}>
  //                           {item.itemName}
  //                         </Typography>
  //                       </Box>
  //                     </TableCell>

  //                     <TableCell>
  //                       <Typography
  //                         variant="body2"
  //                         sx={{ whiteSpace: "pre-line" }}
  //                       >
  //                         {item.description}
  //                       </Typography>
  //                     </TableCell>
  //                     <TableCell align="center">{item.weight}</TableCell>
  //                     <TableCell align="center">
  //                       {item.dueDate || "N/A"}
  //                     </TableCell>

  //                     <TableCell align="center">
  //                       <StatusChip
  //                         label={item.status}
  //                         status={item.status}
  //                         icon={getStatusIcon(item.status)}
  //                       />
  //                     </TableCell>
  //                   </StyledTableRow>
  //                 ))}
  //               </TableBody>
  //             </Table>
  //           </TableContainer>
  //         </OrderCard>
  //       ))
  //     )}

  //     <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
  //       <DialogTitle
  //         sx={{
  //           bgcolor: "primary.main",
  //           color: "white",
  //           display: "flex",
  //           justifyContent: "space-between",
  //           alignItems: "center",
  //         }}
  //       >
  //         <Typography variant="h6">
  //           {editingOrder ? "Edit Order" : "Create New Order"}
  //         </Typography>
  //         <IconButton onClick={handleClose} sx={{ color: "white" }}>
  //           <Close />
  //         </IconButton>
  //       </DialogTitle>
  //       <DialogContent dividers sx={{ py: 3 }}>
  //         <Typography
  //           variant="subtitle1"
  //           gutterBottom
  //           sx={{ fontWeight: 600, mb: 2 }}
  //         >
  //           Order Items
  //         </Typography>
  //         {items.map((item, index) => (
  //           <Box
  //             key={index}
  //             sx={{
  //               display: "grid",
  //               gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  //               gap: 2,
  //               mb: 3,
  //               alignItems: "center",
  //             }}
  //           >
  //             <TextField
  //               label="Item Name"
  //               value={item.itemName}
  //               onChange={(e) =>
  //                 handleChange(index, "itemName", e.target.value)
  //               }
  //               variant="outlined"
  //               size="small"
  //               fullWidth
  //               required
  //             />
  //             <TextField
  //               label="Description"
  //               value={item.description}
  //               onChange={(e) =>
  //                 handleChange(index, "description", e.target.value)
  //               }
  //               variant="outlined"
  //               size="small"
  //               fullWidth
  //               required
  //               multiline
  //               rows={3}
  //             />
  //             <TextField
  //               label="Weight (grams)"
  //               type="text"
  //               value={item.weight}
  //               onChange={(e) => handleChange(index, "weight", e.target.value)}
  //               variant="outlined"
  //               size="small"
  //               fullWidth
  //               required
  //             />
  //             <TextField
  //               label="Due Date"
  //               type="date"
  //               value={
  //                 item.dueDate
  //                   ? new Date(item.dueDate).toISOString().split("T")[0]
  //                   : ""
  //               }
  //               onChange={(e) => handleChange(index, "dueDate", e.target.value)}
  //               variant="outlined"
  //               size="small"
  //               fullWidth
  //               InputLabelProps={{ shrink: true }}
  //               inputProps={{
  //                 min: new Date().toISOString().split("T")[0],
  //               }}
  //               required
  //             />
  //             <TextField
  //               select
  //               label="Status"
  //               value={item.status}
  //               onChange={(e) => handleChange(index, "status", e.target.value)}
  //               variant="outlined"
  //               size="small"
  //               fullWidth
  //               required
  //             >
  //               <MenuItem value="Pending">Pending</MenuItem>
  //               <MenuItem value="Delivered">Delivered</MenuItem>
  //             </TextField>
  //             <Box>
  //               <input
  //                 accept="image/*"
  //                 multiple
  //                 style={{ display: "none" }}
  //                 id={`image-upload-${index}`}
  //                 type="file"
  //                 onChange={(e) => handleImageChange(index, e)}
  //               />

  //               <label htmlFor={`image-upload-${index}`}>
  //                 <Button
  //                   variant="outlined"
  //                   component="span"
  //                   startIcon={<ImageIcon />}
  //                   fullWidth
  //                   sx={{ height: "40px" }}
  //                 >
  //                   Upload Image
  //                 </Button>
  //               </label>
  //               {item.imagePreview && (
  //                 <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
  //                   <ImagePreview
  //                     onClick={() => handleOpenImageModal(item.imagePreview)}
  //                   >
  //                     <img src={item.imagePreview} alt="Preview" />
  //                   </ImagePreview>
  //                   <IconButton
  //                     size="small"
  //                     onClick={() => {
  //                       handleChange(index, "image", null);
  //                       handleChange(index, "imagePreview", null);
  //                     }}
  //                     sx={{ ml: 1 }}
  //                   >
  //                     <Close fontSize="small" />
  //                   </IconButton>
  //                 </Box>
  //               )}
  //             </Box>
  //             {items.length > 1 && (
  //               <Tooltip title="Remove item">
  //                 <IconButton
  //                   onClick={() => handleRemoveItem(index)}
  //                   color="error"
  //                   sx={{ alignSelf: "center" }}
  //                 >
  //                   <Close fontSize="small" />
  //                 </IconButton>
  //               </Tooltip>
  //             )}
  //           </Box>
  //         ))}
  //         <Button
  //           variant="outlined"
  //           startIcon={<Add />}
  //           onClick={handleAddItem}
  //           sx={{ mt: 1 }}
  //         >
  //           Add Another Item
  //         </Button>
  //       </DialogContent>
  //       <DialogActions sx={{ px: 3, py: 2 }}>
  //         <Button onClick={handleClose} sx={{ color: "text.secondary" }}>
  //           Cancel
  //         </Button>
  //         <Button
  //           variant="contained"
  //           onClick={handleSave}
  //           disabled={
  //             !items.every(
  //               (item) =>
  //                 item.itemName &&
  //                 item.description &&
  //                 item.weight &&
  //                 item.dueDate
  //             )
  //           }
  //           sx={{
  //             bgcolor: "primary.main",
  //             "&:hover": { bgcolor: "primary.dark" },
  //             px: 3,
  //             textTransform: "none",
  //           }}
  //         >
  //           {editingOrder ? "Save Changes" : "Save Order"}
  //         </Button>
  //       </DialogActions>
  //     </Dialog>

  //     <FullSizeImageModal open={openImageModal} onClose={handleCloseImageModal}>
  //       <Box>
  //         <img src={selectedImage} alt="Full size preview" />
  //         <CloseButton onClick={handleCloseImageModal}>
  //           <Close />
  //         </CloseButton>
  //       </Box>
  //     </FullSizeImageModal>
  //   </Container>
  // );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Order History of {customerName}
        </Typography>
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

      {/* Orders List */}
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
        orders.map((order, orderIdx) => (
          <OrderCard key={order.orderId || orderIdx}>
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
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label={`${order.items.length} ${
                    order.items.length === 1 ? "item" : "items"
                  }`}
                  variant="outlined"
                  color="primary"
                />
                <Tooltip title="Edit Order">
                  <IconButton
                    color="info"
                    onClick={() => handleEditOrder(order)}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Order">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteOrder(order.orderId)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5 !important" }}>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Description</TableCell>
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
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {item.imagePreviews?.length > 0 && (
                            <Box
                              sx={{
                                mt: 1,
                                display: "flex",
                                gap: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              {item.imagePreviews.map((preview, pIdx) => (
                                <Box key={pIdx} sx={{ position: "relative" }}>
                                  <ImagePreview
                                    onClick={() =>
                                      handleOpenImageModal(preview)
                                    }
                                  >
                                    <img
                                      src={preview}
                                      alt={`preview-${pIdx}`}
                                    />
                                  </ImagePreview>
                                </Box>
                              ))}
                            </Box>
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.itemName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-line" }}
                        >
                          {item.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{item.weight}</TableCell>
                      <TableCell align="center">
                        {item.dueDate || "N/A"}
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

      {/* Dialog */}
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
          <Typography variant="h6">
            {editingOrder ? "Edit Order" : "Create New Order"}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
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
              }}
            >
              <TextField
                label="Item Name"
                value={item.itemName}
                onChange={(e) =>
                  handleChange(index, "itemName", e.target.value)
                }
                size="small"
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={item.description}
                onChange={(e) =>
                  handleChange(index, "description", e.target.value)
                }
                size="small"
                fullWidth
                required
                multiline
                rows={3}
              />
              <TextField
                label="Weight (grams)"
                type="text"
                value={item.weight}
                onChange={(e) => handleChange(index, "weight", e.target.value)}
                size="small"
                fullWidth
                required
              />
              <TextField
                label="Due Date"
                type="date"
                value={item.dueDate || ""}
                onChange={(e) => handleChange(index, "dueDate", e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split("T")[0] }}
                required
              />
              <TextField
                select
                label="Status"
                value={item.status}
                onChange={(e) => handleChange(index, "status", e.target.value)}
                size="small"
                fullWidth
                required
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
              </TextField>

              {/* Image Upload + Preview */}
              <Box>
                <input
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  id={`image-upload-${index}`}
                  type="file"
                  onChange={(e) => handleImageChange(index, e)}
                />
                <label htmlFor={`image-upload-${index}`}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<ImageIcon />}
                    fullWidth
                    sx={{ height: "40px" }}
                  >
                    Upload Image
                  </Button>
                </label>

                {item.imagePreviews.length > 0 && (
                  <Box
                    sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}
                  >
                    {item.imagePreviews.map((preview, pIdx) => (
                      <Box key={pIdx} sx={{ position: "relative" }}>
                        <ImagePreview
                          onClick={() => handleOpenImageModal(preview)}
                        >
                          <img src={preview} alt={`preview-${pIdx}`} />
                        </ImagePreview>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const updatedItems = [...items];
                            updatedItems[index].imagePreviews.splice(pIdx, 1);
                            updatedItems[index].images.splice(pIdx, 1);
                            setItems(updatedItems);
                          }}
                          sx={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            p: 0.2,
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

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
                  item.itemName &&
                  item.description &&
                  item.weight &&
                  item.dueDate
              )
            }
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              px: 3,
              textTransform: "none",
            }}
          >
            {editingOrder ? "Save Changes" : "Save Order"}
          </Button>
        </DialogActions>
      </Dialog>

      <FullSizeImageModal open={openImageModal} onClose={handleCloseImageModal}>
        <Box>
          <img src={selectedImage} alt="Full size preview" />
          <CloseButton onClick={handleCloseImageModal}>
            <Close />
          </CloseButton>
        </Box>
      </FullSizeImageModal>
    </Container>
  );
};

export default CustomerOrders;

//537-556
{
  /* <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <ImagePreview
                            onClick={() =>
                              item.imagePreview &&
                              handleOpenImageModal(item.imagePreview)
                            }
                          >
                            {item.imagePreview ? (
                              <img
                                src={item.imagePreview}
                                alt={item.itemName || "Item image"}
                              />
                            ) : (
                              <ImageIcon color="action" />
                            )}
                          </ImagePreview>
                          {item.itemName}
                        </Box> */
}
