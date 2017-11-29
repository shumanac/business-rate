var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    fullname: {type: String, required: true},
    email: {type: String, required: true},
    password:{type: String},
    role: {type: String, default: ''},
    company: {
        name: {type: String, default: ''},
        image:{type: String, default: ''}
    },
    passwordResetToken: {type: String, default: ''},
    passwordResetExpires: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', userSchema);