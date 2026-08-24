const mongoose = require('mongoose');
const Admin = require('../models/Admin.model');
const Teacher = require('../models/Teacher.model');
const Student = require('../models/Student.model');
const Education = require('../models/Education.model');
const Payment = require('../models/Payment.model');

const adminsData = require('./seed.admin');
const teachersData = require('./seed.teacher');
const studentsData = require('./seed.student');
const getEducationData = require('./seed.education');
const getPaymentData = require('./seed.payment');

const mongoUri = 'mongodb+srv://aziz:Azerty.123@cluster0.bldeeml.mongodb.net/backend_2026';

async function upsertByEmail(Model, documents) {
  return Promise.all(documents.map((document) => Model.findOneAndUpdate(
    { email: document.email },
    { $set: document },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  )));
}

async function upsertEducation(education) {
  return Education.findOneAndUpdate(
    { programme: education.programme },
    { $set: education },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

async function upsertPayment(payment) {
  return Payment.findOneAndUpdate(
    { studentId: payment.studentId, educationId: payment.educationId },
    { $set: payment },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  await mongoose.connect(mongoUri);

  const admins = await upsertByEmail(Admin, adminsData);
  const teachers = await upsertByEmail(Teacher, teachersData);
  const students = await upsertByEmail(Student, studentsData);
  const educations = await Promise.all(getEducationData(teachers).map(upsertEducation));
  await Promise.all(getPaymentData(students, educations).map(upsertPayment));

  await Promise.all(admins.map((admin, index) => Admin.updateOne(
    { _id: admin._id },
    { $set: { students: [students[index]._id], teachers: [teachers[index]._id] } }
  )));

  await Promise.all(teachers.map((teacher, index) => Teacher.updateOne(
    { _id: teacher._id },
    { $set: { adminId: admins[index]._id, courses: [educations[index]._id] } }
  )));

  await Promise.all(students.map((student, index) => Student.updateOne(
    { _id: student._id },
    { $set: { adminId: admins[index]._id, courses: [educations[index]._id] } }
  )));

  await Promise.all(educations.map((education, index) => Education.updateOne(
    { _id: education._id },
    { $set: { students: [students[index]._id] } }
  )));

  console.log('Seed termine : 4 documents par modele ont ete ajoutes ou mis a jour.');
}

seed()
  .catch((error) => {
    console.error(`Erreur pendant le seed : ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
