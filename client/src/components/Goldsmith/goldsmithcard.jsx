
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
          `${BACKEND_SERVER_URL}/api/assignments/goldsmith/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch job cards");
        }

        const data = await response.json();
        const { jobcards: fetchedJobcards, total: totalRecords } = data;

        const totalMap = new Map();
        totalRecords.forEach((item) => {
          totalMap.set(item.id, item);
        });

      
        const mergedJobcards = fetchedJobcards.map((jobcard) => ({
          ...jobcard,
          totalRecord: totalMap.get(jobcard.id) || null, 
        }));

        setJobcards(mergedJobcards);
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

  const handleSaveJobcard = (responseData) => {
    if (!responseData || !responseData.jobcard) return;

    const { jobcard, totalRecord } = responseData;
    const newJobcardEntry = {
      ...jobcard,
      totalRecord,
    };

    setJobcards((prev) => {
      const existingIndex = prev.findIndex((jc) => jc.id === jobcard.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newJobcardEntry;
        return updated;
      } else {
        return [...prev, newJobcardEntry];
      }
    });

    setOpenJobcardDialog(false);
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
                {jobcards.map((jobcard, index) => (
                  <TableRow key={jobcard.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {jobcard.createdAt
                        ? new Date(jobcard.createdAt).toLocaleDateString(
                            "en-IN"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>{jobcard.description || "-"}</TableCell>

                    <TableCell>{jobcard.weight ?? "-"}</TableCell>
                    <TableCell>{jobcard.touch ?? "-"}</TableCell>
                    <TableCell>{jobcard.purity.toFixed(3) ?? "-"}</TableCell>
                    <TableCell>
                      {jobcard.totalRecord?.openingBalance.toFixed
                      (3) ?? "-"}
                    </TableCell>
                    <TableCell>
                      {jobcard.totalRecord?.totalBalance.toFixed(3) ?? "-"}
                    </TableCell>

                    <TableCell>{jobcard.itemName || "-"}</TableCell>
                    <TableCell>{jobcard.itemWeight ?? "-"}</TableCell>

                    <TableCell>{jobcard.totalStoneWeight ?? "-"}</TableCell>
                    <TableCell>{jobcard.wastage ?? "-"}</TableCell>
                    <TableCell>{jobcard.balanceOwedBy || "-"}</TableCell>
                    <TableCell>{jobcard.balance ?? "-"}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEditJobcard(jobcard)}>
                        <Visibility color="primary" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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