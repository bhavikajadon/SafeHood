const express = require("express");
const { getSafestRoutes } = require("../controllers/safeRoute.controller");

const router = express.Router();

router.post("/safest", getSafestRoutes);

module.exports = router;
