angular.module('mainApp')
		.controller('tutorLoginController', ['$scope','$state','AuthService','$cookies', 
			function($scope,$state,AuthService,$cookies){

			$scope.user = {
				email:'',
				password:''
			}
			$scope.showError = false;
			$scope.postLogin = function(){
				if($scope.user.email !=='' && $scope.user.password !== ''){
					var url="/api/login/tutor";
					$scope.user.email = $scope.user.email.toLowerCase();
					AuthService.login(url,$scope.user)
								.then(function(response){
									if(response && response.data.content){
										var tutor = response.data.content; 
										$cookies.putObject("session", tutor);
										$state.go('dashboardTutor.tutorHome');
									}
								}, function(response){
									console.log("login faild");	
									$scope.showError = true;
								})
				}
			}
			
		}])