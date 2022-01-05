const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema =  new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    body: {
        type: String,
        required: true
    },
    meta: {
        votes: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true })

const Post = mongoose.model('Post', postSchema)

module.exports = Post