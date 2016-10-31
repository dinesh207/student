angular.module('mainApp')
		.controller('studentController', ['$scope','student','$state', function($scope, student,$state){

			$scope.registerDetails = {
				firstname:'',
				lastname:'',
				email:'',
				password:'',
				grade:''
			}
			$scope.showSuccess=false;
			$scope.showError=false;
			$scope.register=function(){
				console.log($scope.registerDetails);
				if($scope.registerDetails.firstname != null && $scope.registerDetails.lastname != null){
					$scope.registerDetails.email = $scope.registerDetails.email.toLowerCase();
					student.register($scope.registerDetails)
							.then(function(response){
								if(response){
									$scope.showSuccess = true;
									$state.go('app');
								}

							}, function(error){
								if(error.data.status === 409){
									$scope.showError = true;
								}
							})
				}
			}

		}])