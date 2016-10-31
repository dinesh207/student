angular.module('mainApp')
		.controller('tutorHome', ['$scope','tutor', function($scope,tutor){
			
			$scope.dynamicPopover = {
			    templateUrl: 'myPopoverTemplate.html'
			};
			$scope.availability = [];
			$scope.currentAvaialability=[];
			$scope.$watch('selectedDate', function(newValue, oldValue, scope) {
				if(oldValue !== newValue){
					var updateavailability = {};
					updateavailability.available = new Date(newValue).getTime();
					updateavailability.isawaiting = false;
					$scope.availability.push(updateavailability);
					console.log($scope.availability);
				}
			}, true);
			$scope.removeSelectedDate = function(index){
				$scope.availability.splice(index, 1);
			}
			$scope.getCurrentAvailability = function(){
				tutor.getAvailability()
						.then(function(response){
							$scope.currentAvaialability = response.data.content;
							console.log($scope.currentAvaialability);
						}, function(response){

						})
			}
			$scope.getCurrentAvailability();
			var addToCurrentAvailability = function(){
				angular.forEach($scope.availability, function(value, key){
					$scope.currentAvaialability.push(value);					
				});
				$scope.availability = [];					
			}
			//Remove current availability
			$scope.setAvailabilityToRemove = function(slotTime){
				$scope.slotTime = slotTime;
			}
			$scope.removeAvailability = function(){
				if($scope.slotTime){
					tutor.removeAvailability($scope.slotTime.available)
							.then(function(response){
								if(response){
									angular.forEach($scope.currentAvaialability, function(value, key){
										if(value.available == $scope.slotTime.available){
											$scope.currentAvaialability.splice(key,1);
										}
									});
									$('#removeAvailability').modal('hide');
									console.log("removed availability successfully");
								}
							}, function(response){

							})
				}
			}
			//Update Availability
			$scope.postAvailability = function(){
				if($scope.availability.length>0){
					tutor.updateAvailability($scope.availability)
							.then(function(response){
								addToCurrentAvailability();
							}, function(response){
								console.log("error while updating");
							})
				}
			}

		}])
