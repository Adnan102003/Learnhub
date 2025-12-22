const Progress = require('../models/Progress');

exports.updateProgress = async (req, res) => {
  try {
    const { watchedDuration, totalDuration } = req.body;
    
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    const percentage = (watchedDuration / totalDuration) * 100;
    const isCompleted = percentage >= 90;

    let progress = await Progress.findOne({
      user: req.user.id,
      lesson: req.params.lessonId
    });

    if (progress) {
      progress.watchedDuration = watchedDuration;
      progress.totalDuration = totalDuration;
      progress.percentage = percentage;
      progress.isCompleted = isCompleted;
      progress.lastWatchedAt = Date.now();
      await progress.save();
    } else {
      progress = await Progress.create({
        user: req.user.id,
        course: lesson.course,
        lesson: req.params.lessonId,
        watchedDuration,
        totalDuration,
        percentage,
        isCompleted
      });
    }

    if (isCompleted) {
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: lesson.course
      });

      if (enrollment && !enrollment.progress.completedLessons.includes(lesson._id)) {
        enrollment.progress.completedLessons.push(lesson._id);
        enrollment.progress.percentage = 
          (enrollment.progress.completedLessons.length / enrollment.progress.totalLessons) * 100;
        enrollment.progress.lastAccessedLesson = lesson._id;
        enrollment.progress.lastAccessedAt = Date.now();
        await enrollment.save();
      }
    }

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};