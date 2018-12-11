angular.module('planningsessionpage-controller', [])
    .controller('planningsession-controller', ['$scope', '$http', '$routeParams', 'authService', function ($scope, $http, $routeParams, authService) {


        if (authService.isLoggedIn == false) {
            return;
        }

        var id = authService.userData.sessionId;
        var username = authService.userData.username;
        var password = authService.userData.password;

        console.log(id, username, password);

        $scope.title = '';
        $scope.users = [];

        socket = io('/group-' + id, { query: "username=" + username + "&" + "password=" + password });

        socket.on('user.connect', function (data) {
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

    }]);