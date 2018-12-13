angular.module('planningsessionpage-controller', [])
    .controller('planningsession-controller', ['$scope', '$http', '$routeParams', 'authService', function ($scope, $http, $routeParams, authService) {

        $scope.title = '';
        $scope.users = [];

        $scope.isInitialized = authService.isInitialized;
        $scope.isLoggedIn = false;

        $scope.join = {
            sessionId: '',
            username: '',
            isPrivate: false,
            password: ''
        };

        if (authService.isInitialized == true) {
            joinRequest(authService.userData);
        }

        $scope.joinSession = function () {
            authService.userData = $scope.join;
            joinRequest(authService.userData);
        }

        function joinRequest(data) {
            $http.post('/joinSession', data)
                .then(function (res) {
                    initializeSocket(authService.userData);
                    $scope.isLoggedIn =  $scope.isInitialized = true;
                }, function (err) {
                    console.log(err.data);
                    $scope.isLoggedIn =  $scope.isInitialized = false;
                });
        }

        function initializeSocket(data) {

            socket = io('/group-' + data.sessionId, { query: "username=" + data.username + "&" + "password=" + data.password });

            socket.on('user.connect', function (data) {
                $scope.isLoggedIn =  $scope.isInitialized = true;
                $scope.users = data.users;
                $scope.$apply();
                console.log('User connected', $scope.users);
            });

            socket.on('user.info', function (data) {
                $scope.title = data.title;
                console.log(data);
            });

            socket.on('server.info', function (data) {
                console.log(data);
            });

            socket.on('user.disconnect', function (data) {
                $scope.users = data.users;
                $scope.$apply();
                console.log('User disconnected', data);
            });

            socket.on('disconnect', function (data) {
                console.log(data);
            });

            socket.on('error', function (err) {
                console.log(err);
            });

        }

    }]);
