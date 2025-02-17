const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const authoritySchema1 = new Schema({
    email:{
        type:String,
        required:true
    },
});

authoritySchema1.plugin(passportLocalMongoose);

module.exports = mongoose.model('Authority1', authoritySchema1);