angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

    .controller('AppCtrl', function($scope, $ionicModal, $timeout, $location, ngFB) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeLogin();
        }, 1000);
    };

    $scope.fbLogin = function () {
        ngFB.login({scope: 'email'}).then(
            function (response) {
                if (response.status === 'connected') {                    
                    console.log('Facebook login succeeded', response);                    
                    window.localStorage.accessToken = response.authResponse.accessToken;                    
                    $scope.closeLogin();
                } else {
                    alert('Facebook login failed');
                }
            });
    };

    $scope.loggedUser = function(){
        if(window.localStorage.hasOwnProperty("accessToken")){
            $location.path('/app/profile');
        }else{
            alert('Not signed in!');
            $scope.login();
        }
    }
})

    .controller('SessionsCtrl', function($scope, Session) {
    $scope.sessions = Session.query();
})

    .controller('SessionCtrl', function($scope, $stateParams, Session) {
    $scope.session = Session.get({sessionId: $stateParams.sessionId});
})
    .controller('ProfileCtrl', function ($http, $scope, $location, ngFB) {        

    $scope.init = function(){

        if(window.localStorage.hasOwnProperty("accessToken")){

            $http.get("https://graph.facebook.com/v2.2/me", 
                      { params: 
                       { access_token: window.localStorage.accessToken, 
                        fields: "id,name,gender,location,website,picture,relationship_status", 
                        format: "json" 
                       }
                      })
                .then(function(result){ $scope.user = result.data }, function(error) { console.log('error'); });

        }else{
            alert('Not signed in!');
            //href="#/app/profile"
        }
    }

    $scope.fbLogout = function(){
                
        ngFB.logout();        
        $location.path('/app/sessions');
        localStorage.clear();
    }
});
