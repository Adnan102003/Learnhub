const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

exports.getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, search, sort } = req.query;
    
    let query = { status: 'published' };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = {};
    if (sort === 'popular') sortOption = { enrolledCount: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else sortOption = { createdAt: -1 };

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar rating')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio rating totalStudents')
      .populate({
        path: 'sections.lessons',
        select: 'title type order videoDuration isFree'
      });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    req.body.instructor = req.user.id;
    
    const course = await Course.create(req.body);

    await User.findByIdAndUpdate(req.user.id, {
      $push: { createdCourses: course._id }
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await course.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    course.status = 'published';
    course.publishedAt = Date.now();
    await course.save();

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error('Publish course error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};