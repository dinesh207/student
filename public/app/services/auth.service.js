angular.module('mainApp')
		.service('AuthService', ['$cookies','$http','$q','$rootScope', function($cookies,$http,$q,$rootScope){
			return{
				login:function(url, data){
					var deferred = $q.defer();
					var url = url;
					var data = data;
					$http.post(url, data)
							.then(function(response){
								deferred.resolve(response);
							}, function(response){
								deferred.reject(response);
							});
					return deferred.promise;
				},
				isAuthenticated:function(){
					var authenticate;
					if($cookies.getObject('session') && $cookies.getObject('session') !== ''){
						var session = $cookies.getObject('session');
						if(session.token && session.token != null){
			                	authenticate = true;
				        }else{
				                authenticate = false;
				        }
		        	}
	                return authenticate;
				},
				updatePassword:function(url,oldPassword,newPassword){
					var deferred = $q.defer();
					var url = url;
					var data={
						"oldPassword":oldPassword,
						"newPassword":newPassword
					};
					$http.post(url, data)
							.then(function(response){
								deferred.resolve(response);
							},function(response){
								deferred.reject(response);
							});
					return deferred.promise;
				},
				getLogin:function(){
					return $cookies.getObject('session');
				},
				getNameToDisplay:function(){
					var name = $cookies.getObject('session');
					if(name && name.displayName && name.displayName !== ''){
						return name.displayName;
					}
					else {
						return name.username;
					}
					return "";
				}
			}

		}])
