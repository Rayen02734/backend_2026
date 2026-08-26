const mongoose = require('mongoose');

module.exports.connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.mongo_url).then(() => {
      console.log('MongoDB is connected');
    }).catch((error) => {
      console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    });
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
  }
};