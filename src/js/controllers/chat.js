(function () {
    'use strict';

    angular
        .module('App')
        .controller('MainCtrl', MainCtrl)
        .controller('LoginCtrl', LoginCtrl)
        .controller('ChatController', ChatController);
         MainCtrl.$inject = ['$scope', '$rootScope', '$state',
        '$stateParams', 'ChatService', 'StorageService',
        '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
        '$ionicActionSheet', '$filter', '$ionicModal', '$q', '$location'];

    function MainCtrl($scope, $rootScope, $state, $stateParams, ChatService, StorageService,
                      $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicActionSheet, $filter, $ionicModal, $q, $location) {
        $rootScope.usr = StorageService.getAuthData();
        $scope.logout = function () {
            ChatService.logOut($stateParams.list, $stateParams.tv);
            $rootScope.usr = false;
        };
    }

    // login
    LoginCtrl.$inject = ['$scope', '$rootScope', '$state',
        '$stateParams', 'ChatService', 'StorageService','$translate',
        '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
        '$ionicActionSheet', '$filter', '$ionicModal'];

    function LoginCtrl($scope, $rootScope, $state, $stateParams, ChatService, StorageService, $translate,
                       $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicActionSheet, $filter, $ionicModal) {

        $scope.data = {};
        $scope.showAlert = function () {
            var alertPopup = $ionicPopup.alert({
                title: 'Oops...',
                template: $translate.instant('INVALID_FORM_DATA')
            });

            alertPopup.then(function (res) {
                //console.log('Thank you for not eating my delicious ice cream cone');
            });
        };

        $scope.valid = {
            password: false,
            message: false
        };

        $scope.login = function (form, data) {
            $scope.doneLoading = true;

            if (form.$valid) {
                ChatService.login(data)
                    .then(function (resp) {
                        resp.data = resp.data.data ? resp.data.data : resp.data;
                        StorageService.setAuthData(resp.data);
                        $scope.doneLoading = false;
                        $rootScope.usr = resp.data;
                        if ($stateParams.tv == 'tv') {
                            $state.go('tv', {list: $stateParams.list, tv: $stateParams.tv});
                        } else {
                            $state.go('chat', {list: $stateParams.list});
                        }
                    })
                    .catch(function (resp) {

                        resp.data = resp.data.data ? resp.data.data : resp.data;
                        $scope.doneLoading = false;
                        if (resp.status !== 404) {
                            if (resp.data.hasOwnProperty('password')) {
                                $scope.valid.message = resp.data.password.notMatch;
                            }
                            if (resp.data.hasOwnProperty('message')) {
                                $scope.valid.message = resp.data.message;
                            }
                        } else {
                            $scope.valid.message = "Access Invalid Credentials"
                            $scope.doneLoading = false;
                        }

                    });
            } else {
                $scope.showAlert();
                $scope.doneLoading = false;
            }
        }
    }

    // main chat ctrl
    ChatController.$inject = ['$scope', '$rootScope', '$state',
        '$stateParams', 'ChatService',
        '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
        '$ionicActionSheet', '$filter', '$ionicModal', 'SockService', 'userData', 'StorageService','$translate'];

    function ChatController($scope, $rootScope, $state, $stateParams, ChatService,
                            $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicActionSheet, $filter,
                            $ionicModal, SockService, userData, StorageService, translate) {
        if (!userData) {
            $state.go('login', { list: $stateParams.list, tv: $stateParams.tv });
        }
        var _lastWritingEvent = 0;
        $scope.tv = $stateParams.tv === 'tv' ? true : false;
        $scope.writingNow = [];

        var blopFx = new Howl({
            src: ['sound/blop.mp3']
        });

        $scope.editTopic = function () {
            $scope.topic_edit = true;
        }
        $scope.saveTopic = function (title) {
            $scope.topic_edit = false;
            var message = {
                message: translate.instant('CHANGE_TOPIC') + $scope.topic_title,
                user: {
                    firstName: userData.firstName,
                    id: userData.id,
                    imageUrl: userData.imageUrl,
                    token: userData.token,
                    owner_id: $scope.owner.owner_id,
                    owner_color: $scope.owner.color
                },
                topic: $scope.topic_title
            };
            addMessage(message);
           // $scope.topic_title = title;

        }
        $scope.loadMore = function () {
            $scope.loadMoreFlag = true;
            $scope.page = !$scope.page ? 1 : parseInt($scope.page) + 1;
            ChatService.loadMore({room: $stateParams.list, page: $scope.page})
                .then(function (resp) {
                    var newScroll = 0;
                    for ( var i = resp.data.length - 1; i >= 0 ; i-- ) {
                        $scope.messages.unshift(resp.data[i]);
                        var elem = angular.element(document.getElementsByClassName('message-wrapper'));
                        newScroll += elem[0].clientHeight;
                    }
                    $ionicScrollDelegate.scrollTo(0, newScroll);
                })
                .finally(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                });
        }
        $scope.writing = function () {
            var _now = Date.now();
          if($scope.input.message && $scope.input.message.length > 0 && (_now - _lastWritingEvent > 5000)) {
              msgSocket.emit('writing', {id: userData.id, firstName: userData.firstName });
              _lastWritingEvent = _now;
          }

        };

        $scope.showAlert = function (message) {
            var alertPopup = $ionicPopup.alert({
                title: 'Oops...',
                template: '<p>' + message + '</p>'
            });
            alertPopup.then(function (res) {
                //console.log('Thank you for not eating my delicious ice cream cone');
            });
        };
        $scope.like = function (index) {
            if(!$scope.messages[index].likes) {
                $scope.messages[index].likes = 0;
            }
            msgSocket.emit('like', {message_id: $scope.messages[index].msg_id, user_id: $scope.user.id});
        };
        var msgSocket = SockService.connect();
        if (!$scope.messages || $scope.messages === undefined) {
            $scope.messages = [];
            $scope.doneLoading = true;
        }

        var removeFromWritingNow = function (u) {
            angular.forEach($scope.writingNow, function(user, key) {
                if (user.id === u.id) {
                    $scope.writingNow.splice(key, 1);
                }
            });
        };
        if(userData) {
            msgSocket.on('connect', function () {
                $scope.doneLoading = false;
                msgSocket.emit('room', {'room': $stateParams.list, 'userId': userData.id, 'username': userData.firstName,'token': userData.token});

            });
            //message
            $scope.owner = {};
            $scope.topic_edit = false;
            msgSocket.on('room', function (resp) {
                $scope.owner = resp;
                if(!$scope.topic_title || resp.owner_id || resp.topic) {
                    if(resp.topic ) {
                        $scope.topic_title = resp.topic;
                    }
                    if(!$scope.topic_title && $scope.owner.owner_id)  {
                        $scope.topic_title = translate.instant('SET_TOPIC');
                    }
                }
                if(resp.history) {
                    $scope.messages = resp.history;
                }
                $scope.doneLoading = true;
                $scope.$apply();
            });
            //like
            msgSocket.on('like', function (resp) {
                if(resp.message_id ) {
                    $scope.messages.find(function (e, i) {
                        if(e.msg_id === resp.message_id) {
                            if($scope.messages[i].likes !== resp.count){
                                $scope.messages[i].likes = resp.count;
                                if(resp.user_id === $scope.user.id ){
                                    $scope.messages[i].liked = !$scope.messages[i].liked;
                                }
                            }
                        }
                    });
                }
                $scope.$apply();
            });
            //message
            msgSocket.on('message', function (resp) {
                $scope.loadMoreFlag = false;
                if (resp.from.id === userData.id) {
                    if (resp.errors) {
                        $scope.doneLoading = true;
                        $scope.showAlert(resp.errors);
                        ChatService.logOut($stateParams.list);
                    }
                }
                if(resp.topic) {
                    $scope.topic_title = resp.topic;
                }
                resp.ui = {};
                resp.ui.time = moment().diff(resp.time) > 86400000 ? moment(resp.time).format('DD/MM/YYYY') : moment(resp.time).format('H:mm');
                $scope.messages.push(resp);
                $scope.$apply();
                blopFx.play();
            });
            //writing
            msgSocket.on('writing', function (u) {

                if(u.id === userData.id)
                    return false;

                u.timerId = $timeout(function() { removeFromWritingNow(u) }, 6000);

                if($scope.writingNow.length === 0)
                    $scope.writingNow.push(u);
                else
                    angular.forEach($scope.writingNow, function(user, key) {
                        if(user.id === u.id)
                        {
                            $timeout.cancel(user.timerId);
                            user.timerId = u.timerId;
                            return false;
                        }
                        if(key === $scope.writingNow.length)
                            $scope.writingNow.push(u);
                    });

            });

            //images
            msgSocket.on('image', function (resp) {
                if (resp.from.id === userData.id) {
                    if (resp.errors) {
                        $scope.doneLoading = true;
                        var out = '';
                        if (typeof resp.errors.message === 'object') {
                            for (var i in resp.errors.message) {
                                if (typeof resp.errors.message[i] === 'object') {
                                    for (var j in resp.errors.message[i]) {
                                        out += '<p>' + resp.errors.message[i][j] + "</p>";
                                    }
                                } else {
                                    out += '<p>' + resp.errors.message + "</p>";
                                }
                            }
                        } else {
                            out += '<p>' + resp.errors.message + "</p>";
                        }
                        $scope.showAlert(out);
                    }
                    $scope.doneLoading = true;
                }
                $scope.messages.push(resp);
                $scope.$apply();
            });
        } //end of > if (userData)


        msgSocket.on('disconnect', function () {
            $scope.showAlert(translate.instant('SOCKET_SERVER_DOWN_MSG'));
        });

        // this could be on $rootScope rather than in $stateParams
        $scope.user = userData;
        // var myIoSocket = socket.connect('http://192.168.0.110:8080/123/chat/');
        $scope.input = {
            //message: localStorage['userMessage-' + $scope.toUser._id] || ''
        };

        var messageCheckTimer;

        var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
        var footerBar; // gets set in $ionicView.enter
        var scroller;
        var txtInput; // ^^^

        $scope.$on('$ionicView.enter', function () {
            //getMessages();

            $timeout(function () {
                footerBar = document.body.querySelector('.homeView .bar-footer');
                scroller = document.body.querySelector('.homeView .scroll-content');
                txtInput = angular.element(footerBar.querySelector('textarea'));
            }, 0);

            messageCheckTimer = $interval(function () {
                // here you could check for new messages if your app doesn't use push notifications or user disabled them
            }, 20000);
        });

        $scope.$on('$ionicView.leave', function () {
            // Make sure that the interval is destroyed
            if (angular.isDefined(messageCheckTimer)) {
                $interval.cancel(messageCheckTimer);
                messageCheckTimer = undefined;
            }
        });


        $scope.$watch('input.message', function (newValue, oldValue) {
            //if (!newValue) newValue = '';
        });

        var addMessage = function (message) {
            msgSocket.emit('message', message);
        };
        $scope.closeUpload = function () {
            delete($scope.img_review);
        };
        $scope.sendPhoto = function (e) {
            var fileTypes = ['jpg', 'jpeg', 'png', 'ico'];
            if (e && e.files && e.files.length > 0) {
                $scope.$apply();
                var extension = e.files[0].name.split('.').pop().toLowerCase(),  //file extension from input file
                    isSuccess = fileTypes.indexOf(extension) > -1;  //is extension in acceptable types

                if (isSuccess) {
                    var file = e.files[0];
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                        $scope.msg = $scope.img_review = {};
                        $scope.img_review.image = evt.target.result;
                        $scope.msg.image = evt.target.result;
                        $scope.msg.image_name = file.name;
                        $scope.msg.token = userData.token;
                        $scope.msg.user = {
                            firstName: userData.firstName,
                            id: userData.id,
                            imageUrl: userData.imageUrl,
                            owner_id: $scope.owner.owner_id,
                            owner_color: $scope.owner.color
                        }
                        $scope.$apply();

                    };
                    if ($scope.msg !== {}) {
                        reader.readAsDataURL(file);
                    }
                } else {
                    $scope.doneLoading = true;
                    $scope.showAlert('File type is not supported');
                }
            } else {
                $scope.doneLoading = true;
            }

        };
        $scope.sendPhotoMessage = function (msg) {
            $scope.msg.message = msg;
            msgSocket.emit('image', $scope.msg);
            delete($scope.img_review);
        }
        $scope.sendMessage = function (sendMessageForm) {
            var message = {
                message: $scope.input.message,
                user: {
                    firstName: userData.firstName,
                    id: userData.id,
                    imageUrl: userData.imageUrl,
                    token: userData.token,
                    owner_id: $scope.owner.owner_id,
                    owner_color: $scope.owner.color
                }
            };

            // if you do a web service call this will be needed as well as before the viewScroll calls
            // you can't see the effect of this in the browser it needs to be used on a real device
            // for some reason the one time blur event is not firing in the browser but does on devices
            keepKeyboardOpen();

            //ChatService.sendMessage(message).then(function(data) {

            $scope.input.message = '';
            addMessage(message);
            $timeout(function () {
                keepKeyboardOpen();
            }, 0);

        };

        // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
        function keepKeyboardOpen() {
            // txtInput.one('blur', function () {
            // 	txtInput[0].focus();
            // });
        }

        $scope.refreshScroll = function (scrollBottom, timeout) {
            if (!$scope.loadMoreFlag) {
                $timeout(function () {
                    scrollBottom = scrollBottom || $scope.scrollDown;
                    viewScroll.resize();
                    if (scrollBottom) {
                        viewScroll.scrollBottom(true);
                    }
                    $scope.checkScroll();
                }, timeout || 1000);
            }
        };
        $scope.scrollDown = true;
        $scope.checkScroll = function () {
            $timeout(function () {

                try {
                    var currentTop = viewScroll.getScrollPosition().top;
                    var maxScrollableDistanceFromTop = viewScroll.getScrollView().__maxScrollTop;
                    $scope.scrollDown = (currentTop >= maxScrollableDistanceFromTop);
                    $scope.$apply();
                }
                catch (e) {}

            }, 0);
            return true;
        };

        var openModal = function (templateUrl) {
            return $ionicModal.fromTemplateUrl(templateUrl, {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: false
            }).then(function (modal) {
                modal.show();
                $scope.modal = modal;
            });
        };

        $scope.photoBrowser = function (message) {
            var messages = $filter('orderBy')($filter('filter')($scope.messages, {image: ''}), 'date');
            $scope.activeSlide = messages.indexOf(message);
            $scope.allImages = messages.map(function (message) {
                return message.image;
            });

            openModal('templates/modals/fullscreenImages.html');
        };

        $scope.closeModal = function () {
            $scope.modal.remove();
        };

        $scope.$on('elastic:resize', function (event, element, oldHeight, newHeight) {
            if (!footerBar) return;

            var newFooterHeight = newHeight + 10;
            newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

            footerBar.style.height = newFooterHeight + 'px';
            scroller.style.bottom = newFooterHeight + 'px';
        });

    }
})();
