var app = angular.module('goalLateralApp', [
  'ngRoute',
  'firebase', 
  'ngMaterial',
  'omr.directives'
  ]);

app.run(function($rootScope, $location, $firebase){
      var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/');
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
        console.log($location.path() === '/' );
        if($location.path() === '/' && ref.getAuth() ){
          $location.path('/goals')
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
    when('/goals/create', {
      templateUrl: 'partials/createGoal.html',
      controller: 'createGoalController'
    }).
    when('/goals/details/:goalID', {
      templateUrl: 'partials/goalDetails.html',
      controller: 'goalController'
    }).
    otherwise({redirectTo: '/'});
}]);


app.controller('mainController', function($scope, $firebase){
  var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/goals');
  var fb = $firebase(ref);

});

app.controller('goalsController', function($scope, $firebase, $rootScope, $location, $route){
  $scope.goals = [];
  var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/');
  var userGoals = new Firebase('https://blinding-torch-8725.firebaseio.com/users/'+ref.getAuth().uid+'/goals/');
  userGoals.on('value', function(data) {
    var bunch = data.val()
    for(var goal in bunch){
      bunch[goal].key = goal;
      $scope.goals.push(bunch[goal]);
    }
    $scope.$apply();
    })

  $scope.deleteGoal = function(goal){
    var removing = new Firebase('https://blinding-torch-8725.firebaseio.com/users/'+ref.getAuth().uid+'/goals/'+goal.key);
    removing.remove();
    //$scope.$apply();
    $route.reload();

  }

  $scope.newGoal = function(){
    $location.path("/goals/create");
  }

  $scope.complete = function(goal){
    var completed = new Firebase('https://blinding-torch-8725.firebaseio.com/users/'+ref.getAuth().uid+'/goals/'+goal.key+'/complete');
    completed.set(true);
    $route.reload();
  }




});

app.controller('goalController', function($scope, $firebase){
  var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/goals');
  var fb = $firebase(ref);

});

app.controller('createGoalController', function($scope, $firebase, $location, $rootScope, $http){
  $scope.newGoal = {
    title: '',
    dueDate: '',
    dueTime: '',
    description: '',
    image: '',
    createdAt: null,
    complete: false
  }
  var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/');
  var userRef = new Firebase('https://blinding-torch-8725.firebaseio.com/users/'+ref.getAuth().uid+'/goals');

  $scope.saveGoal = function(media){
    if(!$scope.newGoal.image) return;
    $scope.newGoal.createdAt = Date.now();
    userRef.push($scope.newGoal);
          $rootScope.$apply(function() {
            console.log(ref.getAuth().facebook)
            var body = 'I did not meet my goal of: ' + newGoal
            FB.api('/me/feed', post, {message: body}, function(response){
              if(!response || response.error){
                console.log('Error', response.error)
              }else{
                console.log(response.id)
              }
            })
            $location.path("/goals");
          }); 
  };

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
                  goals: {}
                });
              console.log(err);
            })
              
          localStorage.authData = authData;

          $rootScope.$apply(function() {
            $location.path("/goals");
          });
        }
      }, {scope: "publish_actions, public_profile"});
    }


});

app.controller('menuController', function($scope, $firebase, $location, $rootScope, $route){

  var ref = new Firebase('https://blinding-torch-8725.firebaseio.com/');
  if(ref.getAuth() && ref.getAuth().facebook !== undefined){
    $scope.name = "Logout " + ref.getAuth().facebook.cachedUserProfile.first_name;
  }else{
    $scope.name = 'Login';
  }
  
  $scope.logout = function(){
    if($scope.name === 'Login'){
      $scope.login();
    }else{
      ref.unauth();
      $route.reload();
    }
  };

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
                  goals: {}
                });
              console.log(err);
            })
              
          localStorage.authData = authData;

          $rootScope.$apply(function() {
            $location.path("/goals");
            $route.reload();
          });
        }
      }, {scope: "publish_actions, public_profile"});
    }
});
