
const mongoose = require('mongoose');
const post = require('./post');

mongoose.connect('mongodb://localhost:27017/miniproject');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    email: String,
    name: String,
    posts: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'post'}
    ]
});

module.exports = mongoose.model('user', userSchema);