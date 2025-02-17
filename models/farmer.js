const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const farmerSchema = new Schema({
    email:{
        type:String,
        required:true
    },
});

farmerSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Farmer', farmerSchema);