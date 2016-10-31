angular.module('mainApp')
		.service('student', ['$q','$http', function($q,$http){
			var upcommingSchedules;
			return {
				register:function(student){
					var defferd = $q.defer();
					var url = '/api/register/student';
					var data = student;
					$http.post(url, data)
							.then(function(response){
								if(response){
								defferd.resolve(response);
								}else{
									defferd.resolve([]);
								}
							}, function(response){
								defferd.reject(response);
							})
					return defferd.promise;
				},
				getAvailableTutors:function(subjects){
					var defferd = $q.defer();
					var url = '/student/findTutors/'+subjects;
					// var data = {
					// 	subjects:subjects
					// };
					$http.get(url)
							.then(function(response){
								if(response){
									defferd.resolve(response);
								}
							}, function(response){
								defferd.reject(response);
							})
					return defferd.promise;
				},
				getSchedules:function(){
					var defferd = $q.defer();
					var url = '/student/getUpcomingSchedules';
					if(upcommingSchedules && upcommingSchedules.data && upcommingSchedules.data.content.length>0){
						console.log('searching form cache');
						defferd.resolve(upcommingSchedules);
					}else{
						$http.get(url)
								.then(function(response){
									console.log('searching form backend');
									upcommingSchedules = response;
									defferd.resolve(upcommingSchedules);
								}, function(response){
									defferd.reject(response);
								})
					}
					return defferd.promise;
				},
				giveRating:function(tutor, rating, review){
					var defferd = $q.defer();
					var url = '/student/tutorRating';
					var data = {
					    "tutorId":tutor,
					    "rating":rating,
					    "review":review
					}
					$http.post(url, data)
							.then(function(response){
								if(response){
									defferd.resolve(response);
								}
							}, function(response){
								defferd.reject(response);
							})
					return defferd.promise;
				},
				confirmTutoring:function(confirm, id){
					var defferd = $q.defer();
					var url = '/student/confirmTutoring';
					var data = {
						"scheduleId":id,
						"confirm":confirm
					}
					$http.post(url, data)
							.then(function(response){
								if(response){
									defferd.resolve(response);
								}
							}, function(response){
								defferd.reject(response);
							})
					return defferd.promise;
				},
				bookTutor:function(slotTime, tutorId, message, subjects){
					var defferd = $q.defer();
					var url = '/student/bookTutor';
					var data ={
						"tutorId":tutorId,
					    "subjects":subjects,
					    "slotTime":slotTime,
					    "message":message
					}
					$http.post(url, data)
							.then(function(response){
								if(response){
									defferd.resolve(response);
								}
							}, function(response){
								defferd.reject(response);
							})
					return defferd.promise;
				}
			}
		}])