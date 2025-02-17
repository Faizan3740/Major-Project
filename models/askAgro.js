const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const agroSchema =new Schema({
    farmerName :{
        type: String,
        required : true
    },
    diseaseInfo:[
        {
            type:Schema.Types.ObjectId,
            ref: "DiseaseDescriptionUserAgriculture"
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

const AskAgro = mongoose.model("AskAgro", agroSchema);
module.exports = AskAgro;