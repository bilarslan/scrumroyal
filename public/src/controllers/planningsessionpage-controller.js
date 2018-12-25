angular.module('planningsessionpage-controller', [])
    .controller('planningsession-controller', ['$scope', '$http', '$routeParams', 'authService', function ($scope, $http, $routeParams, authService) {

        var socket;

        $scope.title = '';
        $scope.users = [];

        $scope.isLoggedIn = false;
        $scope.socketStatus = '';

        $scope.join = {
            sessionId: '',
            username: '',
            isPrivate: false,
            password: ''
        };

        $scope.info = [];

        $scope.checked = 0;
        $scope.limit = 0;


        $scope.cards = [];


        var cardSet = [
            { type: ["0", "1", "3", "5", "8", "13", "20", "40", "100", "?", "∞"] },
            { type: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89"] }
        ];

        var sessionId = $scope.join.sessionId = $routeParams.id;
        var localData = authService.getData();

        if (localData.sessionId == sessionId && localData.token) {
            initializeSocket(localData.sessionId, localData.token);
        } else {

        }

        $scope.joinSession = function () {
            joinRequest($scope.join);
        }

        $scope.checkChanged = function (item) {
            if (item.selected)
                $scope.checked++;
            else
                $scope.checked--;
        }

        function joinRequest(data) {
            $http.post('/joinSession', data)
                .then(function (res) {
                    console.log(res.data);
                    authService.setData(data.sessionId, res.data.token);
                    initializeSocket(data.sessionId, res.data.token);
                    $scope.isLoggedIn = true;
                }, function (err) {
                    console.log(err.data);
                    $scope.joinMessage = err.data.message;
                    $scope.isLoggedIn = false;
                });
        }

        function initializeSocket(socketId, token) {

            socket = io('/group-' + socketId, { query: "token=" + token });

            socket.on('user.info', function (data) {
                console.log(data);
                var action = data.action;
                if (action == 'CONNECT') {
                    $scope.socketStatus = 'Connected.';
                    $scope.title = data.title;
                    $scope.isAdmin = data.isAdmin;
                    var index = data.cardSet;
                    buildCards(cardSet[index].type, data.cardLimit);
                    $scope.isLoggedIn = true;
                }
                else if (action == 'CARD.SELECTED') {
                    console.log(data.selectedCards);
                    $scope.checked = data.selectedCards.length;
                    $scope.cards.forEach(function (element) {
                        var confirmedCard = data.selectedCards.find(x => x.value == element.value);
                        if (confirmedCard) {
                            element.selected = element.confirmed = true;
                        } else {
                            element.selected = element.confirmed = false;
                        }
                    });

                    $scope.$apply();
                }
            });

            socket.on('server.info', function (data) {
                console.log(data);

                var action = data.action;
                if (action == 'CONNECT') {
                    console.log(data.username + ' connected.');
                    $scope.users = data.users;
                    $scope.info.push(data.username + ' is connected.');
                }
                else if (action == 'DISCONNECT') {
                    console.log(data.username + ' disconnected');
                    $scope.users = data.users;
                    $scope.info.push(data.username + ' is disconnected.');
                }
                $scope.$apply();
            });

            socket.on('disconnect', function (data) {
                $scope.socketStatus = 'Disconnected';
                console.log(data);
            });

            socket.on('error', function (err) {
                $scope.socketStatus = 'Disconnected';
                console.log(err);
            });

            $scope.confimCardSelection = function () {
                var cards = $scope.cards.filter(x => x.selected == true).map(x => { var obj = {}; obj['value'] = x.value; return obj; });
                if (cards) {
                    socket.emit('card.action', { action: 'SELECTION', cards: cards });
                }
            }

            $scope.resetCardSelection = function () {
                socket.emit('card.action', { action: 'RESET' });
            }
        }

        function buildCards(cards, cardLimit) {
            $scope.cards = [];
            $scope.limit = cardLimit;
            cards.forEach(function (element) {
                $scope.cards.push({ value: element, selected: false, confirmed: false });
            });
        }

    }]);
