const express = require('express')
const path = require('path')
const logger = require('morgan')
const mongoose = require('mongoose')

const mongoDB = "mongodb+srv://gbxander:test1234@sailchimp.e6x8s.mongodb.net/sailchimp-db?retryWrites=true&w=majority"
mongoose.connect(mongoDB, {useUnifiedTopology: true, useNewUrlParser: true})

const app = express()

const port = 3000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.listen(port, (req, res) => {
    console.log("listening on port: " + port)
})

app.use(logger('dev'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.render('home', {title: 'Home'})
})

app.get('/sign-up', (req, res) => {
    res.render('sign-up', {title: 'Sign-up'})
})

app.get('/sign-in', (req, res) => {
    res.render('sign-in', {title: "Sign-in"})
})

app.get('/posts', (req, res) => {
    const posts = []
    res.render('posts', {title: "All Posts", posts})
})

app.get('/my-posts', (req, res) => {
    const posts = []
    res.render('posts', {title: "My Posts", posts})
})

app.use((req, res) => {
    res.status(404).render('404', {title: '404'})
})