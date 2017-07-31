(function () {
	'use strict';

	angular
		.module('App')
		.controller('MainCtrl', MainCtrl)
		.controller('LoginCtrl', LoginCtrl)
		.controller('QuizController', QuizController);
		MainCtrl.$inject = ['$scope', '$rootScope', '$state',
	  '$stateParams', 'ApiService','StorageService',
	  '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
	  '$ionicActionSheet', '$filter', '$ionicModal','$q','$location'];

		function MainCtrl($scope, $rootScope, $state, $stateParams, ApiService,StorageService,
	    $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicActionSheet, $filter, $ionicModal, $q,$location)
			 {
				 $rootScope.usr = StorageService.getAuthData();

				 $scope.logout = function() {
					 ApiService.logOut();
					 $rootScope.usr = false;
				 }
			}
		// main chat ctrl
		LoginCtrl.$inject = ['$scope', '$rootScope', '$state',
	  '$stateParams', 'ApiService','StorageService',
	  '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
	  '$ionicActionSheet', '$filter', '$ionicModal','$q'];

		function LoginCtrl($scope, $rootScope, $state, $stateParams, ApiService,StorageService,
	    $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicActionSheet, $filter, $ionicModal, $q)
			 {
				$scope.data = {};
				// An alert dialog
			 $scope.showAlert = function() {
			   var alertPopup = $ionicPopup.alert({
			     title: 'Alert',
			     template: 'Invalid form data'
			   });

			   alertPopup.then(function(res) {
			     //console.log('Thank you for not eating my delicious ice cream cone');
			   });
			 };
			 $scope.valid={
				 password:false,
				 message:false
			 };
			 $scope.login = function(form,data) {

				 $scope.doneLoading = true;
				 var room = $stateParams.list? $stateParams.list : StorageService.getRoom();

				 if(form.$valid) {
				 	ApiService.login(data)
					 .then(function(resp) {
						 	resp.data = resp.data.data? resp.data.data : resp.data;
						 	StorageService.setAuthData(resp.data);
							$rootScope.usr = resp.data;
							$scope.doneLoading = false;

  						$state.go('quiz',{list:room});
					 })
					 .catch(function(resp){
						 $scope.doneLoading = false;
						 resp.data = resp.data.data? resp.data.data:resp.data;
						 if(resp.status !== 404) {
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
					 $scope.doneLoading = false;

				 	 $scope.showAlert();

				 }
			 }
			}
		// main chat ctrl
	QuizController.$inject = ['$location','$scope', '$rootScope', '$state', '$stateParams', 'ApiService',
  '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
  '$ionicActionSheet', '$filter', '$ionicModal','$q','StorageService'];
	function QuizController( $location,$scope, $rootScope, $state, $stateParams, ApiService,
    $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicActionSheet, $filter, $ionicModal,$q, StorageService) {

		$scope.goTo = function(id){
			//console.log('quiz'+id);
     $location.hash('quiz'+id);
     $ionicScrollDelegate.anchorScroll(true);
	 	}

		var listId = $stateParams.list? $stateParams.list : StorageService.getRoom();

		$scope.optlabel = ["A","B","C","D","G","E"];

		var init = function() {

			$scope.doneLoading = true;

			ApiService.getQuizs(listId)
			.then(function(resp){
				$scope.doneLoading = false;
				$scope.quizs = resp.data.data;
				//console.log($scope.quizs);

			})
			.catch(function(resp){
				$scope.doneLoading = false;
				$scope.quizs = ApiService.getMockQuizs();
			});
		}
		$scope.setQuiz = function(index,option) {

			if($scope.quizs[index].multipleSelect === true) {
				$scope.quizs[index].answers[option].picked =
					($scope.quizs[index].answers[option].picked)? false : true;
			} else {
				$scope.quizs[index].answers =
					$scope.quizs[index].answers.map(function(quiz) {
						quiz.picked = false;
						return quiz;
					});
					$scope.quizs[index].answers[option].picked = true;
			}

			var i = $scope.getCount();
			var els = document.getElementsByClassName('q-progress-li');
			if(els[i-1]) {
				els[i-1].style.background = '#1bbc9b';
			}
		}
		$scope.getCount = function () {
			if(!$scope.quizs) return false;
			return $scope.quizs.reduce(function(acc, question) {
				return acc + +((question.answers.every(function(answer) {
					return !answer.picked;
				}))? 0 : 1);
			}, 0);
		}

		init();

		$scope.populateData = function() {
			return $scope.quizs.map(function(question) {
				return {
					questionId: question.id,
					answersIds: question.answers.reduce(function(all, current) {
						if(current.picked) all.push(current.id);
						return all;
					}, [])
				}
			});
		}
		$scope.submitData = function() {
			$scope.doneLoading = true;

			$scope.submited = true;
			$scope.animation = false;
			ApiService.setQuizs($scope.populateData(),listId)
			.then(function(){
				$scope.doneLoading = false;
			})
			.catch(function(){
				$scope.doneLoading = false;
			});
		}

	}
})();
