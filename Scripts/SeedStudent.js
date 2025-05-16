
// 📂 scripts/SeedStudent.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const studentsData = [
 {
    studentId: 2134567,
    name: 'Deema Rabee Tawfiq Abu Hassouneh',
    department: 'SW',
    completedHours: 95,
    password: 'X123456*'
  },
  {
    studentId: 2345678,
    name: 'Ahmad Ased Rashieed Assad',
    department: 'CIS',
    completedHours: 87,
    password: 'D123456*'
  },
  {
    studentId: 3456789,
    name: 'Mahmoud Jehad Hamdan Hadrab',
    department: 'BIT',
    completedHours: 92,
    password: 'F123456*'
  },
  {
    studentId: 2267890,
    name: 'Mohammad Omar Mohd Almashagbeh',
    department: 'AI',
    completedHours: 84,
    password: 'O123456*'
  },
  {
    studentId: 2267877,
    name: ' Ali Khaled ',
    department: 'SW',
    completedHours: 84,
    password: 'O123456*'
  },
  {
    studentId: 2264356,
    name: ' Leen Ahmad ',
    department: 'SW',
    completedHours: 84,
    password: 'O123456*'
  },
  {
    studentId: 2264333,
    name: ' Yara Zaid ',
    department: 'SW',
    completedHours: 84,
    password: 'O123456*'
  },
  {
    studentId: 2137583,
    name: ' Malak Ali ',
    department: 'BIT',
    completedHours: 99,
    password: 'O123456*'
  },
  {
    studentId: 2345467,
    name: ' Noor Rabee ',
    department: 'BIT',
    completedHours: 100,
    password: 'O123456*'
  },
  {
    studentId: 2021230,
    name: ' Ruba Yaser ',
    department: 'SW',
    completedHours: 129,
    password: 'O123456*'
  }

];

const seedStudents = async () => {
  try {
    await Student.deleteMany({});
    await User.deleteMany({ role: 'student' });
    console.log('Previous student data cleared');

    /*for (const studentData of studentsData) {
      const hashedPassword = await bcrypt.hash(studentData.password, 10);

      const user = await User.create({
        studentId: studentData.studentId,
        password: hashedPassword,
        role: 'student'
      });

      await Student.create({
        user: user._id,
        studentId: studentData.studentId,
        name: studentData.name,
        department: studentData.department,
        completedHours: studentData.completedHours
      });
    }*/
   
    // إنشاء مستخدمين وطلاب جدد
    for (const studentData of studentsData) {
      // إنشاء مستخدم (سيتم تشفير كلمة المرور تلقائيًا في pre('save'))
      const user = new User({
        studentId: studentData.studentId,
        password: studentData.password,
        role: 'student'
      });
      await user.save();
      // إنشاء ملف الطالب وربطه بالمستخدم
      await Student.create({
        user: user._id, // ربط الطالب بالمستخدم
        studentId: studentData.studentId,
        name: studentData.name,
        department: studentData.department,
        completedHours: studentData.completedHours,
        trainingStatus: 'NOT_STARTED'
      });
    }


    console.log('Student data seeded successfully!');
    console.log(`Added ${studentsData.length} students to the database`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(seedStudents);

/*require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // تأكد من المسار الصحيح
const Student = require('../models/Student'); // تأكد من المسار الصحيح

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// بيانات وهمية للطلاب
const studentsData = [
  {
    studentId: 2134567,
    name: 'Deema Rabee Tawfiq Abu Hassouneh',
    department: 'SW',
    completedHours: 95,
    password: 'X123456*'
  },
  {
    studentId: 2345678,
    name: 'Ahmad Ased Rashieed Assad',
    department: 'CIS',
    completedHours: 87,
    password: 'D123456*'
  },
  {
    studentId: 3456789,
    name:'Mahmoud Jehad Hamdan Hadrab',
    department: 'BIT',
    completedHours: 92,
    password: 'F123456*'
  },
  {
    studentId: 2267890,
    name: 'Mohammad Omar Mohd Almashagbeh',
    department: 'AI',
    completedHours: 84,
    password: 'O123456*'
  }
];

// وظيفة لإضافة البيانات
const seedStudents = async () => {
  try {
    // حذف البيانات السابقة
    await Student.deleteMany({});
    await User.deleteMany({role: 'student'});

    console.log('Previous student data cleared');
    
    // إنشاء مستخدمين وطلاب جدد
    for (const studentData of studentsData) {
      // إنشاء مستخدم (سيتم تشفير كلمة المرور تلقائيًا في pre('save'))
      const user = new User({
        universityId: studentData.studentId,
        password: studentData.password,
        role: 'student'
      });
      await user.save();
      // إنشاء ملف الطالب وربطه بالمستخدم
      await Student.create({
        user: user._id, // ربط الطالب بالمستخدم
        universityId: studentData.studentId,
        name: studentData.name,
        department: studentData.department,
        completedHours: studentData.completedHours,
        trainingStatus: 'NOT_STARTED'
      });
    }
    
    console.log('Student data seeded successfully!');
    console.log(`Added ${studentsData.length} students to the database`);
    console.log('Students can login with their universityId and password "student123"');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// تنفيذ العملية
connectDB().then(() => {
  seedStudents();
});
*/
