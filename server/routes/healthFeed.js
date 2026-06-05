const express = require('express');
const {
  getAllPosts, getPostBySlug, likePost,
  createPost, updatePost, deletePost, getAllPostsAdmin
} = require('../controllers/healthFeedController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public / patient
router.get('/', protect, getAllPosts);
router.get('/slug/:slug', protect, getPostBySlug);
router.put('/:id/like', protect, likePost);

// Admin
router.get('/admin/all', protect, authorize('admin'), getAllPostsAdmin);
router.post('/', protect, authorize('admin'), createPost);
router.put('/:id', protect, authorize('admin'), updatePost);
router.delete('/:id', protect, authorize('admin'), deletePost);

module.exports = router;
