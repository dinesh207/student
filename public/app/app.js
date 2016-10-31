/**
	Created by Dinesh Reddy Gandra
*/
angular.module('mainApp', ['ngResource','ngCookies','ui.router','ui.bootstrap','ui.bootstrap.datetimepicker','ngMaterial','ngToast','angular-loading-bar'])

angular.module('mainApp')
		.config(['$stateProvider','$locationProvider','$httpProvider','ngToastProvider',
			function($stateProvider,$locationProvider,$httpProvider,ngToast) {
				// Set token in header of each http server call.
			$httpProvider.interceptors.push(function($q, $cookies) {
				return {
					'request': function(config) {
						if($cookies.getObject('session') && $cookies.getObject('session') !== ''){
							config.headers['x-access-token'] = $cookies.getObject('session').token;
						}
							config.headers['Content-Type'] = 'application/json';
						return config;
					}
				};
			});
			ngToast.configure({
		      verticalPosition: 'top',
		      horizontalPosition: 'center',
		    });
			$stateProvider
				.state('app',{
					url:'',
					templateUrl:'app/app.html',
				})
				.state('studentRegister',{
					url:'/student/register',
					templateUrl:'app/components/student/student-register.html',
					controller:'studentController'
				})
				.state('tutorRegister',{
					url:'/tutor/register',
					templateUrl:'app/components/tutor/tutor.html',
					controller:'tutorController'
				})
				.state('studentLogin',{
					url:'/student/login',
					templateUrl:'app/components/login/student-login.html',
					controller:'studentLoginController'
				})
				.state('tutorLogin',{
					url:'/tutor/login',
					templateUrl:'app/components/login/tutor-login.html',
					controller:'tutorLoginController'
				})
				.state('dashboard',{
					abstract:true,
					url:'/student',
					templateUrl:'app/components/dashboard/dashboard.html',
					controller:'dashboardController'
				})
				.state('dashboard.student',{
					url:'',
					templateUrl:'app/components/dashboard/student/student-dashboard.html',
					controller:'studentDashboardController'
				})
				.state('dashboard.studentSchedules',{
					url:'/student/schedules',
					templateUrl:'app/components/dashboard/schedules/student-schedules.html',
					controller:'studentSchedulesController'
				})
				.state('dashboardTutor',{
					abstract:true,
					url:'/tutor',
					templateUrl:'app/components/tutor-dashboard/tutor.dashboard.html',
					controller:'tutorDashboardController'
				})
				.state('dashboardTutor.tutorHome', {
					url:'',
					templateUrl:'app/components/tutor-dashboard/home/tutor.home.html',
					controller:'tutorHome'
				})
				.state('dashboardTutor.tutorSchedules', {
					url:'/schedules',
					templateUrl:'app/components/tutor-dashboard/schedules/tutor.schedules.html',
					controller:'tutorSchedulesController'
				})
		}])
angular.module('mainApp')
		.run(['$location', '$rootScope','$state','AuthService','access',
		 function($location, $rootScope,$state,AuthService,access){

			$rootScope.$state = $state;
			
			$rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams){
				var checkLogin = AuthService.isAuthenticated();
				if (toState.authenticate && !checkLogin){
					window.location.href = window.location.origin;
					event.preventDefault();
				}

			});
		}]);