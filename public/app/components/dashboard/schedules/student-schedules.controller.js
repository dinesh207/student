angular.module('mainApp')
		.controller('studentSchedulesController', ['$scope','$state','student','AuthService','ngToast', 
			function($scope,$state,student, AuthService,ngToast){

			//Get upcomming schedules
			$scope.schedules=[];
			$scope.getUpComingSchedules = function(){
				student.getSchedules()
						.then(function(response){
							$scope.schedules = response.data.content;
						}, function(response){
							console.log("No upcomming schedules");
						})
			}
			$scope.getUpComingSchedules();

			$scope.newRating = {
				rating:0,
				description:''
			}
			$scope.initNewRating = function(){
				$scope.newRating.rating=0;
				$scope.newRating.description='';
			}
			$scope.schedule = {};
			//Get confirmation row
			$scope.toBeConfirmed = function(schedule){
				$scope.schedule = schedule;
				$scope.confirm = false;
				$scope.emptyFields = false;
				$scope.initNewRating();
			}

			//Once Confirm tutoring removing row from schedules table 
			$scope.removeSchudlesFromTable = function(){
				if($scope.schedules.length>0){
					angular.forEach($scope.schedules, function(schedule, key){
						if(schedule._id == $scope.schedule._id ){
							$scope.schedules.splice(schedule, 1);
						}
					});
				}
			}
			$scope.addReview = function(flag){
				//Removing review part for now part
				if($scope.newRating.rating !==0 && $scope.tutorID !== null){
					student.giveRating($scope.tutorID, $scope.newRating.rating)
							.then(function(response){
								$('#addReview').modal('hide');
								ngToast.create({
										className: 'success',
										content: "<span>Thanks for your review.</span>",
										timeout:3000
									});
								
								$scope.initNewRating();
							},function(response){

							})
				}
			}
			//Confirm tutoring
			$scope.confirm = false;
			$scope.emptyFields = false;
			$scope.confirmSchedule = function(){	 	
			 	if($scope.schedule !== {} && $scope.newRating.rating !== 0){
			 		$scope.tutorID = $scope.schedule._bookedTutor._id;
				 	student.confirmTutoring($scope.confirm, $scope.schedule._id)
				 			.then(function(response){
				 				console.log("Thanks for confirming");
				 				$('#confirmModal').modal('hide');
				 				$scope.removeSchudlesFromTable();
				 				$scope.addReview();
				 				$scope.initNewRating();
				 				ngToast.create({
											className: 'success',
											content: "<p>Thanks for your confirmation</p>",
											timeout:6000
										});

				 			}, function(response){
				 				console.log("confirmation failed");
				 				ngToast.create({
											className: 'error',
											content: "<p>Failed confirm your session please try again!</p>",
											timeout:4000
										});
				 			})
			 	}else{
			 		$scope.emptyFields = true;
			 	}
			}
			
		}])