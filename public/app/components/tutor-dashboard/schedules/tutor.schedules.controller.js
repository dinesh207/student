angular.module('mainApp')
		.controller('tutorSchedulesController', ['$scope','$state','tutor', function($scope, $state, tutor){
			
			$scope.dynamicPopover = {
			    templateUrl: 'myPopoverTemplate.html'
			};
			//Get Schudles to Confirm
			$scope.schedulesToConfirm = [];
			$scope.getSchudulesToBeConfrim = function(){
				tutor.getSchedulesToConfirm()
						.then(function(response){
							if(response && response.data && response.data.content.length>0){
								$scope.schedulesToConfirm= response.data.content;
							}
						}, function(response){
							console.log("getting schedules failed");
						})
			}
			$scope.getSchudulesToBeConfrim();
			//Get upcomming schedules
			$scope.tutorUpcommingSchudles = [];
			$scope.getUpComingTutorSchedules = function(){
				tutor.getSchedules()
						.then(function(response){
							$scope.tutorUpcommingSchudles = response.data.content;
						}, function(response){
							console("No upcomming schedules");
						})
			}
			$scope.getUpComingTutorSchedules();

			$scope.setScheduleToConfirm = function(schedule){
				$scope.schedule = schedule;
			}
			$scope.confirmOrRejectSchedule = function(confirm, reject){
				if($scope.schedule !== undefined){
					var name = $scope.schedule._bookedBy.firstName+' '+$scope.schedule._bookedBy.lastName;
					tutor.confirmOrReject($scope.schedule._id, confirm, reject, name, $scope.schedule._bookedBy.email)
							.then(function(response){
								console.log('thanks for confirming');
								var index = $scope.schedulesToConfirm.indexOf($scope.schedule);
								$scope.schedulesToConfirm.splice(index,1);
							}, function(response){

							})
				}
				
			}
		}])