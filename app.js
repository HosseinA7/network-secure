const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sanitizer = require('sanitizer');
const flash = require('express-flash-messages')

const app = express();
const {
    Pool,
    Client
} = require('pg');
const {
    check,
    validationResult
} = require('express-validator/check');
const connectionString = 'postgresql://postgres:0770@localhost:5432/netsecure'


const pool = new Pool({
    connectionString: connectionString
})
const client = new Client({
    connectionString: connectionString
})

const expressValidator = require('express-validator');
app.use(expressValidator())



app.use(flash())

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({
    name: 'sid',
    saveUninitialized: true,
    resave: true,
    secret: 'sssh, quiet! it\'s a secret!',
    cookie: {
        maxAge: 100000 * 60 * 60 * 1,
        sameSite: true,
        secure: process.env.NODE_ENV === 'production'
    }
}))




const redirectHome = (req, res, next) => {
    //console.log('home', req.session.userId);

    if (!req.session.userId) {
        res.redirect('/');
    } else {
        next();
    }
}



app.get('/login', (req, res) => {
    const {
        userId
    } = req.session;
    //console.log(req.session.userId)
    res.render('login.pug');


    // console.log(req.session)
    // console.log(req.session.cookie)
    // console.log(req.session.id) // ex: VdXZfzlLRNOU4AegYhNdJhSEquIdnvE-
    // console.log(req.sessionID);
})

app.get('/', (req, res) => {

    res.render('register.pug');

});

app.get('/posts', redirectHome, (req, res) => {
    //console.log(req.session.userId);

    pool.query("SELECT username ,post_text from tbl_posts", (err, result) => {
        if (err) return console.log('error in query', err);

        console.log('rows: ' + result.rows.length);

        var reversed = result.rows.reverse();
        // console.log(reversed);

        res.render('posts.pug', {
            title: "Welcome ",
            Username: reversed,
            Post: reversed,
            Countrow: reversed.length
        });
        res.end();
    });
})

app.post('/login', [
    check('username').isLength({
        max: 15
    }),
    check('password').isLength({
        max: 60
    }),


], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //return res.status(422).json( 'SQl INJECTION DETECTED !' );
        req.flash('notify', 'This is a test notification.')
        res.render('login', {
            messages: req.flash('notify')
        });
    }



    var Enteredusername = req.body.username;
    var Enteredpassword = req.body.password;

    Enteredusername = Enteredusername.toLowerCase();

    pool.query("SELECT * FROM tbl_users WHERE username = $1 AND password = $2 ", [Enteredusername, Enteredpassword], (err, result) => {
        if (err) return console.log('error in query', err);
        // need to check if user exists
        let user = (result.rows.length > 0) ? result.rows[0] : null;
        if (!user) {

            req.flash('notify', 'This is a test notification.')
            res.render('login', {
                messages: req.flash('Username or Password is incorrect !')
            });
            console.log('kire if');

            return res.redirect('/login')
 

        } else {
            console.log('kire else');
            
            let userInString = JSON.stringify(user);
            console.log(userInString);
            userInString.replace('{', '').replace('}', '');
            req.session.userId = Enteredusername;
            res.redirect('/posts')
        }
    });

});



app.post('/posts', redirectHome, (req, res) => {
    var EnteredPost = req.body.editor1;
    // console.log(req.session.userId);
    // console.log('sesshonnnnnn', (req.session.userId));
    if (!EnteredPost) {
        res.redirect('/posts');
        return false;
    }
    //XSS PREVENTION
    Cleanpost = sanitizer.sanitize(EnteredPost); // Escapes HTML special characters in attribute values as HTML entities
    console.log(Cleanpost);

    pool.query("INSERT INTO tbl_posts(post_text, username) VALUES($1,$2) RETURNING *", [Cleanpost, req.session.userId], (err, result) => {
        if (err) return console.log('error in query', err);

        let newpost = (result.rows.length > 0) ? result.rows[0] : null;
        if (!newpost) {
            return res.send('Please fill the input text');
        }
        //let newpostInJSON = JSON.stringify(newpost);
        //newpostInJSON.replace('{', '').replace('}', '');

        res.redirect('/posts')
        //post: newpostInJSON

        res.end();
    });


});





// *register page
app.post('/', (req, res) => {

    var username = req.body.username;
    var password = req.body.password;
    var psw_conf = req.body.pswrepeat;
    req.checkBody(password, 'passwords does not match').equals(psw_conf);

    //XSS PREVENTION
    cleanuser = sanitizer.sanitize(username);
    cleanpass = sanitizer.sanitize(password);
    cleanuser = cleanuser.toLowerCase();

    pool.query("select from tbl_users where username = $1", [cleanuser], (err, result) => {
        if (err) return console.log('error in query', err);

        let user = (result.rows.length > 0) ? result.rows[0] : null;
        if (user) {

            return res.send('Username already Exists');
        } 
    });



    pool.query("INSERT INTO tbl_users(username, password) VALUES($1,$2) RETURNING *", [cleanuser, password], (err, result) => {
        if (err) return console.log('error in query', err);

        let newUser = (result.rows.length > 0) ? result.rows[0] : null;
        if (!newUser) {
            return res.send('Please fill the input texts');
        }
    });


    res.redirect('/login');
})




app.get('/404', (req, res) => {
    res.render('404.pug');
});


app.post('/logout', (req, res) => {

    req.session.destroy(err => {
        if (err) {
            return res.render('posts.pug');
        }
        res.clearCookie('sid');

        res.redirect('/login');
    });
});

app.listen(3000, () => console.log('http://localhost:3000'));