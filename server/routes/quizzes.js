const express = require('express');
const {
  createQuiz,
  submitQuiz
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('instructor', 'admin'), createQuiz);
router.post('/:id/submit', protect, submitQuiz);

module.exports = router;