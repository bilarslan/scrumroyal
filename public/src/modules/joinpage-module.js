angular.module('joinpage-module', [])
    .controller('joinpage-controller', ['$scope', '$http', '$location', '$routeParams', 'authService', function ($scope, $http, $location, $routeParams, authService) {


        $scope.join = {
            sessionId: $routeParams.id,
            username: '',
            isPrivate: false,
            password: ''
        };

        $scope.message = '';

        $scope.joinSession = function () {
            $http.post('/joinSession', $scope.join)
                .then(function (res) {
                    authService.setData($scope.join.sessionId, res.data.token);
                    $location.path('/planningsession/' + $scope.join.sessionId);
                }, function (err) {
                    console.log(err.data);
                    $scope.message = err.data.message;
                });
        }

    }]);