const express = require('express');
const {
  enrollCourse,
  getMyEnrollments
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/:courseId', protect, enrollCourse);
router.get('/my-courses', protect, getMyEnrollments);

module.exports = router;
