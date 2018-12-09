angular.module('planningsessionpage-controller', [])
    .controller('planningsession-controller', ['$scope', '$http', '$routeParams', 'authService', function ($scope, $http, $routeParams, authService ) {

        console.log(authService.userData);

        var id = authService.userData.sessionId;
        var username = authService.userData.username;
        var password = authService.userData.password;
        
        $scope.users = [];

        $scope.username = username;
        $scope.password = password;
        socket = io('/group-' + id, { query: "username=" + $scope.username + "&" + "password=" + $scope.password });

        socket.on('user.connect', function (data) {
            $scope.users = data.users;
            $scope.$apply();
            console.log('User connected', $scope.users);
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