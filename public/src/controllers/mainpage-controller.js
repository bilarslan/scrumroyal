angular.module('mainpage-controller', [])
    .controller('main-controller', ['$scope', '$http', function ($scope, $http) {
        console.log('hello from main controller');


        $scope.title = '';
        $scope.isPrivate = false;
        $scope.password = '';
        $scope.username = '';


        $scope.newSession = function () {
            //console.log($scope.title, $scope.isPrivate, $scope.password, $scope.username);
            var data = {
                'title':$scope.title,
                'password':$scope.password,
                'username':$scope.username
            }
            $http.post('/newPlanning',data)
                .then(function (res) {
                    console.log(res.data);
                }, function (err) {
                    console.log(err);
                });
        }

    }]);