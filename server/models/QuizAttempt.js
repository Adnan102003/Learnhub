const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    questionId: String,
    selectedAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: Number,
  percentage: Number,
  passed: Boolean,
  timeSpent: Number,
  attemptNumber: Number,
  submittedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);