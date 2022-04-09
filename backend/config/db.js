const mongoose = require("mongoose");

const connectToDB = async () => {
  const uri = process.env.ATLAS_URI;
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`ERROR: ${error.message}`);
    process.exit();
  }
};

module.exports = connectToDB;
