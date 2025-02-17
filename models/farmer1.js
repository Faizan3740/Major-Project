const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const farmerSchema1 = new Schema({
    email:{
        type:String,
        required:true
    },
});

farmerSchema1.plugin(passportLocalMongoose);

module.exports = mongoose.model('Farmer1', farmerSchema1);