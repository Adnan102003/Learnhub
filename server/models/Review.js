const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  helpfulCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

ReviewSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);