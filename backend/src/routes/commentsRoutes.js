const express = require("express");
const { getLatestComments } = require("../controllers/commentsController");

const router = express.Router();

router.get("/latest", getLatestComments);

module.exports = router;
