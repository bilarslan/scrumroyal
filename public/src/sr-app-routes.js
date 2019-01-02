angular.module('sr-app-routes', ['ngRoute'])
    .config(function ($routeProvider, $locationProvider) {

        $routeProvider
            .when('/', {
                templateUrl: '../views/main.html',
                controller: 'mainpage-controller'
            })
            .when('/create', {
                templateUrl: '../views/create.html',
                controller: 'createpage-controller'
            })
            .when('/join', {
                templateUrl: '../views/join.html',
                controller: 'joinpage-controller'
            })
            .when('/planningsession/:id', {
                templateUrl: '../views/planningsession.html',
                controller: 'planningsessionpage-controller'
            });


    });