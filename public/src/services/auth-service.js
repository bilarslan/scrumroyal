angular.module('auth-service-module', [])
    .factory('authService', function () {

        var authFactory = {};

        authFactory.isLoggedIn = false;
        authFactory.userData = {};

        return authFactory;
    });