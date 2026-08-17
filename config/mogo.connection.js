const mongoose = require('mongoose');

module.exports.connectToMongoDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://aziz:Azerty.123@cluster0.bldeeml.mongodb.net/").then(() => {
      console.log('MongoDB is connected');
    }).catch((error) => {
      console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    });
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
  }
};