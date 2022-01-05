require('dotenv').config()

const express = require('express')
const session = require('express-session')
const path = require('path')
const logger = require('morgan')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const Post = require('./models/post')

const port = 3000

// connect to mongodb
mongoose.connect(process.env.DB_URI, {useUnifiedTopology: true, useNewUrlParser: true})
        .then(result => app.listen(port, (req, res) => {
            console.log("listening on port: " + port)
        }))
        .catch(err => console.log(err))

// express app
const app = express()

// register view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// middleware & static files
app.use(logger('dev'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: false}))

// middleware for user authentication & session creation
passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({ username: username }, (err, user) => {
            if (err) return done(err)
            if (!user) return done(null, false, { message: 'Invalid username'})
            if (!(user.password === password)) return done(null, false, { message: 'Invalid password'})
            return done(null, user)
        })
    })
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
})
app.use(session({ secret: "chimps", resave: false}))
app.use(passport.initialize())
app.use(passport.session())

// routes
app.get('/', (req, res) => {
    res.render('home', {title: 'Home'})
})

app.get('/sign-up', (req, res) => {
    res.render('sign-up', {title: 'Sign-up'})
})

app.post('/sign-up', (req, res) => {
    const { email, username, password, subscribed = "off" } = req.body

    const user = new User({
        email,
        username,
        password,
        subscribed: subscribed === 'on' ? true : false
    })

    user.save()
        .then(doc => {
            res.redirect('/')
        })
        .catch(err => console.log(err))
})

app.get('/sign-in', (req, res) => {
    res.render('sign-in', {title: "Sign-in", user: req.user})
})

app.post('/log-in',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/fail'
    })
)

app.get('/log-out', (req, res) => {
    req.logout()
    res.redirect('/')
})

app.get('/posts', (req, res) => {
    Post.find()
        .then(posts => {
            res.render('posts', {title: "All Posts", posts})
        })
        .catch(err => {
            console.log(err)
        })
})

app.get('/my-posts', (req, res) => {
    /** @todo fetch user's posts */
    res.render('posts', {title: "My Posts", posts})
})


// 404 error handler
app.use((req, res) => {
    res.status(404).render('404', {title: '404'})
})