const { askGroupUpAI } = require('../services/groupupAI.service');

exports.chat = async (req, res) => {
  try {
    const role = String(req.body.role || '').trim().toLowerCase();
    const { userId, message } = req.body;
    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ success: false, message: 'role must be admin, teacher, or student' });
    }
    if (!userId || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'userId and message are required' });
    }

    const answer = await askGroupUpAI({ role, userId, message: message.trim() });
    res.status(200).json({ success: true, data: { answer } });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};