const express = require("express");
const { getFacets } = require("../controllers/filtersController");

const router = express.Router();

router.get("/", getFacets);

module.exports = router;

