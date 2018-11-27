var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var socket = require('./modules/socket.js').socket(io);

var PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

http.listen(PORT, function () {
    console.log('Server is running at ' + PORT);
});