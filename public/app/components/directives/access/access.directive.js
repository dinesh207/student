angular.module('mainApp')
        .directive('accessTo',['access','ngToast',function(access,ngToast){
          return{
            restrict:'EA',
            transclude: true,
            controller:['$scope','$state', function($scope,$state){
              $scope.reqForAccess = function(pin){
                if(pin && pin.length > 0){
                  access.reqAccess(pin)
                          .then(function(response){
                            if(response && response.data){
                              console.log(response);
                              $state.params = {
                                "pin":response.data.pinMatch
                              }
                            }
                          }, function(response){
                              $state.params = {
                                "pin":response.data.pinMatch
                              };
                              ngToast.create({
          											className: 'danger',
          											content: "<span>The pin "+pin+" you entered is not a valid. <br>If you don't have one please contact at <strong>instatutorcontact@gmail.com<strong></span>",
          											timeout:4000
          										});
                          })
                }
              }
            }],
            templateUrl:'/app/components/directives/access/access.html'
          }
        }])
