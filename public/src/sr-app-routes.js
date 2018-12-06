angular.module('sr-app-routes', ['ngRoute'])
    .config(function ($routeProvider, $locationProvider) {

        $routeProvider
            .when('/', {
                templateUrl: '../views/main.html',
                controller: 'main-controller'
            })
            .when('/planningsession/:id/:username/:password', {
                templateUrl: '../views/planningsession.html',
                controller: 'planningsession-controller'
            });

    });