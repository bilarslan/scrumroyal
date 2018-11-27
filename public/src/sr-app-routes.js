angular.module('sr-app-routes', ['ngRoute'])
    .config(function($routeProvider, $locationProvider){
        
        $routeProvider
            .when("/", {
                templateUrl : "../views/main.html"
            })

    });