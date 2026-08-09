const mongo = require('mongoose');

module.exports.connectDB = async () => {
  try {
    await mongo.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

