const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    subscribed: {
        type: Boolean,
        required: true
    }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.export = User