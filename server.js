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
    var password = params.password;
    var title = params.title;
    var cardLimit = params.cardLimit;
    var cardSet = params.cardSet;

    var group = io.of('/group-' + sessionId);

    group.sessionConfig = {
        sessionId: sessionId,
        title: title,
        password: password,
        cardLimit: cardLimit,
        cardSet: cardSet,
        users: []
    }

    sessions.push(group);

    group.on('connection', function (socket) {

        var token = socket.handshake.query['token'];
        jwt.verify(token, secretKey, function (err, decoded) {
            if (err) {
                console.log(err);
                socket.disconnect(true);
                return;
            }
            var username = decoded.username;
            var isAdmin = decoded.isAdmin;

            var groupName = group.name;

            var session = sessions.find(x => x.name == groupName);
            if (session) {
                var user = session.sessionConfig.users.find(x => x.username == username);
                if (user) {
                    //Same username
                    socket.disconnect(true);
                    return;
                }
                socket.auth = true;
                socket.username = username;
                socket.isAdmin = isAdmin;

                session.sessionConfig.users.push({ id: socket.id, username: username, isAdmin: isAdmin, selectedCards: [] });

                socket.emit('user.info', {
                    action: 'CONNECT',
                    title: session.sessionConfig.title,
                    cardLimit: session.sessionConfig.cardLimit,
                    cardSet: session.sessionConfig.cardSet,
                    isAdmin: isAdmin
                });

                group.emit('server.info', {
                    action: 'CONNECT',
                    username: socket.username,
                    users: session.sessionConfig.users
                });
            }
            else {
                socket.disconnect(true);
            }


            socket.on('card.action', function (data) {
                var groupName = socket.nsp.name;
                var session = sessions.find(x => x.name == groupName);
                if (session) {
                    var user = session.sessionConfig.users.find(x => x.id == socket.id);
                    if (user) {


                        var action = data.action;
                        if (action == 'SELECTION') {
                            user.selectedCards = data.cards;
                            socket.emit('user.info', { action: 'CARD.SELECTED', selectedCards: user.selectedCards });
                        }
                        else if (action == 'RESET') {
                            user.selectedCards = [];
                            socket.emit('user.info', { action: 'CARD.SELECTED', selectedCards: user.selectedCards });
                        }

                    } else {
                        console.log('user is not found!');
                    }

                }
                else {
                    console.log('Session is not found.');
                }

                //console.log(socket.username, data);
            });

            socket.on('disconnect', function (data) {

                var groupName = socket.nsp.name;
                var session = sessions.find(x => x.name == groupName);
                if (session) {
                    var user = session.sessionConfig.users.find(x => x.id == socket.id);
                    if (user) {
                        var index = session.sessionConfig.users.findIndex(x => x.username == socket.username);
                        session.sessionConfig.users.splice(index, 1);
                        //session.sessionConfig.users.splice(session.sessionConfig.users.indexOf(user), 1);
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
                    username: socket.username,
                    users: session.sessionConfig.users
                });
            });

        });

    });

}

var d = {
    sessionId: 26,
    title: 'DENEME',
    password: 123456,
    cardLimit: -1,
    cardSet: 0
}

createPlanningSession(d);

app.post('/newPlanning', function (req, res) {

    var title = req.body.title;
    var password = req.body.password;
    var username = req.body.username;
    var cardLimit = req.body.cardLimit;
    var cardSet = req.body.cardSet;

    if (typeof title !== 'string' || typeof username !== 'string') {
        return res.status(400).json({
            error: 'Invalid data format!'
        });
    }

    if (cardLimit) {
        cardLimit = 1;
    } else {
        cardLimit = -1;
    }

    var data = {
        sessionId: Math.floor(Math.random() * 100) + 100,
        title: title,
        password: password,
        cardLimit: cardLimit,
        cardSet: cardSet
    };

    var token = jwt.sign({
        sessionId: data.sessionId,
        username: username,
        isAdmin: true
    }, secretKey, {
            expiresIn: 60 * 24
        });

    createPlanningSession(data);

    res.json({
        sessionId: data.sessionId,
        token: token,
    });
});

app.post('/joinSession', function (req, res) {

    var username = req.body.username;
    var sessionId = req.body.sessionId;
    var password = req.body.password;
    var session = sessions.find(x => x.sessionConfig.sessionId == sessionId);

    if (session) {
        if (session.sessionConfig.password && password == 'null') {
            res.status(401).json({ message: "please password" });
        }
        else if (session.sessionConfig.password && session.sessionConfig.password != password) {
            res.status(401).json({ message: "wrong password" });
        }
        else if ((session.sessionConfig.password == false) || (session.sessionConfig.password && session.sessionConfig.password == password)) {

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