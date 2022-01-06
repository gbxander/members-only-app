require('dotenv').config()

const express = require('express')
const session = require('express-session')
const path = require('path')
const logger = require('morgan')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
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
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                  // passwords match! log user in
                  return done(null, user)
                } else {
                  // passwords do not match!
                  return done(null, false, { message: "Invalid password" })
                }
            })
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
    res.render('home', {title: 'Home', user: req.user})
})

app.get('/sign-up', (req, res) => {
    res.render('sign-up', {title: 'Sign-up', user: req.user})
})

app.post('/sign-up', async (req, res) => {
    const { email, username, password, subscribed = "off" } = req.body
    bcrypt.hash(password, 10).then((hashedPassword) => {

        const user = new User({
            email,
            username,
            password: hashedPassword,
            subscribed: subscribed === 'on' ? true : false
        })

        user.save()
        .then(doc => {
            res.redirect('/')
        })
        .catch(err => console.log(err))

    }).catch(err => console.log(err))
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

app.get('/create-post', (req, res) => {
    if (!req.user) res.status(400).send('Bad Request')
    res.render('create-post', {title: 'Write Post', user: req.user})
})

app.post('/create-post', (req, res) => {
    if (!req.user) res.status(400).send('Bad Request')

    const {title, body} = req.body
    const {_id, username} = req.user
    const post = new Post({
        title,
        body,
        author: {
            username,
            id: _id
        }
    })

    post.save()
        .then(result => res.redirect('/posts'))
        .catch(err => console.log(err))
})

app.get('/posts', (req, res) => {
    Post.find()
        .sort({createdAt: 'desc'})
        .then(posts => {
            res.render('posts', {title: "All Posts", posts, user: req.user})
        })
        .catch(err => {
            console.log(err)
        })
})

app.get('/dashboard', (req, res) => {
    if (!req.user) res.status(400).send('Bad Request')
    Post.find({'author.id': req.user._id.toString()})
        .then(posts => {
            res.render('dashboard', {title: "Dashboard", posts, user: req.user})
        })
        .catch(err => {
            console.log(err)
        })
})

app.get('/join-club', (req, res) => {
    if (!req.user) res.status(400).send('Bad Request')
    res.render('join-club', {title: 'Join Club', user: req.user})
})


// 404 error handler
app.use((req, res) => {
    res.status(404).render('404', {title: '404'})
})