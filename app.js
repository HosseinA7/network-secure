const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const { Pool, Client } = require('pg')
const connectionString = 'postgresql://admin:password@localhost:1111/netSecure'


const pool = new Pool({
    connectionString: connectionString
})
const client = new Client({
    connectionString: connectionString
})

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));
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
    console.log('login',req.session.userId);
    
    if (req.session.userId) {
        res.redirect('/')
    } else {
        next();
    }
}


const redirectHome = (req, res, next) => {
    console.log('home',req.session.userId);

    if (!req.session.userId) {
        res.redirect('/');
    } else {
        next();
    }
}

// app.use((req, res, next) => {
//     const { userId } = req.session
//     if (userId) {
//         res.locals.user = users.find(
//             user => user.id === userId
//         )
//     }
//     next();
// })


app.get('/', (req, res) => {
    const { userId } = req.session;
    console.log(req.session.userId)
    res.render('login.pug');

    // console.log(req.session)
    // console.log(req.session.cookie)
    // console.log(req.session.id) // ex: VdXZfzlLRNOU4AegYhNdJhSEquIdnvE-
    // console.log(req.sessionID);
})

app.get('/register', redirectHome, (req, res) => {

    res.render('register.pug');

});

app.use((req, res, next) => {
    req.nameuser = req.body.username;
    req.passuser = req.body.password;
    next();
});


app.post('/', (req, res) => {

    var Enteredusername = req.nameuser;
    var Enteredpassword = req.passuser;

    Enteredusername = Enteredusername.toLowerCase();
    pool.query("SELECT * FROM tbl_users WHERE username = $1 AND password = $2 ", [Enteredusername, Enteredpassword], (err, result) => {
        if (err) return console.log('error in query', err);
        // need to check if user exists
        let user = (result.rows.length > 0) ? result.rows[0] : null;
        if (!user) {
            return res.redirect('/404');
        }
        let userInString = JSON.stringify(user);
        console.log(userInString);
        userInString.replace('{', '').replace('}', '');
        req.session.userId = Enteredusername;
        res.render('posts.pug', {
            title: "Welcome " + Enteredusername,
            user: userInString,
        });
        res.end();
    });
});

app.post('/posts', redirectHome, (req, res) => {
    var EnteredPost = req.body.editor1;
    console.log(req.session.userId);
    console.log('sesshonnnnnn',(req.session.userId));
    
    pool.query("INSERT INTO tbl_posts(post_text, username) VALUES($1,$2) RETURNING *", [EnteredPost,req.session.userId], (err, result) => {
        if (err) return console.log('error in query', err);

        let newpost = (result.rows.length > 0) ? result.rows[0] : null;
        if (!newpost) {
            return res.send('Please fill the input text');
        }
        let newpostInJSON = JSON.stringify(newpost);
        newpostInJSON.replace('{', '').replace('}', '');
        res.render('posts.pug', {
            title: "Welcome ",
            post: newpostInJSON
        });
        res.end();
    });

})
// *register page
// app.post('/register', redirectHome, (req, res) => {
//     const { username, password } = req.body;
//     if (username && password) {
//         const exists = users.some(
//             user => user.username === username
//         )
//         if (!exists) {
//             const user = {
//                 id: user.length + 1,
//                 username,
//                 password
//             }
//             users.push(user)
//             req.session.userId = user.id
//             return res.render('posts.pug')
//         }
//     }
//     res.redirect('/register');
// })




app.get('/404', (req, res) => {
    res.render('404.pug');
});


app.post('/logout', (req, res) => {

    req.session.destroy(err => {
        if (err) {
            return res.render('posts.pug');
        }
        res.clearCookie('sid');

        res.redirect('/');
    });
});

app.listen(3000, () => console.log('http://localhost:3000'));