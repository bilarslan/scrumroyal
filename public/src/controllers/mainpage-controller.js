angular.module('mainpage-controller', [])
    .controller('main-controller', ['$scope', '$http', '$location', 'authService', function ($scope, $http, $location, authService) {

        $scope.create = {
            title: '',
            isPrivate: false,
            password: '',
            username: ''
        }

        $scope.newSession = function () {
            $http.post('/newPlanning', $scope.create)
                .then(function (res) {
                    console.log(res.data);
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

        $scope.joinSession = function () {

            $http.post('/joinSession', $scope.join)
                .then(function (res) {
                    console.log(res.data);
                    authService.isLoggedIn = true;
                    authService.userData = $scope.join;
                    $location.path('/planningsession/' + authService.userData.sessionId );
                }, function (err) {
                    console.log(err.data);
                });

        }

    }]);