const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('./users');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/NetSecurity', { useNewUrlParser: true });



const app = express();

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    name: 'sid',
    saveUninitialized: true,
    resave: false,
    secret: 'sssh, quiet! it\'s a secret!',
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        sameSite: true,
        secure: process.env.NODE_ENV === 'production'
    }
})
)

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/')
    } else {
        next();
    }
}


const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.render('posts.pug')
    } else {
        next();
    }
}

app.use((req, res, next) => {
    const { userId } = req.session
    if (userId) {
        res.locals.user = users.find(
            user => user.id === userId
        )
    }
    next();
})



app.get('/', redirectHome, (req, res) => {
    console.log(User);
    const { userId } = req.session;
    res.render('login.pug');

    console.log(req.session)
    console.log(req.session.cookie)
    console.log(req.session.id) // ex: VdXZfzlLRNOU4AegYhNdJhSEquIdnvE-
    console.log(req.sessionID);
})

app.get('/register', redirectHome, (req, res) => {

    res.render('register.pug');

})
// ??????????????????????????????????????????????????????
app.post('/posts',redirectHome,(req,res) =>{
    User.insert({
        "posts":posts.push("post")
    });

    res.render('posts.pug');

})

app.post('/', redirectHome, (req, res) => {
        var username = req.body.username;
        var password = req.body.password;
        User.findOne({username : username , password : password},function(err,user){
            if(err){
                console.log(err);
                res.status(500).send();
                
            } 
            if(!user){
                console.log('wrong user: '+user);
                return res.render('404.pug');
            }
            console.log('valid user: '+user);
            req.session.user = user;
            return res.render('posts.pug');
        })
    });

app.post('/register', redirectHome, (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        const exists = users.some(
            user => user.username === username
        )
        if(!exists){
            const user = {
                id: user.length + 1,
                username,
                password
            }
            users.push(user)
            req.session.userId = user.id
            return res.render('posts.pug')
        }
    }
    res.redirect('/register');
})

app.post('/logout', redirectLogin, (req, res) => {

    req.session.destroy(err => {
        if(err){
            return res.render('posts.pug');
        }
        res.clearCookie('sid')

        res.redirect('/')
    })
})

app.listen(3000, () => console.log('http://localhost:3000'))