// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'App' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('App', ['ionic', 'btford.socket-io', 'ngAnimate', 'monospaced.elastic', 'angularMoment'])
.run(['$ionicPlatform',
      function($ionicPlatform,$httpProvider) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}])
//'http://192.168.0.110:8080/'
.constant('BaseURL', window.location.origin+'/')
.config(['$stateProvider',
         '$urlRouterProvider',
         '$ionicConfigProvider',
         '$compileProvider',
         '$httpProvider',
         function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider,$httpProvider) {

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content|ms-appx|x-wmapp0):|data:image\/|img\//);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);
    $ionicConfigProvider.scrolling.jsScrolling(ionic.Platform.isIOS());
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('AuthErrInterceptor');

    $stateProvider
    .state('chat', {
        url: "/:list/chat",
        cache: false,
        templateUrl: "templates/chat.html",
        controller: 'ChatController',
        resolve: {
          userData: ['StorageService', '$location', '$stateParams', function (StorageService, $location, $stateParams) {
            var user = StorageService.getAuthData();

            if(user.token) {
              return user;
            } else {
              if($stateParams.list){
                console.log('setRoom',$stateParams.list);
                StorageService.setRoom($stateParams.list)
              }
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

    $urlRouterProvider.otherwise('chat');
}])

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
