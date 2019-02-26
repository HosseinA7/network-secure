const fs = require('fs');
const queryString = require('querystring');


function Home(req, res) {

    if (req.url == '/') {
        if (req.method == "GET") {
            fs.readFile('./views/login.html', function (err, html) {
                if (err) {
                    throw err;
                }
                console.log('get request received!');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(html);
                res.end();
            });

        } else {
            req.on('data', function (PostBody) {
                var query = queryString.parse(PostBody.toString());
                console.log(query.username);
                res.writeHead(302, { "username": "/" + query.username })
                res.end();
            });
        }
    }
}

function Posts(req, res) {
    var username = req.url.replace("/", '');
    console.log(username);
    console.log(username.length);


    if (username.length > 0) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('jbhjbhjjhbbjhbb');
        res.end('adfdafd');
    }

}

module.exports.Home = Home;
module.exports.Posts = Posts;