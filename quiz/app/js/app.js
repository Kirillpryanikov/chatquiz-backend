// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'App' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('App', ['ionic', 'ngAnimate', 'monospaced.elastic', 'angularMoment'])

.run(['$ionicPlatform',
      function($ionicPlatform, $httpProvider) {
  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}])
.config(['$stateProvider',
         '$urlRouterProvider',
         '$ionicConfigProvider',
         '$compileProvider',
         '$httpProvider',
         function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider, $httpProvider) {
          $ionicConfigProvider.scrolling.jsScrolling(ionic.Platform.platform() != 'win32' && ionic.Platform.platform() != "linux" && ionic.Platform.platform() != "macintel");
          $httpProvider.interceptors.push('AuthInterceptor');
          $httpProvider.interceptors.push('AuthErrInterceptor');

    $stateProvider
        .state('quiz', {
            url: "/:list/quiz",
            cache: false,
            templateUrl: "templates/quiz.html",
            controller: 'QuizController',
            resolve: {
              userData: ['StorageService', '$location', function (StorageService, $location) {
                var user = StorageService.getAuthData();
                if(user.token) {
                  return user;
                } else {
                  $location.path('login');
                }
              }]
            }
        })
        .state('login', {
            url: "/login",
            cache: false,
            templateUrl: "templates/login.html",
            controller: 'LoginCtrl',
            resolve: {
              userData: ['StorageService', function (StorageService) {
                return StorageService.getAuthData()
              }]
            }
        });

        $urlRouterProvider.otherwise('quiz');
}])
 // window.location.origin
.constant('BaseURL', 'http://192.168.0.110:8080/')
.factory('AuthInterceptor', function(StorageService,$q,$location) {
  return {
    request: function(config) {
      var data = StorageService.getAuthData();
      //  console.log(data);

      config.headers['X-App-Key'] = '1234567890';
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';

      if(data.hasOwnProperty('token')) {
        config.headers['X-Auth-Token'] = data.token;
      }

      return config;
    }
  }
})
.factory('AuthErrInterceptor', function(StorageService,$q,$location) {
  return {
    responseError: function(response) {
      if (response.status === 401) {
        $location.path('/login');
        StorageService.setAuthData('');
        return $q.reject(response);
      } else {
        return $q.reject(response);
      }

      return config;
    }
  }
});
