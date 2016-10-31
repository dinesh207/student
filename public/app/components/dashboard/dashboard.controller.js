angular.module('mainApp')
		.controller('dashboardController', ['$scope','$state','AuthService','$cookies', 
			function($scope,$state,AuthService,$cookies){

				$scope.displayName = AuthService.getNameToDisplay()

				// Logout
				$scope.logout=function(){
			              $cookies.remove("session");
			              window.location.href="/";
		      	}
			
				$scope.oldPasswordCheck=false;
				$scope.violationCheck;
			    $scope.passCheck = function(value){
			        var element = $('#newPassword1');
			        if(value){
			          if(value.match(/[a-z]/) && (value.match(/[A-Z]/) || value.match(/\d/)) && value.length>=8){
			            element.removeClass('error').addClass('validClass');
			            $scope.violationCheck = false;
			          }else{
			            element.removeClass('validClass').addClass('error');
			            $scope.violationCheck = true;
			        }
			        }else {
			        		element.removeClass('validClass');
			        }
			    }
			    $scope.$watch('newpass2', function(newValue, oldValue) {
			        if(newValue && newValue!=null && $scope.newpass1!=null){
			          $scope.pwcheck = newValue === $scope.newpass1;
			          $scope.changePasswordForm.$setValidity('pwmatch', $scope.pwcheck);
			          if($scope.pwcheck){
				          $('#newPassword2').removeClass('error').addClass('validClass');
				        }else{
				          $('#newPassword2').addClass('error').removeClass('validClass');
				        }
			        }else{
			          $('#newPassword2').removeClass('validClass error');
			          $scope.changePasswordForm.$setValidity('pwmatch', true);
			        }
			    });
		      	$scope.changePassword=function(){
		              if(($scope.newpass1==null)|| ($scope.newpass2==null) || ($scope.oldpass==null)){
		                $('#oldPassword').addClass('error');
		                $('#newPassword1').addClass('error');
		                $('#newPassword2').addClass('error');
		                return;
		              }
		              else if (!$scope.violationCheck==true) {
		              		var url = "/student/changePassword";
		                    AuthService.updatePassword(url,$scope.oldpass, $scope.newpass1).
		                            then(function(data){
										$('#changePassword').modal('hide');
										alert("Please login with new password");
										$scope.logout();
										$scope.clearFields();
		                            },function(data){
		                              console.log(data);
		                              $scope.oldPasswordCheck=true;
		                              $('#oldPassword').removeClass('validClass').addClass('error');
		                            })
		                  }
		      	};
				$scope.clearFields=function(){
					$scope.newpass1="";
					$scope.newpass2="";
					$scope.oldpass="";
					$scope.violationCheck=false;
					$scope.oldPasswordCheck=false;
					$('#newPassword1').removeClass('validClass').removeClass('error');
					$('#oldPassword').removeClass('validClass').removeClass('error');
				}
				
		}])

