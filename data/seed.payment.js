module.exports = (students, educations) => [
  { studentId: students[0]._id, educationId: educations[0]._id, amount: 850, status: 'paid', paymentDate: '2026-08-28' },
  { studentId: students[1]._id, educationId: educations[1]._id, amount: 720, status: 'paid', paymentDate: '2026-09-10' },
  { studentId: students[2]._id, educationId: educations[2]._id, amount: 640, status: 'pending', paymentDate: '2026-09-25' },
  { studentId: students[3]._id, educationId: educations[3]._id, amount: 500, status: 'paid', paymentDate: '2026-01-25' }
];
