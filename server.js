var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/hi', function (req, res) {
    res.send('hello world');
});


io.on('connection', function(socket){
    console.log('User connected');

    socket.on('disconnect', function(socket){
        console.log('user disconnected');
    });
});

http.listen(PORT, function () {
    console.log('Server is running at ' + PORT);
});