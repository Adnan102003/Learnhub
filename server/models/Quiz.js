const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  instructions: String,
  questions: [{
    question: String,
    type: {
      type: String,
      enum: ['mcq', 'true-false', 'fill-blank'],
      default: 'mcq'
    },
    options: [String],
    correctAnswer: mongoose.Schema.Types.Mixed,
    explanation: String,
    points: {
      type: Number,
      default: 1
    },
    order: Number
  }],
  totalPoints: Number,
  passingPercentage: {
    type: Number,
    default: 60
  },
  timeLimit: Number,
  attemptsAllowed: {
    type: Number,
    default: 3
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  showAnswers: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);
