const mongoose = require("mongoose");
const initData = require("./data.js");
const AskAgro = require("../models/askAgro.js");

main().then(()=>{
    console.log("Connection Successful");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/IntegratedCare');
};

const initDB = async () => {
    await AskAgro.deleteMany({});
//    initData.data = initData.data.map((obj) => ({...obj, owner:"6737515bd228dcef2a22d67a"}));
    let a = await AskAgro.insertMany(initData.data);
    console.log(a);
    console.log("Data was initialized");
};

initDB();