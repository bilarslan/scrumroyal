angular.module('auth-service-module', [])
    .factory('authService', ['$window', function ($window) {

        var authFactory = {};

        authFactory.isInitialized = false;
        authFactory.isLoggedIn = false;
        authFactory.userData = {};

        authFactory.getData = function () {
            return {
                sessionId: $window.localStorage.getItem('sessionId'),
                token: $window.localStorage.getItem('token')
            }
        }

        authFactory.setData = function (sessionId, token) {
            if (sessionId && token) {
                $window.localStorage.setItem('sessionId', sessionId)
                $window.localStorage.setItem('token', token);
            } else {
                $window.localStorage.removeItem('sessionId', sessionId)
                $window.localStorage.removeItem('token');
            }
        }

        return authFactory;
    }]);