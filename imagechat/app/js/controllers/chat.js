(function () {
	'use strict';

	angular
		.module('App')
		.controller('MainCtrl', MainCtrl)
		.controller('LoginCtrl', LoginCtrl)
		.controller('ChatController', ChatController);
	MainCtrl.$inject = ['$scope', '$rootScope', '$state',
  '$stateParams', 'ChatService','StorageService',
  '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
  '$ionicActionSheet', '$filter', '$ionicModal','$q'];

	function MainCtrl($scope, $rootScope, $state, $stateParams, ChatService,StorageService,
    $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicActionSheet, $filter, $ionicModal, $q, userData)
		 {
			 $scope.logout = function() {
				 ChatService.logOut();
			 }
		}
		// login
	LoginCtrl.$inject = ['$scope', '$rootScope', '$state',
  '$stateParams', 'ChatService','StorageService',
  '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
  '$ionicActionSheet', '$filter', '$ionicModal'];
	function LoginCtrl($scope, $rootScope, $state, $stateParams, ChatService, StorageService,
    $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicActionSheet, $filter, $ionicModal)
		{

		 $scope.data = {};

		 // An alert dialog
			$scope.showAlert = function() {
				var alertPopup = $ionicPopup.alert({
					title: 'Oops...',
					template: 'Invalid form data'
				});

				alertPopup.then(function(res) {
					//console.log('Thank you for not eating my delicious ice cream cone');
				});
			};

			$scope.valid={
				password:false,
				message:fals
			};
			$scope.login = function(form,data){
				$scope.doneLoading = true;
				var room = $stateParams.list? $stateParams.list : StorageService.getRoom();
				if(form.$valid) {
				 ChatService.login(data)
					.then(function(resp) {
						resp.data = resp.data.data? resp.data.data : resp.data;
						//console.log('then',resp);
							StorageService.setAuthData(resp.data);
								$scope.doneLoading = false;
								$state.go('chat',{list:room});
					})
					.catch(function(resp){
						console.log('err',resp);
						resp.data = resp.data.data? resp.data.data:resp.data;
						$scope.doneLoading = false;
						if(resp.status !== 404) {
							if (resp.data.hasOwnProperty('password')) {
		 						 $scope.valid.message = resp.data.password.notMatch;
		 					 }
		 					 if (resp.data.hasOwnProperty('message')) {
		 						 $scope.valid.message = resp.data.message;
		 					 }
						 } else {
							 $scope.valid.message = "Access Invalid Credentials"
						 }

					});
				} else {
					$scope.showAlert();
				}
			}
		}

	// main chat ctrl
	ChatController.$inject = ['$scope', '$rootScope', '$state',
  '$stateParams', 'ChatService',
  '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
  '$ionicActionSheet', '$filter', '$ionicModal','SockService','userData','StorageService'];
	function ChatController($scope, $rootScope, $state, $stateParams, ChatService,
    $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicActionSheet, $filter,
		 $ionicModal,SockService,userData,StorageService)
		{
				// An alert dialog
				 $scope.showAlert = function(message) {
				 	var alertPopup = $ionicPopup.alert({
					 title: 'Oops...',
					 template: message
				 });
				 alertPopup.then(function(res) {
					 //console.log('Thank you for not eating my delicious ice cream cone');
				 });
				};
				var room = $stateParams.list? $stateParams.list : StorageService.getRoom();
				var msgSocket = SockService.connect();
				if(!$scope.messages || $scope.messages === undefined) {
					$scope.messages = [];
					$scope.doneLoading = true;
				}
				//
				msgSocket.on('connect', function() {
					msgSocket.emit('room', room);
					msgSocket.on('message', function(resp) {
						// console.log('on resp',resp);
						$scope.messages.push(resp);
						$scope.$apply();
					});
					msgSocket.on('image', function(resp) {
						//console.log('image',resp,'userData',userData);
						if (resp.from.id === userData.id) {
						//	console.log(resp);
								$scope.doneLoading = true;
						}
						$scope.messages.push(resp);
						$scope.$apply();
					});
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
			//console.log('input.message $watch, newValue ' + newValue);
			//if (!newValue) newValue = '';
		});

		var addMessage = function (message) {

			msgSocket.emit('message', message);
		};

		var lastPhoto = 'img/donut.png';

		$scope.sendPhoto = function (e) {
			$scope.doneLoading = false;
			var msg ={};
			var fileTypes = ['jpg', 'jpeg', 'png', 'ico'];
			if(e && e.files && e.files.length > 0) {
				//console.log('doneLoading',$scope.doneLoading);
				$scope.$apply();
				var extension = e.files[0].name.split('.').pop().toLowerCase(),  //file extension from input file
					 isSuccess = fileTypes.indexOf(extension) > -1;  //is extension in acceptable types

			 if (isSuccess) {
				 var file = e.files[0];
				 var reader = new FileReader();
				 reader.onload = function(evt){

					 msg.image = evt.target.result;
					 msg.image_name = file.name;
					 msg.token = userData.token;
					 msg.user = {
						 firstName:userData.firstName,
						 id:userData.id,
						 imageUrl:userData.imageUrl
					 }
					 msgSocket.emit('image', msg);

				 };
				 if(msg!=={}){
					 reader.readAsDataURL(file);
				 }
			 } else {
				 //console.log('isSuccess else');
				 $scope.doneLoading = true;
 				 $scope.showAlert('File type is not supported');
			 }
		 } else {
			 $scope.doneLoading = true;
		 }

		};

		$scope.sendMessage = function (sendMessageForm) {
			// console.log(userData);
			var message = {
				message: $scope.input.message,
				user: {
					firstName:userData.firstName,
					id:userData.id,
					imageUrl:userData.imageUrl
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
			// console.log('keepKeyboardOpen');
			// txtInput.one('blur', function () {
			// 	txtInput[0].focus();
			// });
		}
		$scope.refreshScroll = function (scrollBottom, timeout) {
			$timeout(function () {
				scrollBottom = scrollBottom || $scope.scrollDown;
				viewScroll.resize();
				if (scrollBottom) {
					viewScroll.scrollBottom(true);
				}
				$scope.checkScroll();
			}, timeout || 1000);
		};
		$scope.scrollDown = true;
		$scope.checkScroll = function () {
			$timeout(function () {
				var currentTop = viewScroll.getScrollPosition().top;
				var maxScrollableDistanceFromTop = viewScroll.getScrollView().__maxScrollTop;
				$scope.scrollDown = (currentTop >= maxScrollableDistanceFromTop);
				$scope.$apply();
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
			var messages = $filter('orderBy')($filter('filter')($scope.messages, { image: '' }), 'date');
			$scope.activeSlide = messages.indexOf(message);
			$scope.allImages = messages.map(function (message) {
				return message.image;
			});

			openModal('templates/modals/fullscreenImages.html');
		};

		$scope.closeModal = function () {
			$scope.modal.remove();
		};

		$scope.onMessageHold = function (e, itemIndex, message) {
			$ionicActionSheet.show({
				buttons: [{
					text: 'Copy Text'
				}, {
						text: 'Delete Message'
					}],
				buttonClicked: function (index) {
					switch (index) {
						case 0: // Copy Text
							//cordova.plugins.clipboard.copy(message.text);

							break;
						case 1: // Delete
							// no server side secrets here :~)
							$scope.messages.splice(itemIndex, 1);
							$timeout(function () {
								viewScroll.resize();
							}, 0);

							break;
					}

					return true;
				}
			});
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
