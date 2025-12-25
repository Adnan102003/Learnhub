const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config();

// Import models - CORRECT WAY
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// Connect to database
mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  try {
    console.log('Seeding database...'.yellow);

    // Delete existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@learnhub.com',
      password: 'Admin123!',
      role: 'admin',
      isVerified: true,
      isActive: true
    });
    console.log('✅ Admin user created'.green);

    // Create instructor
    const instructor = await User.create({
      name: 'John Instructor',
      email: 'instructor@learnhub.com',
      password: 'Instructor123!',
      role: 'instructor',
      isVerified: true,
      isActive: true,
      expertise: ['Web Development', 'JavaScript', 'React']
    });
    console.log('✅ Instructor user created'.green);

    // Create student
    const student = await User.create({
      name: 'Jane Student',
      email: 'student@learnhub.com',
      password: 'Student123!',
      role: 'student',
      isVerified: true,
      isActive: true
    });
    console.log('✅ Student user created'.green);

    // Create sample course
    const course = await Course.create({
      title: 'Complete Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB from scratch. Build real-world projects and become a full-stack web developer.',
      shortDescription: 'Become a full-stack web developer',
      instructor: instructor._id,
      category: 'Web Development',
      level: 'beginner',
      price: 49.99,
      tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      learningOutcomes: [
        'Build responsive websites with HTML and CSS',
        'Create interactive web applications with JavaScript',
        'Develop modern UIs with React',
        'Build backend APIs with Node.js',
        'Work with MongoDB databases'
      ],
      targetAudience: [
        'Beginners who want to learn web development',
        'Students looking to build a career in tech',
        'Anyone interested in creating websites'
      ],
      prerequisites: [
        'Basic computer skills',
        'No programming experience needed'
      ],
      status: 'published',
      publishedAt: Date.now(),
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      language: 'English'
    });
    console.log('✅ Sample course created'.green);

    // Create sample lessons
    const lesson1 = await Lesson.create({
      course: course._id,
      section: 'Introduction',
      title: 'Welcome to the Course',
      type: 'video',
      order: 1,
      videoDuration: 300,
      isFree: true,
      content: 'Welcome to the Complete Web Development Bootcamp! In this course, you will learn everything you need to become a professional web developer.'
    });
    console.log('✅ Lesson 1 created'.green);

    const lesson2 = await Lesson.create({
      course: course._id,
      section: 'HTML Basics',
      title: 'HTML Introduction',
      type: 'video',
      order: 2,
      videoDuration: 600,
      content: 'Learn the fundamentals of HTML - the building block of every website.'
    });
    console.log('✅ Lesson 2 created'.green);

    const lesson3 = await Lesson.create({
      course: course._id,
      section: 'HTML Basics',
      title: 'HTML Tags and Elements',
      type: 'video',
      order: 3,
      videoDuration: 900,
      content: 'Dive deep into HTML tags and learn how to structure web pages.'
    });
    console.log('✅ Lesson 3 created'.green);

    // Update course with sections and lessons
    course.sections = [
      {
        title: 'Introduction',
        order: 1,
        lessons: [lesson1._id]
      },
      {
        title: 'HTML Basics',
        order: 2,
        lessons: [lesson2._id, lesson3._id]
      }
    ];
    course.totalLessons = 3;
    course.totalVideos = 3;
    course.totalDuration = 1800; // 30 minutes
    await course.save();
    console.log('✅ Course updated with lessons'.green);

    // Update instructor with created course
    instructor.createdCourses.push(course._id);
    instructor.totalStudents = 0;
    await instructor.save();
    console.log('✅ Instructor updated'.green);

    console.log('\n✅ Database seeded successfully!'.green.bold);
    console.log('\n📝 Test Accounts:'.cyan.bold);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'.cyan);
    console.log('👨‍💼 Admin:'.yellow);
    console.log('   Email:    admin@learnhub.com');
    console.log('   Password: Admin123!');
    console.log('');
    console.log('👨‍🏫 Instructor:'.yellow);
    console.log('   Email:    instructor@learnhub.com');
    console.log('   Password: Instructor123!');
    console.log('');
    console.log('👨‍🎓 Student:'.yellow);
    console.log('   Email:    student@learnhub.com');
    console.log('   Password: Student123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'.cyan);
    console.log('\n🚀 You can now start the server with: npm run dev'.green);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:'.red, error);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    console.log('🗑️  Deleting all data...'.yellow);
    
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    
    console.log('✅ Data deleted successfully!'.red.bold);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting data:'.red, error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  deleteData();
} else {
  seedData();
}