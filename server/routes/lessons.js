const express = require('express');
const {
  createLesson,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.post('/', protect, authorize('instructor', 'admin'), createLesson);
router.put('/:id', protect, authorize('instructor', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteLesson);

module.exports = router;
