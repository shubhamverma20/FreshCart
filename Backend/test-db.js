const mongoose = require('mongoose');
const srvUri = 'mongodb+srv://shubhamverma0299_db_user:verma3030@cluster0.zyz42mb.mongodb.net/?appName=FreshCart';
const directUri = 'mongodb://shubhamverma0299_db_user:verma3030@ac-qehqtqs-shard-00-00.zyz42mb.mongodb.net:27017,ac-qehqtqs-shard-00-01.zyz42mb.mongodb.net:27017,ac-qehqtqs-shard-00-02.zyz42mb.mongodb.net:27017/?ssl=true&replicaSet=atlas-652r6b-shard-0&authSource=admin&appName=FreshCart';

async function test() {
  try {
    console.log("Testing direct URI...");
    await mongoose.connect(directUri);
    console.log("Direct URI Success!");
    await mongoose.disconnect();
  } catch (e) {
    console.error("Direct URI Failed:", e.message);
  }

  try {
    console.log("Testing SRV URI...");
    await mongoose.connect(srvUri);
    console.log("SRV URI Success!");
    await mongoose.disconnect();
  } catch (e) {
    console.error("SRV URI Failed:", e.message);
  }
}
test();
