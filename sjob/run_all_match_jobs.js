const path = require("path");
const mongoose = require("mongoose");

// Load ROOT .env
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

// -----------------------------------
// CENTRALIZED DB CONNECTION
// -----------------------------------
async function connectDB() {
  try {
    const MONGO_URI = process.env.DB_URL || 
      "mongodb://realto:realto123@207.180.239.115:27017/realtodb";

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
}

async function runJob(jobPath) {
  try {
    console.log(`🚀 Starting job: ${jobPath}`);
    require(jobPath); // Loads the job (job's schedule starts automatically)
  } catch (err) {
    console.error(`❌ Failed to start ${jobPath}:`, err.message);
  }
}

(async () => {
  await connectDB(); // << Connect once

  const jobs = [
    './residentialRentPropertyMatchJob.js',
    './residentialBuyPropertyMatchJob.js',
    './commercialRentPropertyMatchJob.js',
    './commercialBuyPropertyMatchJob.js'
  ];

  for (const jobFile of jobs) {
    await runJob(path.resolve(__dirname, jobFile));
  }

  console.log("✅ All Match Jobs Started.");
})();
module.exports = mongoose;