const ForumPost = require("../models/ForumPost");

const BAD_WORDS = ["spam", "fake", "advertisement", "buy now", "click here"];

function isToxic(text) {
  const lower = text.toLowerCase();
  return BAD_WORDS.some((w) => lower.includes(w));
}

async function createPost(req, res) {
  try {
    const { content, city, category, isAnonymous } = req.body;

    if (!content || !city) {
      return res.status(400).json({ message: "content and city are required" });
    }

    if (isToxic(content)) {
      return res
        .status(400)
        .json({ message: "Post contains inappropriate content" });
    }

    const post = await ForumPost.create({
      user: req.user._id,
      isAnonymous: isAnonymous ?? true,
      content,
      city,
      category: category || "warning",
    });

    const populated = await post.populate("user", "name");
    res.status(201).json({ post: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getPosts(req, res) {
  try {
    const { city } = req.query;
    const filter = { isFlagged: false };
    if (city) filter.city = city;

    const posts = await ForumPost.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function upvotePost(req, res) {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const already = post.upvotes.some((id) => id.equals(req.user._id));
    if (already) {
      post.upvotes.pull(req.user._id);
    } else {
      post.upvotes.push(req.user._id);
    }

    await post.save();
    res.json({ upvotes: post.upvotes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createPost, getPosts, upvotePost };