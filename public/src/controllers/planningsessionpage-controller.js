angular.module('planningsessionpage-controller', [])
    .controller('planningsession-controller', ['$scope', '$http', '$routeParams', 'authService', function ($scope, $http, $routeParams, authService) {

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
        $scope.limit = 1;

        $scope.cards = [{ value: 0, selected: false }, { value: 1, selected: false }, { value: 2, selected: false }, { value: 3, selected: false }, { value: 5, selected: false }, { value: 8, selected: false }, { value: 13, selected: false }, { value: 21, selected: false }, { value: 34, selected: false }, { value: 55, selected: false }, { value: 89, selected: false }];

        var sessionId = $scope.join.sessionId = $routeParams.id;
        var localData = authService.getData();

        if (localData.sessionId == sessionId && localData.token) {
            initializeSocket(localData.sessionId, localData.token);
        } else {

        }

        $scope.joinSession = function () {
            joinRequest($scope.join);
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
                var action = data.action;
                if (action == 'CONNECT') {
                    $scope.socketStatus = 'Connected.';
                    $scope.title = data.title;
                    $scope.isLoggedIn = true;
                    $scope.isAdmin = data.isAdmin;
                }

                console.log(data);
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

        }

        $scope.checkChanged = function(item){
            if(item.selected) $scope.checked++;
            else $scope.checked--;
        }

    }]);
