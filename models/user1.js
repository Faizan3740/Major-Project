const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema1 = new Schema({
    email:{
        type:String,
        required:true
    },
});

userSchema1.plugin(passportLocalMongoose);

module.exports = mongoose.model('User1', userSchema1);