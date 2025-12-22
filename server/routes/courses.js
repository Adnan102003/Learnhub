const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, authorize('instructor', 'admin'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('instructor', 'admin'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

router.patch('/:id/publish', protect, authorize('instructor', 'admin'), publishCourse);

module.exports = router;
