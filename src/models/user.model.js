const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    number: {
        type: String,
        required: true,
        unique: true,
    },
    
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    token: {
        type: String,
        default: null
    },
    
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);