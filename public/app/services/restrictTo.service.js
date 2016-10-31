angular.module('mainApp')
		.service('access', ['$uibModal', function($uibModal){
			return{
				success:function(){
					 var giveAccess;
					 $uibModal.open({
		              animation: true,
		              ariaLabelledBy: 'modal-title',
		              ariaDescribedBy: 'modal-body',
		              template: '<div class="media eula-modal"><div class="media-header">' +
		              '<a class="pull-right" href="" ng-click="$dismiss()"><i class="fa fa-times"></i></a>' +
		              '<h4 class="eula-header">Please enter your access PIN</h4></div>' +
		              '<div class="media-body">'+'<input type="number" ng-model="pin" required/>'+'</div>' +
		              '<div class="media-footer">' +
		                '<span class="pull-right"><button class="btn btn-primary" ng-click="eulaAccepted()">Submit</button>' +
		                '<button class="btn btn-default" ng-click="eulaDenied()">I dont have one</button><span>' +
		              '</div>'+
		              '</div>',
		              controller:function($scope,$uibModalInstance){
		                $scope.eulaAccepted = function() {
		                    giveAccess=true;
		                }
		                $scope.eulaDenied = function() {
		                  $uibModalInstance.dismiss('cancel');
		                  alert("Please Accept Terms to Continue Login");
		                  giveAccess = false;
		                }
		              }
		            });
					return giveAccess; 
				}
			}
		}])