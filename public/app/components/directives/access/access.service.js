angular.module('mainApp')
        .service('access', ['$http','$q',function($http, $q){
          return{
            reqAccess:function(pin){
              var deffered = $q.defer();
              var url = '/verify/accessPIN/'+pin;
              $http.get(url)
                    .then(function(response){
                      deffered.resolve(response);
                    }, function(error){
                      deffered.reject(error);
                    })
              return deffered.promise;
            }
          }
        }])
