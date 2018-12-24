angular.module('mainpage-controller', [])
    .controller('main-controller', ['$scope', '$http', '$location', 'authService', function ($scope, $http, $location, authService) {

        $scope.cardSet = [
            { type: "0, 1/2, 3, 5, 8, 13, 20, 40, 100, ?, ∞" },
            { type: "0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89" }
        ];

        $scope.create = {
            title: '',
            isPrivate: false,
            cardLimit: false,
            cardSet: 0,
            password: '',
            username: '',
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