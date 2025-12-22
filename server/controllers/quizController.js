const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

exports.createQuiz = async (req, res) => {
  try {
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const totalPoints = req.body.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    req.body.totalPoints = totalPoints;

    const quiz = await Quiz.create(req.body);

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    const previousAttempts = await QuizAttempt.countDocuments({
      user: req.user.id,
      quiz: quiz._id
    });

    if (previousAttempts >= quiz.attemptsAllowed) {
      return res.status(400).json({
        success: false,
        error: 'Maximum attempts reached'
      });
    }

    const { answers, timeSpent } = req.body;
    
    let score = 0;
    const evaluatedAnswers = answers.map(answer => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      const isCorrect = JSON.stringify(question.correctAnswer) === JSON.stringify(answer.selectedAnswer);
      const pointsEarned = isCorrect ? question.points : 0;
      score += pointsEarned;
      
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        pointsEarned
      };
    });

    const percentage = (score / quiz.totalPoints) * 100;
    const passed = percentage >= quiz.passingPercentage;

    const attempt = await QuizAttempt.create({
      user: req.user.id,
      quiz: quiz._id,
      answers: evaluatedAnswers,
      score,
      percentage,
      passed,
      timeSpent,
      attemptNumber: previousAttempts + 1,
      submittedAt: Date.now()
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};