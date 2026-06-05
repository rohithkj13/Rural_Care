const HealthPost = require('../models/HealthPost');
const HealthPostLike = require('../models/HealthPostLike');

exports.getAllPosts = async (req, res) => {
  try {
    const { category, search, limit = 20 } = req.query;
    const query = { isPublished: true };
    if (category && category !== 'all') query.category = category;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
    const posts = await HealthPost.find(query).sort('-createdAt').limit(Number(limit));
    const postIds = posts.map((p) => p._id);
    const liked = await HealthPostLike.find({ user: req.user.id, post: { $in: postIds } }).select('post');
    const likedSet = new Set(liked.map((l) => String(l.post)));
    const withLikeState = posts.map((p) => ({
      ...p.toObject(),
      isLikedByCurrentUser: likedSet.has(String(p._id))
    }));
    res.json({ success: true, count: withLikeState.length, data: withLikeState });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPostBySlug = async (req, res) => {
  try {
    const post = await HealthPost.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const liked = await HealthPostLike.exists({ user: req.user.id, post: post._id });
    res.json({ success: true, data: { ...post.toObject(), isLikedByCurrentUser: !!liked } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await HealthPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const existingLike = await HealthPostLike.findOne({ user: req.user.id, post: post._id });
    let liked;
    if (existingLike) {
      await existingLike.deleteOne();
      post.likes = Math.max(0, (post.likes || 0) - 1);
      liked = false;
    } else {
      await HealthPostLike.create({ user: req.user.id, post: post._id });
      post.likes = (post.likes || 0) + 1;
      liked = true;
    }

    await post.save();
    res.json({ success: true, data: { likes: post.likes, liked } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin
exports.createPost = async (req, res) => {
  try {
    const post = await HealthPost.create(req.body);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await HealthPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await HealthPost.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await HealthPost.find().sort('-createdAt');
    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
