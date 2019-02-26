const http = require('http');
const router = require('./router');

http.createServer(function (req, res) {


    router.Home(req, res);
    router.Posts(req, res);

}).listen(3000);




