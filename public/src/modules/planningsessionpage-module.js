angular.module('planningsessionpage-module', [])
    .controller('planningsessionpage-controller', ['$scope', '$http', '$location', '$routeParams', 'authService', function ($scope, $http, $location, $routeParams, authService) {

        // TEMP

        $scope.selectedCard = 1;

        $scope.selectCard = function(cardId) {
            $scope.selectedCard = cardId;
        }

        //


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

        $scope.lockAll = false;
        $scope.lockSpecial = false;

        var cardSet = [
            { type: ["0", "1", "3", "5", "8", "13", "20", "40", "100", "?", "∞"] },
            { type: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89"] }
        ];

        var sessionId = $scope.join.sessionId = $routeParams.id;
        var localData = authService.getData();

        if (localData.sessionId == sessionId && localData.token) {
            initializeSocket(localData.sessionId, localData.token);
        } else {
            $location.path('/join/' + $scope.join.sessionId);
        }

        $scope.checkChanged = function (item) {
            if (item.selected) {
                $scope.checked++;
                if (item.specialCard == true) {
                    $scope.lockAll = true;
                } else {
                    $scope.lockSpecial = true;
                }
            }
            else {
                $scope.checked--;
                if (item.specialCard == true) {
                    $scope.lockAll = false;
                } else {
                    $scope.lockSpecial = false;
                }
            }
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
                    if (data.selectedCards.length == 0) {
                        $scope.lockAll = false;
                        $scope.lockSpecial = false;
                    }
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
                //console.log(data);

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
                else if (action == 'CARD.SELECTED') {
                    var user = $scope.users.find(x => x.username == data.username);
                    if (user) {
                        user.cardSelected = data.cardSelected;
                    }
                }
                else if (action == 'CARD.OPEN') {
                    console.log(data);
                    $scope.users.forEach(function (user) {
                        var userData = data.users.find(x => x.username == user.username);
                        if (userData) {
                            var sum = 0;
                            userData.selectedCards.forEach(function (card) {
                                if (card.value == "?" || card.value == "∞") {
                                    sum = card.value;
                                } else {
                                    sum += parseInt(card.value);
                                }
                            });
                        }
                        user.score = sum;
                    });
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

            $scope.openCards = function () {
                if ($scope.isAdmin) {
                    socket.emit('card.action', { action: 'OPEN' });
                } else {
                    console.log('you are not admin');
                }
            }
        }

        function buildCards(cards, cardLimit) {
            $scope.cards = [];
            $scope.limit = cardLimit;
            cards.forEach(function (element) {
                $scope.cards.push({ value: element, selected: false, confirmed: false, specialCard: (element == "0" || element == "?" || element == "∞") });
            });
        }

    }]);
