const express = require('express');
const Review = require('../models/Review');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Add review
router.post('/', protect, async (req, res) => {
  try {
    const { course, rating, comment } = req.body;

    const existingReview = await Review.findOne({
      user: req.user.id,
      course
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this course'
      });
    }

    const review = await Review.create({
      user: req.user.id,
      course,
      rating,
      comment
    });

    // Update course rating
    const reviews = await Review.find({ course });
    const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;
    
    await Course.findByIdAndUpdate(course, {
      rating: avgRating.toFixed(1),
      reviewCount: reviews.length
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get course reviews
router.get('/course/:courseId', async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;