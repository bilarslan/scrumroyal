angular.module('createpage-module', [])
    .controller('createpage-controller', ['$scope', '$http', '$location', 'authService', function ($scope, $http, $location, authService) {

        $scope.cardSet = [
            { type: "0, 1, 3, 5, 8, 13, 20, 40, 100, ?, ∞" },
            { type: "0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89" }
        ];

        $scope.create = {
            sessionName: '',
            isPrivate: false,
            cardLimit: false,
            cardSet: 0,
            password: '',
            username: '',
        }

        $scope.message = '';

        $scope.newSession = function () {
            $http.post('/newPlanning', $scope.create)
                .then(function (res) {
                    authService.setData(res.data.sessionId, res.data.token);
                    $location.path('/planningsession/' + res.data.sessionId);
                }, function (err) {
                    console.log(err.data);
                });
        }

    }]);