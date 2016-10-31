angular.module('mainApp')
		.controller('studentLoginController', ['$scope','$state','AuthService','$cookies', 
			function($scope,$state,AuthService,$cookies){

			$scope.user = {
				email:'',
				password:''
			}
			$scope.showError = false;
			$scope.postLogin = function(){
				if($scope.user.email !=='' && $scope.user.password !== ''){
					var url="/api/login/student";
					$scope.user.email = $scope.user.email.toLowerCase();
					AuthService.login(url,$scope.user)
								.then(function(response){
									if(response && response.data.content){
										var student = response.data.content; 
										$cookies.putObject("session", student);
										$state.go('dashboard.student');
										$scope.showError = false;
									}
								}, function(response){
									$scope.showError = true;
								})
				}
			}
			
		}])