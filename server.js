var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var socket = require('./modules/socket.js').socket(io);

var PORT = process.env.PORT || 3000;

//app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

/*
io.use(function (socket, next) {
    console.log('middleware');
    next(null, true);
});
*/
var sessions = [];

function createPlanningSession(i) {
    var group = io.of('/group-' + i);
    group.on('connection', function (socket) {

        var username = socket.handshake.query['username'];
        if (username != null) {
            socket.username = username;
        }

        console.log('User connected ' + socket.username);

        group.emit('user.connect', { 'username': socket.username });

        socket.on('disconnect', function (data) {
            console.log('User disconnected ' + socket.username);
            group.emit('user.disconnect', { 'username': socket.username });
        });

    });

}


createPlanningSession(26);

app.post('/newPlanning', function (req, res) {

    var title = req.body.title;
    var password = req.body.password;
    var username = req.body.username;

    if (typeof title !== 'string' || typeof username !== 'string') {
        return res.status(400).json({
            error: 'Invalid data format!'
        });
    }

    var data = {
        sessionId: Math.floor(Math.random() * 100),
        title: title,
        username: username,
        isAdmin: true
    };

    createPlanningSession(data.sessionId)
    res.json(data);
});

http.listen(PORT, function () {
    console.log('Server is running at ' + PORT);
});