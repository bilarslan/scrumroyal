angular.module('auth-service-module', [])
    .factory('authService', function () {

        var authFactory = {};

        authFactory.isInitialized = false;
        authFactory.isLoggedIn = false;
        authFactory.userData = {};

        return authFactory;
    });