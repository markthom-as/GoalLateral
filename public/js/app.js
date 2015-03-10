var app = angular.module('goalLateralApp', [
  'ngRoute',
  'firebase', 
  'ngMaterial'
  ]);

app.run(function($rootScope, $location, $firebase){
      var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/');
      var usersRef = ref.child("users");
      var pubRoutes = ['/'];
      var routeClean = function (route) {
        return _.find(pubRoutes,
          function (noAuthRoute) {
            return s.startsWith(route, noAuthRoute);
        });
      }
      $rootScope.$on('$routeChangeStart', function (event, next, current) {
        // if (!routeClean($location.url()) && !ref.getAuth()) {
        //   $location.path('/');
        // }
        if ($location.path !== '/' && !ref.getAuth()) {
          $location.path('/');
        }
      });  
  });

app.config(['$routeProvider', function($routeProvider){
  $routeProvider.
    when('/', {
      templateUrl: 'partials/welcome.html',
      controller: 'mainController'
    }).
    when('/goals', {
      templateUrl: 'partials/goals.html',
      controller: 'goalsController'
    }).
    when('/goals/:goalID', {
      templateUrl: 'partials/goalDetails.html',
      controller: 'goalController'
    }).
    when('/goals/create', {
      templateUrl: 'partials/createGoal.html',
      controller: 'createGoalController'
    }).
    otherwise({redirectTo: '/'});
}]);


app.controller('mainController', function($scope, $firebase){
  var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/goals');
  var fb = $firebase(ref);

});

app.controller('goalsController', function($scope, $firebase){
  var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/goals');
  var fb = $firebase(ref);

});

app.controller('goalController', function($scope, $firebase){
  var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/goals');
  var fb = $firebase(ref);

});

app.controller('createGoalController', function($scope, $firebase){
  var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/goals');
  var fb = $firebase(ref);

});

app.controller('authCtrl', function($scope, $firebase, $location, $rootScope) {
  var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/');
  usersRef = new Firebase('https://blinding-torch-8725.firebaseio.com/users');
  $scope.login = function(){
      ref.authWithOAuthPopup("facebook", function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log("Authenticated successfully with payload:", authData);
            var user = new Firebase('https://blinding-torch-8725.firebaseio.com/users/' + authData.uid)
            user.once('value', function(snap){
              console.log('User Found');
            }, function(err){
                usersRef.child(authData.uid).set({
                  goals: 0
                });
              console.log(err);
            })
              


          $rootScope.$apply(function() {
            $location.path("/goals");
          });
        }
      }, {scope: "publish_actions, public_profile"});
    }


});
