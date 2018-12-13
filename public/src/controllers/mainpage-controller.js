angular.module('mainpage-controller', [])
    .controller('main-controller', ['$scope', '$http', '$location', 'authService', function ($scope, $http, $location, authService) {

        $scope.create = {
            title: '',
            isPrivate: false,
            password: '',
            username: ''
        }

        $scope.createMessage = 'asdsad';

        $scope.newSession = function () {
            $http.post('/newPlanning', $scope.create)
                .then(function (res) {
                    authService.isInitialized = true;
                    authService.userData = res.data;
                    $location.path('/planningsession/' + authService.userData.sessionId);
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

            authService.isInitialized = true;
            authService.userData = $scope.join;
            $location.path('/planningsession/' + authService.userData.sessionId);
        }

    }]);