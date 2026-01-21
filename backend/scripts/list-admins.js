require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/results_db';

async function main() {
  await mongoose.connect(MONGO_URI);

  // Use the same collection name mongoose would use for model "Admin" => "admins"
  const admins = await mongoose.connection.collection('admins').find({}).toArray();

  if (!admins.length) {
    console.log('No admins found in DB.');
  } else {
    console.log('Admins in DB (plain text passwords if you stored them that way):');
    for (const a of admins) {
      console.log(`- email=${a.email} password=${a.password}`);
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
