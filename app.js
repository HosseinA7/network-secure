const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const sanitizer = require('sanitizer');
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



app.get('/', (req, res) => {
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

app.get('/register', (req, res) => {

    res.render('register.pug');

});



app.post('/', [
    check('username').isLength({
        max: 10
    }),
    check('password').isLength({
        max: 2
    }),


], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //return res.status(422).json( 'SQl INJECTION DETECTED !' );
        return res.redirect('/404');
    }



    var Enteredusername = req.body.username;
    var Enteredpassword = req.body.password;

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
        res.redirect('/posts')
        //, {
        //     title: "Welcome " + Enteredusername,
        //     user: userInString,
        // });
        res.end();
    });
});
app.get('/posts', redirectHome, (req, res) => {
    //console.log(req.session.userId);

    pool.query("SELECT username ,post_text from tbl_posts", (err, result) => {
        if (err) return console.log('error in query', err);

        let oldposts = (result.rows.length > 0) ? result.rows[0] : null;
        if (!oldposts) {
            return res.send('Please fill the input text');
        }
        // var data = []
        // for (var i; i < 20; i++) {
        //     data.push(result.rows[i]);
        // }

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


app.post('/posts', redirectHome, (req, res) => {
    var EnteredPost = req.body.editor1;
    var EnteredKey = req.body.key;
    // console.log(req.session.userId);
    // console.log('sesshonnnnnn', (req.session.userId));
    if (!EnteredPost) {
        res.redirect('/posts');
        res.end();
    }
    Cleanpost = sanitizer.sanitize(EnteredPost); // Escapes HTML special characters in attribute values as HTML entities
    console.log(Cleanpost);


    //--------------------------------------------------------------------------------------
    if (EnteredKey) {
        CleanKey = sanitizer.sanitize(EnteredKey);
        var postwithPtag = Cleanpost;
        var postwithnoP = postwithPtag.replace("<p>", "").replace("</p>", "")

        //console.log(key);

        function main() {
            var stringToEncrypt = postwithnoP;
            var key = EnteredKey;

            //var stringToEncrypt = "Hello users";

            write("stringToEncrypt is: " + stringToEncrypt);

            //console.log(bytesToEncrypt)
            var bytesToEncrypt = ByteHelper.stringUTF8ToBytes(stringToEncrypt);

            write("BytesToEncrypt is: " + ByteHelper.bytesToStringHexadecimal(bytesToEncrypt));

            //var keySizeInBits = 32;

            //var key = Math.floor(Math.random() *(Math.pow(2, keySizeInBits) - 1));
            var key = "12345676"
            write("key is: " + key);

            var encryptor = new EncryptorFeistel(
                key,
                EncryptorFeistel.deriveRoundSubkeysFromKeySimple,
                EncryptorFeistel.encryptionFunctionForRoundSimple
            );

            var bytesEncrypted = encryptor.encryptBytes(bytesToEncrypt);

            write("bytesEncrypted is: " + ByteHelper.bytesToStringHexadecimal(bytesEncrypted));
            var BytesEncryptedToShow = ByteHelper.bytesToStringHexadecimal(bytesEncrypted);
            var bytesDecrypted = encryptor.decryptBytes(bytesEncrypted);

            write("bytesDecrypted is: " + ByteHelper.bytesToStringHexadecimal(bytesDecrypted));

            var stringDecrypted = ByteHelper.bytesToStringUTF8(bytesDecrypted);

            write("stringDecrypted is: " + stringDecrypted);
            
            function sendRamz() {
                var ramz = BytesEncryptedToShow;
                
                getRamz(ramz);
            }
            sendRamz();
        }

        function write(message) {
            console.log(message);
        }

        // classes

        Array.prototype.overwriteWith = function (other) {
            this.length = 0;

            for (var i = 0; i < other.length; i++) {
                this[i] = other[i];
            }
        }

        function ByteHelper() {} {
            ByteHelper.BitsPerByte = 8;
            ByteHelper.BitsPerNibble = ByteHelper.BitsPerByte / 2;
            ByteHelper.ByteValueMax = Math.pow(2, ByteHelper.BitsPerByte) - 1;

            ByteHelper.bytesToStringUTF8 = function (bytesToConvert) {
                var returnValue = "";

                for (var i = 0; i < bytesToConvert.length; i++) {
                    var charCode = bytesToConvert[i];
                    var character = String.fromCharCode(charCode);
                    returnValue += character;
                }

                return returnValue;
            }

            //change the decimal unicode to hexadecimal
            ByteHelper.bytesToStringHexadecimal = function (bytesToConvert) {
                var returnValue = "";

                var bitsPerNibble = ByteHelper.BitsPerNibble;

                for (var i = 0; i < bytesToConvert.length; i++) {
                    var byte = bytesToConvert[i];

                    for (var d = 1; d >= 0; d--) {
                        var digitValue = byte >> (bitsPerNibble * d) & 0xF;
                        var digitString = "";
                        digitString += (digitValue < 10 ? digitValue : String.fromCharCode(55 + digitValue));
                        returnValue += digitString;
                    }

                    returnValue += " ";
                }

                return returnValue;
            }

            ByteHelper.bytesToNumber = function (bytes) {
                var returnValue = 0;

                var bitsPerByte = ByteHelper.BitsPerByte;

                for (var i = 0; i < bytes.length; i++) {
                    var byte = bytes[i];
                    var byteValue = (byte << (bitsPerByte * i));
                    returnValue += byteValue;
                }

                return returnValue;
            }

            ByteHelper.numberOfBytesNeededToStoreNumber = function (number) {
                var numberOfBitsInNumber = Math.ceil(
                    Math.log(number + 1) / Math.log(2)
                );

                var numberOfBytesNeeded = Math.ceil(
                    numberOfBitsInNumber /
                    ByteHelper.BitsPerByte
                );

                return numberOfBytesNeeded;
            }

            ByteHelper.numberToBytes = function (number, numberOfBytesToUse) {
                var returnValues = [];

                if (numberOfBytesToUse == null) {
                    numberOfBytesToUse = this.numberOfBytesNeededToStoreNumber(
                        number
                    );
                }

                var bitsPerByte = ByteHelper.BitsPerByte;

                for (var i = 0; i < numberOfBytesToUse; i++) {
                    var byte = (number >> (bitsPerByte * i)) & 0xFF;
                    returnValues.push(byte);
                }

                return returnValues;
            }

            //return the unicode array of characters
            ByteHelper.stringUTF8ToBytes = function (stringToConvert) {
                var returnValues = [];

                for (var i = 0; i < stringToConvert.length; i++) {
                    var charCode = stringToConvert.charCodeAt(i);
                    returnValues.push(charCode);
                }
                return returnValues;
            }

            ByteHelper.xorBytesWithOthers = function (bytes0, bytes1) {
                for (var i = 0; i < bytes0.length; i++) {
                    bytes0[i] ^= bytes1[i];
                }

                return bytes0;
            }
        }

        function EncryptorFeistel(
            key,
            deriveRoundSubkeysFromKey,
            encryptionFunctionForRound
        ) {
            this.key = key;
            this.deriveRoundSubkeysFromKey = deriveRoundSubkeysFromKey;
            this.encryptionFunctionForRound = encryptionFunctionForRound;
        } {

            //creating keys from the given key
            EncryptorFeistel.deriveRoundSubkeysFromKeySimple = function (keyAs32BitInteger) {
                var returnValues = [];

                for (var r = 0; r < 16; r++) {
                    var subkeyForRound = (keyAs32BitInteger >> (r * ByteHelper.BitsPerByte)) & 0xFF;

                    returnValues.push(subkeyForRound);
                }
                return returnValues;
            }

            // Khordkon function(F function)
            EncryptorFeistel.encryptionFunctionForRoundSimple = function (right, key) {
                // Simple, and presumably easy to crack.

                for (var i = 0; i < right.length; i++) {
                    right[i] = (right[i] + key) % ByteHelper.ByteValueMax;

                }

            }

            // instance methods


            EncryptorFeistel.prototype.decryptBytes = function (bytesToDecrypt) {
                var returnValues = this.encryptOrDecryptBytes(
                    bytesToDecrypt,
                    true // decryptRatherThanEncrypt
                );

                return returnValues;
            }

            //make the array even if not
            EncryptorFeistel.prototype.encryptBytes = function (bytesToEncrypt) {
                if (bytesToEncrypt.length % 2 == 1) {
                    // hack - length must be even!
                    bytesToEncrypt.push(0);
                }

                var returnValues = this.encryptOrDecryptBytes(
                    bytesToEncrypt,
                    false // decryptRatherThanEncrypt
                );

                return returnValues;
            }

            // divide the array to left and right
            EncryptorFeistel.prototype.encryptOrDecryptBytes = function (
                bytesToEncryptOrDecrypt,
                decryptRatherThanEncrypt
            ) {
                var subkeysForRounds = this.deriveRoundSubkeysFromKey(
                    this.key
                );
                var numberOfRounds = subkeysForRounds.length;
                //var numberOfRounds = 16;

                var numberOfBytes = bytesToEncryptOrDecrypt.length;
                var numberOfBytesHalf = numberOfBytes / 2;

                var left = bytesToEncryptOrDecrypt.slice(
                    0, numberOfBytesHalf
                );
                var right = bytesToEncryptOrDecrypt.slice(
                    numberOfBytesHalf
                );

                var leftNext = left.slice(0);
                var rightNext = right.slice(0);

                for (var r = 0; r < numberOfRounds; r++) {
                    var subkeyIndex = (decryptRatherThanEncrypt ? numberOfRounds - r - 1 : r);
                    var subkeyForRound = subkeysForRounds[subkeyIndex];
                    // Probably some needlessly inefficient calls 
                    // to overwriteWith() happening in this block.

                    leftNext.overwriteWith(right);
                    rightNext.overwriteWith(left);

                    this.encryptionFunctionForRound(
                        right, subkeyForRound
                    );
                    ByteHelper.xorBytesWithOthers(
                        rightNext,
                        right
                    )

                    left.overwriteWith(leftNext);
                    right.overwriteWith(rightNext);
                }

                var returnValue = [].concat(right).concat(left);

                return returnValue;
            }
        }

        // run

        main();

        function getRamz(BytesEncryptedToShow) {
            pool.query("INSERT INTO tbl_posts(post_text, username) VALUES($1,$2) RETURNING *", [BytesEncryptedToShow, req.session.userId], (err, result) => {
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
        }





        //--------------------------------------------------------------------------------------


    } else {

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
    }

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