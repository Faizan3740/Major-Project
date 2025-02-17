const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const authoritySchema = new Schema({
    email:{
        type:String,
        required:true
    },
});

authoritySchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Authority', authoritySchema);