const mongoose = require("mongoose");
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'DevOps',
      'Cloud Computing',
      'Cybersecurity',
      'UI/UX Design',
      'Business',
      'Marketing',
      'Other'
    ]
  },
  tags: [String],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  language: {
    type: String,
    default: 'English'
  },
  thumbnail: String,
  previewVideo: String,
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  discount: {
    percentage: Number,
    expiresAt: Date
  },
  sections: [{
    title: String,
    order: Number,
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
  }],
  totalLessons: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  totalVideos: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
  prerequisites: [String],
  learningOutcomes: [String],
  targetAudience: [String],
  enrolledCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  isFeatured: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const slugify = require('slugify');
CourseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Course', CourseSchema);