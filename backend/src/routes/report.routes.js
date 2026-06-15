const express = require("express");
const { createReport, getReports, upvoteReport } = require("../controllers/report.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", getReports);
router.post("/", protect, createReport);
router.patch("/:id/upvote", protect, upvoteReport);

module.exports = router;