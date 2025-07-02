import React, { useState } from "react";
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
} from "@mui/material";
import { useLocation, useParams } from "react-router-dom";
import NewJobCard from "./Newjobcard"; 

const GoldsmithDetails = () => {
  const { id, name } = useParams();
  const location = useLocation();
  const { phone, address } = location.state || {};

  const [openJobcardDialog, setOpenJobcardDialog] = useState(false);
  const [jobcards, setJobcards] = useState([]);

  const handleSaveJobcard = (newJobcardData) => {
   
    if (newJobcardData) {
     
      const date = new Date().toLocaleDateString("en-IN"); 
      setJobcards((prev) => [
        ...prev,
        { ...newJobcardData, date: date, name: name }, 
      ]);
    }
    setOpenJobcardDialog(false); 
  };

  const handleCloseJobcard = () => {
    setOpenJobcardDialog(false);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Goldsmith Details
        </Typography>
        <Typography>
          <strong>Name:</strong> {name}
        </Typography>
        <Typography>
          <strong>Phone:</strong> {phone}
        </Typography>
        <Typography>
          <strong>Address:</strong> {address}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => setOpenJobcardDialog(true)}
        >
          Add New Job Card
        </Button>

        {jobcards.length > 0 && (
          <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Job Card Entries
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Net Weight (g)</TableCell>
                  <TableCell>Final Purity (g)</TableCell>
                  <TableCell>Balance (g)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobcards.map((jc, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{jc.date}</TableCell>
                    <TableCell>{jc.description}</TableCell>
                    <TableCell>{jc.netWeight}</TableCell>
                    <TableCell>{jc.finalPurity}</TableCell>
                    <TableCell>
                      {jc.balanceDifference} (
                      {jc.ownerGivesBalance ? "Owner gives" : "Goldsmith gives"}
                      )
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
        PaperProps={{
          sx: {
            maxHeight: "90vh",
           
          },
        }}
      >
     
        <NewJobCard
          open={openJobcardDialog} 
          onClose={handleCloseJobcard}
          onSave={handleSaveJobcard}
        />
      </Dialog>
    </Container>
  );
};

export default GoldsmithDetails;
