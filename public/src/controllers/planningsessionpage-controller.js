angular.module('planningsessionpage-controller', [])
    .controller('planningsession-controller', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {

        var id = $routeParams.id;
        $scope.username = 'bilarslan';
        socket = io('/group-' + id, { query: "username=" + $scope.username });

        socket.on('user.connect', function (data) {
            console.log('User connected', data);
        });

        socket.on('user.disconnect', function (data) {
            console.log('User disconnected', data);
        });


    }]);