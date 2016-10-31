angular.module('mainApp')
		.controller('tutorController', ['$scope','tutor','$state', function($scope, tutor,$state){

			$scope.tutorRegistationDetails = {
				firstname:'',
				lastname:'',
				email:'',
				password:'',
				grade:'',
				subjects:[],
				availability:[]
			}
			$scope.customAvailability=[];
			$scope.showError=false;
			$scope.showEmptyError = false;
			$scope.$watch('selectedDate', function(newValue, oldValue, scope) {
				if(oldValue !== newValue){
					var updateavailability = {};
					updateavailability.available = new Date(newValue).getTime();
					updateavailability.isawaiting = false;
					$scope.tutorRegistationDetails.availability.push(updateavailability);
					console.log($scope.tutorRegistationDetails.availability);
				}
			}, true);
			$scope.removeSelectedDate = function(index){
				$scope.tutorRegistationDetails.availability.splice(index, 1);
			}
			//Submit registration details
			$scope.submitRegistration = function(){
				console.log($scope.tutorRegistationDetails);
				if($scope.tutorRegistationDetails.firstname !== '' && $scope.tutorRegistationDetails.lastname !== ''
						&& $scope.tutorRegistationDetails.email !== '' && $scope.tutorRegistationDetails.password !==''
							&& $scope.tutorRegistationDetails.grade !== '' && $scope.tutorRegistationDetails.subjects.length>0
								&& $scope.tutorRegistationDetails.availability.length>0){
					// if($scope.customAvailability.length>0){
					// 	$scope.tutorRegistationDetails.availability.push($scope.customAvailability);
					// }
					$scope.tutorRegistationDetails.email = $scope.tutorRegistationDetails.email.toLowerCase();
					tutor.register($scope.tutorRegistationDetails)
							.then(function(response){
									console.log(response);
									$state.go('app');
							}, function(responsse){
								if(error.data.status === 409){
									$scope.showError = true;
								}
							});
				}else{
					$scope.showEmptyError = true;
				}
			}

		}])