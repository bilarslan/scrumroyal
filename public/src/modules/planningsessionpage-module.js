angular.module('planningsessionpage-module', [])
    .controller('planningsessionpage-controller', ['$scope', '$http', '$location', '$routeParams', 'authService', function ($scope, $http, $location, $routeParams, authService) {

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

        $scope.checkChanged = function (card) {
            if (card.selected == false) {
                card.selected = true;
                $scope.checked++;
                if (card.specialCard == true) {
                    $scope.lockAll = true;
                } else {
                    $scope.lockSpecial = true;
                }
            } else {
                card.selected = false;
                $scope.checked--;
                if (card.specialCard == true) {
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
                    authService.id = data.id;
                    authService.username = data.username;
                    $scope.isAdmin = data.isAdmin;

                    $scope.title = data.title;
                    var index = data.cardSet;
                    buildCards(cardSet[data.cardSet].type, data.cardLimit);

                    $scope.users = data.users;

                    $scope.socketStatus = 'Connected.';
                    $scope.isLoggedIn = true;
                }
                else if (action == 'CARD.SELECTED') {
                    console.log(data.selectedCards);
                    $scope.checked = data.selectedCards.length;
                    if (data.selectedCards.length == 0) {
                        $scope.lockAll = false;
                        $scope.lockSpecial = false;
                        return;
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
                console.log(data);

                var action = data.action;
                if (action == 'CONNECT') {
                    if (data.user.id != authService.id) {
                        $scope.users.push(data.user);
                    }
                    $scope.info.push('[ ' + new Date().toLocaleTimeString() + ' ] ' + data.user.username + ' is connected.');
                }
                else if (action == 'DISCONNECT') {
                    for (var i = 0; i < $scope.users.length; i++) {
                        var user = $scope.users[i];
                       // console.log(user.id, data.user.id);
                        if (user.id == data.user.id) {
                            user.isActive = false;
                            $scope.info.push('[ ' + new Date().toLocaleTimeString() + ' ] ' + data.user.username + ' is disconnected.');
                            break;
                        }
                    }
                }
                else if (action == 'CARD.SELECTED') {
                    var user = $scope.users.find(x => x.username == data.username);
                    if (user) {
                        user.score = -1;
                        user.isActive = true;
                        user.cardSelected = data.cardSelected;
                    }
                    console.log($scope.users);
                }
                else if (action == 'CARD.OPEN') {
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
                authService.setData();
                console.log(data);
            });

            socket.on('error', function (err) {
                $scope.socketStatus = 'Disconnected';
                authService.setData();
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
            console.log($scope.cards);
        }

    }])
    .directive("ngRandomCardView", function () {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                ngIsback: "="
            },
            link: function (scope, elem, attr) {
                var types = [
                    'suitdiamonds',
                    'suithearts',
                    'suitclubs',
                    'suitspades',
                ];
                scope.$watch('ngIsback', function () {
                    if (scope.ngIsback == true) {
                        types.forEach(function (type) {
                            elem.removeClass(type);
                        });
                        elem.addClass('pback');
                    } else {
                        elem.removeClass('pback');
                        elem.addClass(types[Math.floor(Math.random() * (types.length))]);
                    }
                });
            }
        }
    });;

