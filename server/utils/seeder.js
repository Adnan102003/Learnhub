const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

dotenv.config();

const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  try {
    console.log('Seeding database...'.yellow);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@learnhub.com',
      password: 'Admin123!',
      role: 'admin',
      isVerified: true
    });

    // Create instructor
    const instructor = await User.create({
      name: 'John Instructor',
      email: 'instructor@learnhub.com',
      password: 'Instructor123!',
      role: 'instructor',
      isVerified: true,
      expertise: ['Web Development', 'JavaScript', 'React']
    });

    // Create student
    const student = await User.create({
      name: 'Jane Student',
      email: 'student@learnhub.com',
      password: 'Student123!',
      role: 'student',
      isVerified: true
    });

    // Create sample course
    const course = await Course.create({
      title: 'Complete Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB from scratch.',
      shortDescription: 'Become a full-stack web developer',
      instructor: instructor._id,
      category: 'Web Development',
      level: 'beginner',
      price: 49.99,
      tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      learningOutcomes: [
        'Build responsive websites',
        'Create web applications with React',
        'Develop backend APIs with Node.js',
        'Work with databases'
      ],
      status: 'published',
      publishedAt: Date.now()
    });

    // Create sample lessons
    const lesson1 = await Lesson.create({
      course: course._id,
      section: 'Introduction',
      title: 'Welcome to the Course',
      type: 'video',
      order: 1,
      videoDuration: 300,
      isFree: true
    });

    const lesson2 = await Lesson.create({
      course: course._id,
      section: 'HTML Basics',
      title: 'HTML Introduction',
      type: 'video',
      order: 2,
      videoDuration: 600
    });

    // Update course with sections
    course.sections = [
      {
        title: 'Introduction',
        order: 1,
        lessons: [lesson1._id]
      },
      {
        title: 'HTML Basics',
        order: 2,
        lessons: [lesson2._id]
      }
    ];
    course.totalLessons = 2;
    course.totalVideos = 2;
    course.totalDuration = 900;
    await course.save();

    console.log('✅ Database seeded successfully!'.green.bold);
    console.log('\nTest Accounts:'.cyan.bold);
    console.log('Admin: admin@learnhub.com / Admin123!');
    console.log('Instructor: instructor@learnhub.com / Instructor123!');
    console.log('Student: student@learnhub.com / Student123!');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding database:'.red, error);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    
    console.log('✅ Data deleted successfully!'.red.bold);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  deleteData();
} else {
  seedData();
}