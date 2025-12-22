const express = require('express');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const { protect } = require('../middleware/auth');
const { generateCertificate } = require('../utils/generateCertificate');

const router = express.Router();

// Get my certificates
router.get('/my', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate('course', 'title thumbnail instructor')
      .sort('-issuedAt');

    res.status(200).json({ success: true, data: certificates });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Generate certificate (when course completed)
router.post('/generate/:courseId', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        error: 'Not enrolled in this course'
      });
    }

    if (enrollment.progress.percentage < 100) {
      return res.status(400).json({
        success: false,
        error: 'Course not completed yet'
      });
    }

    const existingCertificate = await Certificate.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        data: existingCertificate
      });
    }

    const certificateNumber = `LH-${Date.now()}-${req.user.id.toString().slice(-6)}`;

    const certificate = await Certificate.create({
      user: req.user.id,
      course: req.params.courseId,
      certificateNumber
    });

    // Generate PDF (implement this function)
    // const pdfUrl = await generateCertificate(certificate);
    // certificate.pdfUrl = pdfUrl;
    // await certificate.save();

    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;