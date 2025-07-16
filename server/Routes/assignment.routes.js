const express = require("express");
const router = express.Router();
const {
  createAssignment,
  updateAssignment,
  getAllAssignments,
  getAssignmentById,
  getAssignmentsByArtisan,
  deleteAssignment,
  getArtisanLastBalance,
} = require("../Controllers/assignment.controller");

router.post("/", createAssignment);
router.put("/:id", updateAssignment);
router.get("/", getAllAssignments);
router.get("/:id", getAssignmentById);
router.get("/artisan/:artisanId", getAssignmentsByArtisan);
router.delete("/:id", deleteAssignment);
router.get("/artisans/:artisanId/last-balance", getArtisanLastBalance);

module.exports = router;
