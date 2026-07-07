require("dns").setServers(["8.8.8.8"]);
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require('mongoose');

async function test() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB using URI from .env...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

test();
