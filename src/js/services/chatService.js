(function () {
    'use strict';

    angular
        .module('App')
        .factory('ChatService',['$http', '$q','$window','$state','BaseURL', ChatService])
        .factory('StorageService', ['$window', StorageService])
        .factory('SockService', ['StorageService','BaseURL', '$rootScope', SockService]);

    //socket
    function SockService(StorageService, BaseURL, $rootScope) {
        var me = {};
        const apiUrl = BaseURL;
        //console.log(BaseURL);
        const user = StorageService.getAuthData();
        me.connect = function () {
            if($rootScope.sock) {
                !$rootScope.sock.connected && $rootScope.sock.disconnect();
            }
            $rootScope.sock = io.connect(apiUrl,{transports: ['websocket']});
            return $rootScope.sock;
        };
        return me;
    }

    function StorageService($window) {
        var me = {};
        me.setAuthData = function (value) {
            $window.localStorage['_user'] = JSON.stringify(value);
        };
        me.getAuthData = function() {
            return JSON.parse($window.localStorage['_user'] || '{}');
        };
        me.setRoom = function (value) {
            $window.localStorage.setItem('_room', value);
        };
        me.getRoom = function() {
            return $window.localStorage.getItem('_room') || '';
        };
        return me;
    }

    function ChatService($http, $q,$window,$state,BaseURL) {
        var me = {};
        const apiUrl = BaseURL;
        me.logOut = function (_list, _tv) {
            $window.localStorage['_user'] = false;
            $state.go('login', { list: _list, tv: _tv, stateOut: true });
        };
        me.login = function(data) {
            const endpoint = "apiproxy/auth/";
            return $http({
                method: 'POST',
                url: apiUrl+endpoint,
                data: data,
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                }
            });
        };
        me.getUserMessages = function(d) {
            var deferred = $q.defer();
            setTimeout(function () {
                deferred.resolve(getMockMessages());
            }, 1500);
            return deferred.promise;
        };
        me.getMockMessage = function () {
            return {
                userId: '534b8e5aaa5e7afc1b23e69b',
                date: new Date(),
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
            };
        };
        me.getMockAuth = function () {
            return {
                "data": [
                    {
                        "id": "2212123321",
                        "birthday": "1986-03-19",
                        "firstName": "Monica",
                        "imageUrl": "http://media.vanityfair.com/photos/58c2f5aa0a144505fae9e9ee/master/pass/avatar-sequels-delayed.jpg",
                        "lastName": "Lupo",
                        "taxCode": "SDASDFDASFFSD",
                        "token": "asdfsadlkflkasdf==sadfasdfasdfklksdflgklgergok="
                    }
                ]
            }
        };
        /**
         * Load chunk of message history by page from specific room
         */
        me.loadMore = function (data) {
            return $http.get(BaseURL + 'history/' + data.room + '/' + data.page, data);
        };
        me.downloadHistory = function (room) {
            return $http.get(BaseURL + 'download_history/' + room);
        };
        return me;
    }

    function getMockMessages() {
        return {
            "messages": [
                { "_id": "535d625f898df4e80e2a125e", "text": "Ionic has changed the game for hybrid app development.", "userId": "534b8fb2aa5e7afc1b23e69c", "date": "2014-04-27T20:02:39.082Z", "read": true, "readDate": "2014-12-01T06:27:37.944Z" }, { "_id": "535f13ffee3b2a68112b9fc0", "text": "I like Ionic better than ice cream!", "userId": "534b8e5aaa5e7afc1b23e69b", "date": "2014-04-29T02:52:47.706Z", "read": true, "readDate": "2014-12-01T06:27:37.944Z" }, { "_id": "546a5843fd4c5d581efa263a", "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", "userId": "534b8fb2aa5e7afc1b23e69c", "date": "2014-11-17T20:19:15.289Z", "read": true, "readDate": "2014-12-01T06:27:38.328Z" }, { "_id": "54764399ab43d1d4113abfd1", "text": "Am I dreaming?", "userId": "534b8e5aaa5e7afc1b23e69b", "date": "2014-11-26T21:18:17.591Z", "read": true, "readDate": "2014-12-01T06:27:38.337Z" }, { "_id": "547643aeab43d1d4113abfd2", "text": "Is this magic?", "userId": "534b8fb2aa5e7afc1b23e69c", "date": "2014-11-26T21:18:38.549Z", "read": true, "readDate": "2014-12-01T06:27:38.338Z" }, { "_id": "547815dbab43d1d4113abfef", "text": "Gee wiz, this is something special.", "userId": "534b8e5aaa5e7afc1b23e69b", "date": "2014-11-28T06:27:40.001Z", "read": true, "readDate": "2014-12-01T06:27:38.338Z" }, { "_id": "54781c69ab43d1d4113abff0", "text": "I think I like Ionic more than I like ice cream!", "userId": "534b8fb2aa5e7afc1b23e69c", "date": "2014-11-28T06:55:37.350Z", "read": true, "readDate": "2014-12-01T06:27:38.338Z" }, { "_id": "54781ca4ab43d1d4113abff1", "text": "Yea, it's pretty sweet", "userId": "534b8e5aaa5e7afc1b23e69b", "date": "2014-11-28T06:56:36.472Z", "read": true, "readDate": "2014-12-01T06:27:38.338Z" }, { "_id": "5478df86ab43d1d4113abff4", "text": "Wow, this is really something huh?", "userId": "534b8fb2aa5e7afc1b23e69c", "date": "2014-11-28T20:48:06.572Z", "read": true, "readDate": "2014-12-01T06:27:38.339Z" }, { "_id": "54781ca4ab43d1d4113abff1", "text": "Create amazing apps - ionicframework.com", "userId": "534b8e5aaa5e7afc1b23e69b", "date": "2014-11-29T06:56:36.472Z", "read": true, "readDate": "2014-12-01T06:27:38.338Z" },
                { "_id": "535d625f898df4e80e2a126e", "photo": "http://ionicframework.com/img/homepage/phones-viewapp_2x.png", "userId": "546a5843fd4c5d581efa263a", "date": "2015-08-25T20:02:39.082Z", "read": true, "readDate": "2014-13-02T06:27:37.944Z" }], "unread": 0
        };
    }

})();
