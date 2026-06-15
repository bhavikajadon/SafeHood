const express = require("express");
const { getZones } = require("../controllers/zone.controller");

const router = express.Router();

router.get("/", getZones);

module.exports = router;