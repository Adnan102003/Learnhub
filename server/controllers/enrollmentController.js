const Enrollment = require('../models/Enrollment');

exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.status !== 'published') {
      return res.status(400).json({ success: false, error: 'Course is not published' });
    }

    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, error: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: req.params.courseId,
      progress: {
        totalLessons: course.totalLessons,
        percentage: 0
      }
    });

    await Course.findByIdAndUpdate(req.params.courseId, {
      $inc: { enrolledCount: 1 }
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: course._id }
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course', 'title thumbnail instructor rating totalLessons')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};