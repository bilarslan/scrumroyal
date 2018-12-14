angular.module('planningsessionpage-controller', [])
    .controller('planningsession-controller', ['$scope', '$http', '$routeParams', 'authService', function ($scope, $http, $routeParams, authService) {

        $scope.title = '';
        $scope.users = [];

        $scope.isInitialized = authService.isInitialized;
        $scope.isLoggedIn = false;
        $scope.socketStatus = '';

        $scope.join = {
            sessionId: '',
            username: '',
            isPrivate: false,
            password: ''
        };

        var sessionId = $routeParams.id;
        var localData = authService.getData();
        if (authService.isInitialized == true && authService.userData.sessionId == sessionId) {
            joinRequest(authService.userData);
        } else if (localData.sessionId == sessionId && localData.token) {
            initializeSocket(localData.sessionId, localData.token);
        }

        $scope.joinSession = function () {
            authService.userData = $scope.join;
            joinRequest(authService.userData);
        }

        function joinRequest(data) {
            $http.post('/joinSession', data)
                .then(function (res) {
                    console.log(res.data);
                    authService.setData(data.sessionId, res.data.token);
                    initializeSocket(data.sessionId, res.data.token);
                    $scope.isLoggedIn = $scope.isInitialized = true;
                }, function (err) {
                    console.log(err.data);
                    $scope.joinMessage = err.data.message;
                    $scope.isLoggedIn = $scope.isInitialized = false;
                });
        }

        function initializeSocket(socketId, token) {

            socket = io('/group-' + socketId, { query: "token=" + token });

            socket.on('user.connect', function (data) {
                $scope.title = data.title;
                $scope.socketStatus = 'Connected';
                $scope.isLoggedIn = $scope.isInitialized = true;
                console.log('User connected', $scope.users);
            });

            socket.on('user.info', function (data) {
                $scope.title = data.title;
                console.log(data);
            });

            socket.on('server.info', function (data) {
                console.log(data);

                var action = data.action;
                if (action == 'CONNECT') {
                    console.log(data.username + ' connected.');
                    $scope.users = data.users;
                    $scope.$apply();
                }
                else if (action == 'DISCONNECT') {
                    console.log(data.username + ' disconnected');
                    $scope.users = data.users;
                    $scope.$apply();
                }
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

    }]);
