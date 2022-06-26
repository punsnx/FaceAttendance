const mongoose = require('mongoose');

var Schema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    }
});

const User = mongoose.model('users', Schema);
module.exports = User;