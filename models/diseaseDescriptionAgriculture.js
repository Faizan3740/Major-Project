const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const diseaseDescriptionAgriculture = new Schema({
    cropType:{
        type: String,
        required : true
    },
    filePath: [{
        type: String,
        // required : true
    }],
    diseaseDescription:{
        type:String,
        required: true
    },
    solution:{
        type:String,
        required: true
    },
    isProblemSolved:{
        type:String,
        required: true
    },
    location:{
        type:String,
        required: true
    },
    geometry:{
        type:{
            type: String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    }
});

const DiseaseDescriptionUserAgriculture = mongoose.model("DiseaseDescriptionUserAgriculture", diseaseDescriptionAgriculture);
module.exports = DiseaseDescriptionUserAgriculture;



