try {
  require("dns").setServers(["8.8.8.8"]);
} catch (err) {}
const mongoose = require("mongoose");
require("dotenv").config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const coll = db.collection("llndassessments");
        const docs = await coll.find().limit(5).toArray();
        console.log(JSON.stringify(docs, null, 2));
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}

check();
