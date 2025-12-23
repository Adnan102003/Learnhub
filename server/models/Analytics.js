const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  enrollments: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  averageProgress: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  totalWatchTime: {
    type: Number,
    default: 0
  },
  quizAttempts: {
    type: Number,
    default: 0
  },
  averageQuizScore: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

AnalyticsSchema.index({ course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);