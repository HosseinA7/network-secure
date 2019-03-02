const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const User = require('./users');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/NetSecurity', { useNewUrlParser: true });
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));


// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }
}

app.get('/register', (req, res) => {
    res.render('register.pug', {
        title: 'Register Page'
    });
});


app.post('/register', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    // var pswrepeat = req.body.psw-repeat;


    var newUser = new User({
        username: username,
        password: password
    });

    newUser.save(function (err) {
        if (err) throw err;
        console.log('new user added!');
        res.redirect('/');
    });
});




// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});
// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.render('login.pug');

    })
    .post((req, res) => {

        var username = req.body.username;
        var password = req.body.password;
        console.log('posted: ' + password + ' ♾ ' + username);

        User.find({}, function (err, user) {
            if (err) throw err;
            res.send(user);
            //     if (!user) {
            //         console.log('No user found');
            //         res.redirect('/login');
            //     } else if (user) {
            //         req.session.user = user.dataValues;
            //         res.redirect('/dashboard');
            //     }
            //     else{
            //         console.log('what the fuck?😂');

            //  }
        });
    });

// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.render('posts.pug', {
            title: 'Welcome! ' + username
        });
    } else {
        res.redirect('/login');
    }
});


// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});
// // route for handling 404 requests(unavailable routes)
// app.use(function (req, res, next) {
//     res.status(404).send("Sorry can't find that!");
// });


app.listen(3000, function () {
    console.log('final express is running on port 3000');
});