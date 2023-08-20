const mongoose = require("mongoose");

const uri = process.env.MONGODB_CONNECTION_STRING;

const dbConnect = async () => {
  try {
    await mongoose.connect(uri, { dbName: "PICA_PROFILE" }).then((conn) => {
      console.log(`Database Connected to host:${conn.connection.host}`);
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = dbConnect;
