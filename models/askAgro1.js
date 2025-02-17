const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const agroSchema1 =new Schema({
    farmerName :{
        type: String,
        required : true
    },
    diseaseInfo:[
        {
            type:Schema.Types.ObjectId,
            ref: "DiseaseDescriptionUserAgriculture1"
        }
    ],
    phoneNumber:{
        type: String,
        required : true
    },
    email:{
        type: String,
        required : true
    }
});

const AskAgro1 = mongoose.model("AskAgro1", agroSchema1);
module.exports = AskAgro1;