angular.module('dashboardApp', ['ngResource','ngCookies','ui.router','mainApp'])

angular.module('dashboardApp')
		.config(['$stateProvider','$locationProvider','$httpProvider',
			function($stateProvider,$locationProvider,$httpProvider) {
				// $stateProvider
				// .state('dashboard.student',{
				// 	url:'/dashboard/student',
				// 	templateUrl:'app/components/dashboard/student/student-dashboard.html',
				// })
				// .state('dashboard.tutor',{
				// 	url:'/dashboard/tutor',
				// 	templateUrl:'app/components/dashboard/tutor/tutor-dashboard.html',
				// })
			
		}])

angular.module('dashboardApp')
		.run(['', function(){
			
		}])