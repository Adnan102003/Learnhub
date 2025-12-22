const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive, accountStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, accountStatus },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get all courses (including drafts)
router.get('/courses', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const count = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Platform analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    
    const students = await User.countDocuments({ role: 'student' });
    const instructors = await User.countDocuments({ role: 'instructor' });
    
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        students,
        instructors,
        totalCourses,
        publishedCourses,
        totalEnrollments
      }
    });
  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;