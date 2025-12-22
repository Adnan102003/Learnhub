const express = require('express');
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get lesson notes
router.get('/lesson/:lessonId', protect, async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user.id,
      lesson: req.params.lessonId
    }).sort('timestamp');

    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create note
router.post('/', protect, async (req, res) => {
  try {
    req.body.user = req.user.id;
    
    const note = await Note.create(req.body);

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update note
router.put('/:id', protect, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete note
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await note.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
