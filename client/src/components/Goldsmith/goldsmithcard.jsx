
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Dialog,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Divider,
  Box,
  CircularProgress,
} from "@mui/material";
import { Add, Visibility, Delete } from "@mui/icons-material";
import NewJobCard from "../Goldsmith/Newjobcard";
import { BACKEND_SERVER_URL } from "../../Config/Config";

const GoldsmithDetails = () => {
  const { id, name } = useParams();
  const location = useLocation();
  const { phone, address } = location.state || {};

  const [openJobcardDialog, setOpenJobcardDialog] = useState(false);
  const [jobcards, setJobcards] = useState([]);
  const [selectedJobcard, setSelectedJobcard] = useState(null);
  const [loadingJobcards, setLoadingJobcards] = useState(true);

  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const response = await fetch(
          `${BACKEND_SERVER_URL}/api/assignments/artisan/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch job cards");
        }
        const data = await response.json();
        setJobcards(data);
      } catch (error) {
        console.error("Error fetching job cards:", error);
      } finally {
        setLoadingJobcards(false);
      }
    };

    fetchJobCards();
  }, [id]);

  const handleCreateJobcard = () => {
    setSelectedJobcard(null);
    setOpenJobcardDialog(true);
  };

  const handleEditJobcard = (jobcard) => {
    setSelectedJobcard(jobcard);
    setOpenJobcardDialog(true);
  };

  const handleSaveJobcard = (newJobcardData) => {
    if (newJobcardData) {
      setJobcards((prev) => {
        const existingIndex = prev.findIndex(
          (jc) => jc.id === newJobcardData.id
        );
        if (existingIndex > -1) {
          const updatedJobcards = [...prev];
          updatedJobcards[existingIndex] = newJobcardData;
          return updatedJobcards;
        } else {
          return [...prev, newJobcardData];
        }
      });
    }
    setOpenJobcardDialog(false);
  };

  const handleDeleteJobcard = async (jobcardIdToDelete) => {
    if (window.confirm("Are you sure you want to delete this job card?")) {
      try {
        const response = await fetch(
          `${BACKEND_SERVER_URL}/api/assignments/${jobcardIdToDelete}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete job card");
        }

        setJobcards((prev) => prev.filter((jc) => jc.id !== jobcardIdToDelete));
      } catch (error) {
        console.error("Error deleting job card:", error);
      }
    }
  };

  const handleCloseJobcard = () => {
    setOpenJobcardDialog(false);
    setSelectedJobcard(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", textAlign: "center" }}
        >
          Goldsmith Details
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 3,
          }}
        >
          <div>
            <Box sx={{ pl: 2 }}>
              <Typography>
                <b>Name:</b> {name}
              </Typography>
            </Box>
          </div>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Job Card Records
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleCreateJobcard}
          >
            New Job Card
          </Button>
        </Box>

        {loadingJobcards ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : jobcards.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              No job cards found for this goldsmith
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={2}>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#e3f2fd",
                  "& th": {
                    backgroundColor: "#e3f2fd",
                    color: "#0d47a1",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    textAlign: "center",
                    verticalAlign: "middle",
                    padding: "8px",
                  },
                }}
              >
                <TableRow>
                  <TableCell rowSpan={2}>S.No</TableCell>
                  <TableCell rowSpan={2}>Date</TableCell>
                  <TableCell rowSpan={2}>Description</TableCell>
                  <TableCell colSpan={3}>Given Gold</TableCell>
                  <TableCell rowSpan={2}>OB</TableCell>
                  <TableCell rowSpan={2}>TB</TableCell>
                  <TableCell colSpan={2}>Item Delivery</TableCell>
                  <TableCell rowSpan={2}>Total Stone WT</TableCell>
                  <TableCell rowSpan={2}>Wastage</TableCell>
                  <TableCell rowSpan={2}>Balance Owed By</TableCell>
                  <TableCell rowSpan={2}>Balance</TableCell>
                  <TableCell rowSpan={2}>Actions</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>W</TableCell>
                  <TableCell>T</TableCell>
                  <TableCell>P</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Item Weight</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {jobcards.map((jc, index) => {
                  const metal = jc.metalInputs?.[0] || {};
                  const finishedProduct = jc.finishedProducts?.[0] || {};
                  const materialLoss = jc.materialLosses?.[0] || {};
                  const displayPurity =
                    metal.purity != null ? metal.purity.toFixed(3) : "-";
                  const displayOpeningBalance =
                    jc.openingBalance != null
                      ? jc.openingBalance.toFixed(3)
                      : "-";
                  const displayTotalBalance =
                    jc.totalBalance != null ? jc.totalBalance.toFixed(3) : "-";
                  const displayItemWeight =
                    finishedProduct.weight != null
                      ? finishedProduct.weight.toFixed(3)
                      : "-";
                  const displayStoneWeight =
                    materialLoss.weight != null
                      ? materialLoss.weight.toFixed(3)
                      : "-";
                  const displayWastage =
                    jc.wastage != null ? jc.wastage.toFixed(3) : "-";
                  const displayBalanceAmount =
                    jc.balanceAmount != null
                      ? jc.balanceAmount.toFixed(3)
                      : "-";

                  const balanceColor =
                    jc.balanceDirection === "Owner" ? "red" : "green";

                  const balanceOwedByText =
                    jc.balanceDirection === "Artisan"
                      ? "Goldsmith"
                      : jc.balanceDirection;

                  return (
                    <TableRow key={jc.id} hover>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">
                        {new Date(jc.date).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell align="center">{jc.description}</TableCell>
                      <TableCell align="center">
                        {metal.weight ?? "-"}
                      </TableCell>
                      <TableCell align="center">{metal.touch ?? "-"}</TableCell>
                      <TableCell align="center">{displayPurity}</TableCell>
                      <TableCell align="center">
                        {displayOpeningBalance}
                      </TableCell>
                      <TableCell align="center">
                        {displayTotalBalance}
                      </TableCell>
                      <TableCell align="center">
                        {finishedProduct.itemType ?? "-"}
                      </TableCell>
                      <TableCell align="center">{displayItemWeight}</TableCell>
                      <TableCell align="center">{displayStoneWeight}</TableCell>
                      <TableCell align="center">{displayWastage}</TableCell>
                      <TableCell align="center">
                        {balanceOwedByText ?? "-"}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: balanceColor, fontWeight: "bold" ,fontSize:"1.1rem"}}
                      >
                        {displayBalanceAmount}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditJobcard(jc)}
                            size="small"
                            sx={{ padding: "4px" }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteJobcard(jc.id)}
                            size="small"
                            sx={{ padding: "4px" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Paper>

      <Dialog
        open={openJobcardDialog}
        onClose={handleCloseJobcard}
        fullWidth
        maxWidth="xl"
        scroll="paper"
      >
        <NewJobCard
          onClose={handleCloseJobcard}
          onSave={handleSaveJobcard}
          initialData={selectedJobcard}
          artisanId={parseInt(id)}
          goldsmithName={name}
        />
      </Dialog>
    </Container>
  );
};

export default GoldsmithDetails;