const express = require("express");
const { createPost, getPosts, upvotePost } = require("../controllers/forum.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", getPosts);
router.post("/", protect, createPost);
router.patch("/:id/upvote", protect, upvotePost);

module.exports = router;


