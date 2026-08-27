const { GoogleGenAI } = require('@google/genai');
const AdminModel = require('../models/Admin.model');
const StudentModel = require('../models/Student.model');
const TeacherModel = require('../models/Teacher.model');
const EducationModel = require('../models/Education.model');
const PaymentModel = require('../models/Payment.model');

const systemPrompt = `
Tu es GroupUp AI, l'agent intelligent d'une plateforme E-Learning.
Reponds en francais, de maniere claire, professionnelle et concise.
Identifie toujours le role de l'utilisateur et respecte ses permissions.
N'invente jamais de donnee et ne revele jamais de mot de passe ni de donnee privee
d'un autre utilisateur. Distingue les donnees internes, les deductions et les
informations indisponibles. Pour une demande externe et actuelle, utilise la
recherche Google si elle est disponible. Les donnees internes de GroupUp sont
toujours prioritaires pour les utilisateurs, formations, paiements et progression.
Pour analyser une progression, utilise progress, attendance, status et les
formations disponibles. Pour un paiement, utilise uniquement transactionId,
amount, paymentDate et status.
`;

const publicUserFields = 'name firstName email';

function wantsExternalSearch(message) {
  return /actualit|aujourd|maintenant|dernier|derniere|externe|news|recent/i.test(message);
}

async function buildContext(role, userId) {
  if (role === 'student') {
    const student = await StudentModel.findById(userId).select(publicUserFields).lean();
    if (!student) return null;

    const [courses, payments] = await Promise.all([
      EducationModel.find({ students: userId })
        .select('programme startDate endDate progress attendance status teacherId')
        .lean(),
      PaymentModel.find({ studentId: userId })
        .select('transactionId amount paymentDate status educationId')
        .lean()
    ]);
    return { role, user: student, courses, payments };
  }

  if (role === 'teacher') {
    const teacher = await TeacherModel.findById(userId).select(publicUserFields).lean();
    if (!teacher) return null;
    const courses = await EducationModel.find({ teacherId: userId })
      .select('programme startDate endDate progress attendance status students')
      .populate('students', publicUserFields)
      .lean();
    return { role, user: teacher, courses };
  }

  const admin = await AdminModel.findById(userId).select(publicUserFields).lean();
  if (!admin) return null;
  const [students, teachers, courses, payments] = await Promise.all([
    StudentModel.countDocuments(),
    TeacherModel.countDocuments(),
    EducationModel.countDocuments(),
    PaymentModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);
  return { role, user: admin, statistics: { students, teachers, courses, payments } };
}

async function askGroupUpAI({ role, userId, message }) {
  const context = await buildContext(role, userId);
  if (!context) {
    const error = new Error('Utilisateur introuvable pour ce role');
    error.status = 404;
    throw error;
  }
  if (!process.env.api_key_ia) {
    const error = new Error('API_KEY_IA is not configured');
    error.status = 503;
    throw error;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.api_key_ia });
  const request = {
    model: 'gemini-3.6-flash',
    contents: `${systemPrompt}

Contexte GroupUp :
${JSON.stringify(context, null, 2)}

Demande :
${message}`
  };
  if (wantsExternalSearch(message)) request.tools = [{ googleSearch: {} }];

  const response = await ai.models.generateContent(request);
  return response.text || 'Je ne dispose pas d’une réponse exploitable pour cette demande.';
}

module.exports = { askGroupUpAI };