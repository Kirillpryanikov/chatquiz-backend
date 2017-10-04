angular.module('App', ['ionic', 'btford.socket-io', 'ngAnimate','monospaced.elastic', 'pascalprecht.translate', 'ionicLazyLoad'])
.run(['$ionicPlatform', function($ionicPlatform) {
        $ionicPlatform.ready(function() {});
    }])
.constant('BaseURL', window.location.origin+'/')
.config(['$stateProvider',
    '$urlRouterProvider',
    '$ionicConfigProvider',
    '$compileProvider',
    '$httpProvider',
    '$translateProvider',
    function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider,$httpProvider,$translateProvider) {
        $ionicConfigProvider.scrolling.jsScrolling(ionic.Platform.platform() !== 'win32' && ionic.Platform.platform() !== "linux" && ionic.Platform.platform() !== "macintel");
        $translateProvider.preferredLanguage('it');
        $translateProvider.translations('it', {});

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content|ms-appx|x-wmapp0):|data:image\/|img\//);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|file|ghttps?|ms-appx|x-wmapp0):/);
        $ionicConfigProvider.scrolling.jsScrolling(ionic.Platform.isIOS());
        $httpProvider.interceptors.push('AuthInterceptor');
        $httpProvider.interceptors.push('AuthErrInterceptor');

        $stateProvider
        .state('chat', {
            url: "/:list/:tv",
            cache: false,
            templateUrl: "templates/chat.html",
            controller: 'ChatController',
            resolve: {
                userData: ['StorageService', '$location', '$stateParams', function (StorageService, $location, $stateParams) {
                    var user = StorageService.getAuthData();
                    if (user.token) {
                        return user;
                    } else {
                        if ($stateParams.list) {
                            StorageService.setRoom($stateParams.list);
                        }
                    }
                }]
            }
        })
        .state('tv', {
            url: "/:list/:tv",
            cache: false,
            templateUrl: "templates/chat.html",
            controller: 'ChatController',
            resolve: {
                userData: ['StorageService', '$location', '$stateParams', function (StorageService, $location, $stateParams) {
                    var user = StorageService.getAuthData();
                    if (user.token) {
                        return user;
                    } else {
                        if ($stateParams.list) {
                            StorageService.setRoom($stateParams.list);
                        }
                    }
                }]
            }
        })
        .state('login', {
            url: "/:list/login/:tv",
            cache: false,
            templateUrl: "templates/login.html",
            controller: 'LoginCtrl',
            resolve: {
                userData: ['StorageService', function (StorageService) {
                    return StorageService.getAuthData();
                }],
            }
        })
        .state('download_history', {
            url: "/:list/download_history/",
            cache: false,
            templateUrl: "templates/download_history.html",
            controller: 'DownloadHistoryCtrl'
        })
        .state('error_page', {
            url: "/404",
            cache: false,
            templateUrl: "templates/404.html",
            controller: 'ErrorPageCtrl',
        });
        $urlRouterProvider.otherwise('404');
}])
.factory('AuthInterceptor', function(StorageService) {
    return {
        request: function(config) {
            var data = StorageService.getAuthData();
            config.headers['X-App-Key'] = '1234567890';
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';

            if(data.hasOwnProperty('token')) {
                config.headers['X-Auth-Token'] = data.token;
                config.headers['X-User-Id'] = data.id;
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
        }
    }
});
