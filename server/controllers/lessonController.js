exports.createLesson = async (req, res) => {
  try {
    req.body.course = req.params.courseId;
    
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const lesson = await Lesson.create(req.body);

    const sectionIndex = course.sections.findIndex(s => s.title === req.body.section);
    if (sectionIndex !== -1) {
      course.sections[sectionIndex].lessons.push(lesson._id);
    } else {
      course.sections.push({
        title: req.body.section,
        order: course.sections.length + 1,
        lessons: [lesson._id]
      });
    }

    course.totalLessons += 1;
    if (lesson.type === 'video') {
      course.totalVideos += 1;
      course.totalDuration += lesson.videoDuration || 0;
    } else if (lesson.type === 'quiz') {
      course.totalQuizzes += 1;
    }

    await course.save();

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    let lesson = await Lesson.findById(req.params.id).populate('course');

    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');

    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await lesson.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};