const express = require('express');
const Analytics = require('../models/Analytics');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Instructor analytics overview
router.get('/instructor/overview', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    const courseIds = courses.map(c => c._id);

    const totalEnrollments = await Enrollment.countDocuments({
      course: { $in: courseIds }
    });

    const completedEnrollments = await Enrollment.countDocuments({
      course: { $in: courseIds },
      status: 'completed'
    });

    const totalRevenue = courses.reduce((sum, course) => {
      return sum + (course.price * course.enrolledCount);
    }, 0);

    const avgRating = courses.reduce((sum, course) => sum + course.rating, 0) / courses.length;

    res.status(200).json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalEnrollments,
        completedEnrollments,
        totalRevenue,
        avgRating: avgRating.toFixed(1),
        totalStudents: req.user.totalStudents
      }
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Course analytics
router.get('/course/:courseId', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId });
    
    const avgProgress = enrollments.reduce((sum, e) => sum + e.progress.percentage, 0) / enrollments.length;
    
    const completedCount = enrollments.filter(e => e.status === 'completed').length;

    res.status(200).json({
      success: true,
      data: {
        course: course.title,
        enrolledCount: course.enrolledCount,
        completedCount,
        avgProgress: avgProgress.toFixed(1),
        rating: course.rating,
        reviewCount: course.reviewCount,
        revenue: course.price * course.enrolledCount
      }
    });
  } catch (error) {
    console.error('Course analytics error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;