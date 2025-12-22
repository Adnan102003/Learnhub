const LessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  section: String,
  title: {
    type: String,
    required: [true, 'Please add a lesson title']
  },
  type: {
    type: String,
    enum: ['video', 'text', 'quiz', 'assignment'],
    default: 'video'
  },
  order: {
    type: Number,
    required: true
  },
  videoUrl: String,
  videoDuration: Number,
  videoTranscript: String,
  content: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  allowNotes: {
    type: Boolean,
    default: true
  },
  isFree: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', LessonSchema);