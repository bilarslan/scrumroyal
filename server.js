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
                if (err.name == 'TokenExpiredError') {
                    console.log('TokenExpiredError');
                } else if (err.name == 'JsonWebTokenError') {
                    console.log('JsonWebTokenError');
                } else {
                    console.log(err.name);
                }
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
                    socket.disconnect(true);
                    return;
                }
                socket.auth = true;
                socket.username = username;
                socket.isAdmin = isAdmin;

                user = { id: socket.id, username: username, isAdmin: isAdmin, selectedCards: [] };

                session.sessionConfig.users.push(user);

                socket.emit('user.info', {
                    action: 'CONNECT',
                    id: user.id,
                    username: user.username,
                    isAdmin: isAdmin,
                    title: session.sessionConfig.title,
                    cardLimit: session.sessionConfig.cardLimit,
                    cardSet: session.sessionConfig.cardSet,
                    users: session.sessionConfig.users.map(x => {
                        var obj = {};
                        obj['id'] = x.id;
                        obj['username'] = x.username;
                        obj['isActive'] = true;
                        obj['isAdmin'] = x.isAdmin;
                        obj['cardSelected'] = x.selectedCards.length > 0 ? true : false;
                        obj['score'] = -1;
                        return obj;
                    })
                });

                group.emit('server.info', {
                    action: 'CONNECT',
                    user: {
                        id: user.id,
                        username: user.username,
                        isAdmin: user.isAdmin,
                        isActive: true,
                        cardSelected: false
                    }
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
                            group.emit('server.info', { action: 'CARD.SELECTED', username: socket.username, cardSelected: (user.selectedCards.length > 0 ? true : false) });
                        }
                        else if (action == 'RESET') {
                            user.selectedCards = [];
                            socket.emit('user.info', { action: 'CARD.SELECTED', selectedCards: user.selectedCards });
                            group.emit('server.info', { action: 'CARD.SELECTED', username: socket.username, cardSelected: false });
                        }
                        else if (action == 'OPEN') {
                            if (socket.isAdmin) {
                                group.emit('server.info', { action: 'CARD.OPEN', users: session.sessionConfig.users });
                            }
                        }
                        else if (action == 'RESET.ALL') {
                            if (socket.isAdmin) {
                                for (var i = 0; i < session.sessionConfig.users.length; i++) {
                                    var user = session.sessionConfig.users[i];
                                    user.selectedCards = [];
                                }
                                group.emit('server.info', { action: 'RESET.ALL.CARDS' });
                            }
                        }

                    } else {
                        console.log('user is not found!');
                    }

                }
                else {
                    console.log('Session is not found.');
                }
            });

            socket.on('disconnect', function (data) {
                var groupName = socket.nsp.name;
                var session = sessions.find(x => x.name == groupName);
                if (session) {
                    var user = session.sessionConfig.users.find(x => x.id == socket.id);
                    if (user) {
                        var index = session.sessionConfig.users.findIndex(x => x.username == socket.username);
                        session.sessionConfig.users.splice(index, 1);
                        group.emit('server.info', {
                            action: 'DISCONNECT',
                            user: {
                                id: socket.id,
                                username: socket.username
                            }
                        });

                    } else {
                        console.log('user is not found!');
                    }
                }
                else {
                    console.log('session is not found!');
                }
            });

        });

    });

}

app.post('/newPlanning', function (req, res) {

    var title = req.body.sessionName;
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

    var sessionId;
    do {
        sessionId = Math.floor(Math.random() * 1000) + 1000;
        var isFound = sessions.findIndex(x => x.sessionConfig.sessionId == sessionId);
    } while (isFound != -1);

    var data = {
        sessionId: sessionId,
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
            expiresIn: '24h'
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
            res.status(401).json({ message: "Please provide password" });
        }
        else if (session.sessionConfig.password && session.sessionConfig.password != password) {
            res.status(401).json({ message: "Wrong password" });
        }
        else if ((session.sessionConfig.password == false) || (session.sessionConfig.password && session.sessionConfig.password == password)) {

            var index = session.sessionConfig.users.findIndex(x => x.username == username);
            if (index != -1) {
                return res.status(401).json({ message: "Username is already taken." });
            }

            var token = jwt.sign({
                sessionId: sessionId,
                username: username
            }, secretKey, {
                    expiresIn: '24h'
                });

            res.json({ message: "Successss", token: token });
        }
        else {
            res.json({ message: 'asdasd' });
        }

    } else {
        res.status(404).json({ message: 'Session is not found!' });
    }



});

app.get('/status', function (req, res) {
    if(req.query.pw === 'whatsup'){
        var result = sessions.map(x => {
            var obj = {};
            obj['config'] = x.sessionConfig;
            return obj;
        })
        return res.json(result);
    }
    res.status(404).json({ message: 'Error' });
});

http.listen(PORT, function () {
    console.log('Server is running at ' + PORT);
});