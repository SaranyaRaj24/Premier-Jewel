const express = require("express");
const router = express.Router();
const {
  createJobcard,
  getJobcardsByGoldsmithId,
  createItemDeliveries,
  createReceivedSection
} = require("../Controllers/assignment.controller");

router.post("/create", createJobcard);
router.get("/goldsmith/:goldsmithId", getJobcardsByGoldsmithId);
router.post("/item-deliveries", createItemDeliveries);
router.post("/received-section", createReceivedSection);

module.exports = router;
