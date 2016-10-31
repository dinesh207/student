angular.module('mainApp')
		.service('tutor', ['$q','$http', function($q,$http){
			return {
				register:function(tutor){
					var defferd = $q.defer();
					var url = '/api/register/tutor';
					var data = tutor;
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
				getAvailability: function(){
					var defferd = $q.defer();
					var url = '/tutor/getAvailability';
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
				updateAvailability:function(availability){
					var defferd = $q.defer();
					var url = '/tutor/updateAvailability';
					var data = {
						"availability":availability
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
				getSchedulesToConfirm:function(){
					var defferd = $q.defer();
					var url = '/tutor/schedulesToConfirm';
					$http.get(url)
							.then(function(response){
								defferd.resolve(response);
							}, function(response){
								defferd.reject(response);
							})
					return defferd.promise;
				},
				getSchedules:function(){
					var defferd = $q.defer();
					var url = '/tutor/getUpcomingSchedules';
					$http.get(url)
							.then(function(response){
								defferd.resolve(response);
							}, function(response){
								defferd.reject(response);
							})
					return defferd.promise;
				},
				removeAvailability:function(availability){
					var defferd = $q.defer();
					var url = '/tutor/removeAvailability';
					var data = {
						"removeAvailability":{
							"available":availability,
							"isawaiting":false
						}
					}
					$http.post(url, data)
							.then(function(response){
								defferd.resolve(response);
							}, function(response){
								defferd.reject(response);
							})
					return defferd.promise;
				},
				confirmOrReject:function(id,confirm, reject,name, email){
					var defferd = $q.defer();
					var url = '/tutor/confirmBooking';
					var data = {
						'id':id,
						'confirmBooking':confirm,
						'rejectBooking':reject,
						'studentName':name,
						'studentEmail':email
					}
					$http.post(url, data)
							.then(function(response){
								defferd.resolve(response);
							}, function(response){
								defferd.reject(response);
							})
					return defferd.promise;
				}
			}
		}])