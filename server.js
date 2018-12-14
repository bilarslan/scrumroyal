var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var morgan = require('morgan');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var socket = require('./modules/socket.js').socket(io);

var secretKey = 'sr-v/>3=BLm';

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

function createPlanningSession(params) {

    var sessionId = params.sessionId;
    var username = params.username;
    var isPrivate = params.isPrivate;
    var password = params.password;
    var title = params.title;
    var adminToken = params.adminToken;

    var group = io.of('/group-' + sessionId);

    group.sessionConfig = {
        sessionId: sessionId,
        title: title,
        adminToken: adminToken,
        isPrivate: isPrivate,
        password: password,
        users: []
    }

    sessions.push(group);

    group.on('connection', function (socket) {

        var token = socket.handshake.query['token'];
        jwt.verify(token, secretKey, function (err, decoded) {
            if (err) {
                console.log(err);
                return;
            }

            var username = decoded.username;
            var groupName = socket.nsp.name;

            var session = sessions.find(x => x.name == groupName);
            if (session) {
                socket.username = username;
                session.sessionConfig.users.push({ id: socket.id, username: username });
                socket.emit('user.connect', { 'title': session.sessionConfig.title });
                group.emit('server.info', {
                    action: 'CONNECT',
                    username: socket.username,
                    users: session.sessionConfig.users
                });
            }
            else {
                console.log('session is not found!');
            }

            socket.on('disconnect', function (data) {

                var session = sessions.find(x => x.name == groupName);
                if (session) {
                    var user = session.sessionConfig.users.find(x => x.id == socket.id);
                    if (user) {
                        session.sessionConfig.users.splice(session.sessionConfig.users.indexOf(user), 1);
                    } else {
                        console.log('user is not found!');
                    }
                }
                else {
                    console.log('session is not found!');
                }
                console.log('User disconnected ' + socket.username + ' from ' + groupName);
                group.emit('server.info', {
                    action: 'DISCONNECT',
                    'username': socket.username,
                    users: session.sessionConfig.users
                });
            });

        });

    });

}

var d = {
    sessionId: 26,
    title: 'DENEME',
    username: 'bilarslan',
    isPrivate: true,
    password: 123456
}

createPlanningSession(d);

app.post('/newPlanning', function (req, res) {

    var title = req.body.title;
    var password = req.body.password;
    var username = req.body.username;
    var isPrivate = req.body.isPrivate;

    if (typeof title !== 'string' || typeof username !== 'string') {
        return res.status(400).json({
            error: 'Invalid data format!'
        });
    }

    var data = {
        sessionId: Math.floor(Math.random() * 100) + 100,
        title: title,
        username: username,
        isPrivate: isPrivate,
        password: password,
    };

    createPlanningSession(data);

    res.json(data);
});

app.post('/joinSession', function (req, res) {

    var username = req.body.username;
    var sessionId = req.body.sessionId;
    var password = req.body.password;

    var session = sessions.find(x => x.sessionConfig.sessionId == sessionId);

    if (session) {
        if (session.sessionConfig.isPrivate == true && password == null) {
            res.status(401).json({ message: "please password" });
        }
        else if (session.sessionConfig.isPrivate == true && session.sessionConfig.password != password) {
            res.status(401).json({ message: "wrong password" });
        }
        else if ((session.sessionConfig.isPrivate == false) || (session.sessionConfig.isPrivate == true && session.sessionConfig.password == password)) {

            var token = jwt.sign({
                sessionId: sessionId,
                username: username
            }, secretKey, {
                    expiresIn: 60 * 24
                });

            res.json({ message: "successss", token: token });
        }
        else {
            res.json({ message: 'asdasd' });
        }

    } else {
        res.status(404).json({ message: 'session is not found!' });
    }



});

http.listen(PORT, function () {
    console.log('Server is running at ' + PORT);
});