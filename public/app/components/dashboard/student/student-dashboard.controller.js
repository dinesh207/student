angular.module('mainApp')
		.controller('studentDashboardController', ['$scope','$state','student','AuthService','ngToast','$mdToast', 
			function($scope,$state,student, AuthService,ngToast,$mdToast){


			var displayToast = function(type, msg) {
			    $mdToast.show(
			    	$mdToast.simple()
			        .textContent(msg)
			        .position('top center')
		 	        .hideDelay(3000)
		     	    .toastClass(type)
			    );
			};	
			$scope.seekingHelp = [];
			var loadSubjects = function(){
				var subjects =  'Non-calculus integrated Physics, Calculus integrated physics, English: Elementry School, '+
		              'English: Middle School, English: Underclassmen, Biology: Honors and Standard, '+
				      'AP Biology, Chemistry: Honors and Standard, AP Chemistry, Pre-Highschool Mathamatics, Algebra, Geometry, '+
		              'Algebra II, Pre-Calculus, Macro-Economics, Micro-Economics, Spanish, French, Latin, Computer Science, '+
		              'AP Computer Science';
		              return subjects.split(/, +/g).map( function (subject) {
				        return {
				          value: subject.toLowerCase(),
				          display: subject
				        };
				      });
			}
			// $scope.availableTutors = [];	
			$scope.searchSubjects = function(subject){
				var results = subject ? loadSubjects().filter( createFilterFor(subject) ) : loadSubjects();
			    return results;
			}
			function createFilterFor(query) {
		      var lowercaseQuery = angular.lowercase(query);
		      return function filterFn(state) {
		        return (state.value.indexOf(lowercaseQuery) === 0);
		      };

		    }
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

			//Caluclating average rating
			var averageRating = function(ratings){
				var sumOfRatings = 0;
				var totalRatings = ratings.length;
				var avgRating = 0;
				for (var i = 0; i < totalRatings; i++) {
					sumOfRatings += ratings[i].rating;
				}
				if(sumOfRatings !=0){
					avgRating = Math.round(sumOfRatings/totalRatings);
				}
				return avgRating;
			}
			$scope.createTableData = function(tutors){
				$scope.availableTutors = [];
				angular.forEach(tutors, function(tutor, key){
					var record = {};
					record._id = tutor._id;
					record.name = tutor.firstName+' '+tutor.lastName;
					record.grade = tutor.grade;
					record.availability = tutor.availability;
					record.subjects = tutor.subjects;
					record.email = tutor.email;
					if(tutor.ratings.length>0){
						var avg = averageRating(tutor.ratings);
						record.avgRating = avg;
						record.ratings = tutor.ratings;
					}
					$scope.availableTutors.push(record);
					console.log($scope.availableTutors);
				});
			}
			//getting availableTutors with query parameter


			$scope.getAvailableTutors = function(subject){
				//$scope.availableTutors = [];
				// if($scope.seekingHelp.length>0){
				// 	var data = [];
				// 	for (var i = 0; i < $scope.seekingHelp.length; i++) {
				// 		data.push($scope.seekingHelp[i]);
				// 	}
				if (subject && subject.display && subject.display.length>0) {
					$state.params = {'subject': subject};
					student.getAvailableTutors(subject.display)
							.then(function(response){
								if(response && response.data && response.data.content.length>0){
									$scope.foundTutors = response.data.content;
									$scope.createTableData($scope.foundTutors);
									}else{
										ngToast.create({
											className: 'warning',
											content: "<span>No tutors available right now for "+subject.display+"</span>",
											timeout:4000
										});
									}
							}, function(error){
								console.log(error);
								
							})
				}
					
				//}
			}
			//setting reviews
			$scope.setReviews = function(rating,id){
				$scope.tutorReviews = rating;
				$scope.tutorID = id;
				$scope.initNewRating();
			}
			$scope.addRatingToTutor = function(rating){
				var newTutors = [];
				angular.forEach($scope.foundTutors, function(value, key){
					if(value._id === rating._tutorId){
						value.ratings.push(rating);
					}
				});
				
			}
			$scope.newRating = {
				rating:0,
				description:''
			}
			$scope.initNewRating = function(){
				$scope.newRating.rating=0;
				$scope.newRating.description='';
			}
			$scope.addReview = function(flag){
				//Removing review part for now part
				if($scope.newRating.rating !==0 && $scope.tutorID !== null){
					student.giveRating($scope.tutorID, $scope.newRating.rating)
							.then(function(response){
								if(flag){
									$scope.addRatingToTutor(response.data.content);
									$scope.createTableData($scope.foundTutors);
									$('#addReview').modal('hide');
									ngToast.create({
											className: 'success',
											content: "<span>Thanks for your review.</span>",
											timeout:3000
										});
								}
								$scope.initNewRating();
							},function(response){

							})
				}
			}
			$scope.updateAwaiting = function(bookedTime){
				if($scope.availableTutors.length>0){
					angular.forEach($scope.availableTutors.availability, function(value, key){
						if(value.available == bookedTime){
							$scope.availableTutors.availability.isawaiting = true;
						}
					});
				}
			}
			$scope.setBookTutor = function(index, tutor){
				$scope.slotTime = tutor.availability[index];
				$scope.bookTutor = tutor;
				$scope.sendRequest='';
				$scope.showFiledsError = false;
				$scope.selectedSubject = '';
				$scope.showAlertToGiveRating = false;
				console.log($scope.bookTutor);
			}
			$scope.showBookingError = false;
			$scope.sendRequest = '';
			$scope.showFiledsError = false;
			$scope.showAlertToGiveRating = false;
			$scope.bookSlot = function(){
				if($scope.schedules.length>=3){
					$scope.showAlertToGiveRating = true;
					return false;
				}
				if($scope.slotTime !== undefined && $scope.bookTutor && $scope.selectedSubject !== '' && $scope.sendRequest !== ''){
					student.bookTutor($scope.slotTime.available, $scope.bookTutor._id,$scope.sendRequest,$scope.selectedSubject)
							.then(function(response){
								$scope.updateAwaiting($scope.slotTime.available);
								console.log("booked");
								$('#bookModal').modal('hide');
								ngToast.create({
											className: 'success',
											content: "<span>Email sent to "+$scope.bookTutor.email+"\n please wait until tutor confirmation.</span>",
											timeout:4000
										});
							}, function(response){
								$scope.showBookingError = true;
							})
				}else{
					$scope.showFiledsError = true;
				}
			}			
		}])