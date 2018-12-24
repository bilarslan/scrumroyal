angular.module('mainpage-controller', [])
    .controller('main-controller', ['$scope', '$http', '$location', 'authService', function ($scope, $http, $location, authService) {

        $scope.create = {
            title: '',
            isPrivate: false,
            cardLimit: false,
            password: '',
            username: ''
        }

        $scope.createMessage = 'asdsad';

        $scope.newSession = function () {
            $http.post('/newPlanning', $scope.create)
                .then(function (res) {
                    authService.setData(res.data.sessionId, res.data.token);
                    $location.path('/planningsession/' + res.data.sessionId);
                }, function (err) {
                    console.log(err.data);
                });
        }


        $scope.join = {
            sessionId: '',
            username: '',
            isPrivate: false,
            password: ''
        };

        $scope.joinMessage = '';

        $scope.joinSession = function () {
            $http.post('/joinSession', $scope.join)
                .then(function (res) {
                    authService.setData($scope.join.sessionId, res.data.token);
                    $location.path('/planningsession/' + $scope.join.sessionId);
                }, function (err) {
                    console.log(err.data);
                    $scope.joinMessage = err.data.message;
                });
        }

    }]);