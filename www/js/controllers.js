/// <reference path="../../typings/angularjs/angular.d.ts"/>

angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

    .controller('AppCtrl', function($http, $scope, $ionicModal, $timeout, $location, $q, $ionicLoading, Friends, ngFB) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.searchKey = "";
        
    $scope.clearSearch = function () {
        $scope.searchKey = "";
        
    }
    
     $scope.search = function () {
         
         if($scope.searchKey.length > 2)
            Friends.searchFriends($scope.searchKey)
                .then(function(fs){ 
                        $scope.friends = fs 
                      });
    }

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
        ngFB.login({scope: 'email,user_friends,publish_actions'}).then(
            function (response) {
                if (response.status === 'connected') {                
                    $ionicLoading.show({template: '<p>Adicionando amigos...<p><ion-spinner></ion-spinner>'});
                    console.log('Facebook login succeeded', response);                    
                    window.localStorage.accessToken = response.authResponse.accessToken;     
                    getFriendsList();
                    $scope.closeLogin();
                } else {
                    alert('Facebook login failed');
                }
            });
    };

    var getFriendsList = function(){   

        ngFB.api({path: '/me/taggable_friends' })
            .then(function(result){ 
            //$scope.friends = result.data
            Friends.set(result.data);            
            
            getNextResult(result.paging.next);    
        }, function(error){ console.log('error', error) });       

    }

    var getNextResult = function(next){ 

        $http.get(next)
            .then(function(nextResult){

            nextResult.data.data.forEach(function(f){ Friends.add(f); });

            if (nextResult.data.paging.next){
                getNextResult(nextResult.data.paging.next);
            }else{                
               $ionicLoading.hide();                
            }

        }, function(error) { console.log(error); });

    }

    $scope.loggedUser = function(){
        if(window.localStorage.hasOwnProperty("accessToken")){
            $location.path('/app/profile');
        }else{
            $scope.login();
        }
    }
})

    .controller('FriendsCtrl', function($scope, $stateParams, Friends) {
    $scope.friends = Friends.get();
    console.log('FriendsCtrl', $scope.friends)
})
    .controller('FriendCtrl', function($scope, $stateParams, Friends) {        
    var friendId = $stateParams.friendId;    
    $scope.friend = Friends.get(friendId)[0];

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
                .then(
                function(result)
                {
                    console.log(result.data);
                    $scope.user = result.data; 
                }, 
                function(error) 
                { 
                    console.log('error'); 
                });

        }else{
            alert('Not signed in!');
            //href="#/app/profile"
        }
    }

    $scope.fbLogout = function(){

        ngFB.logout();        
        $location.path('/app');
        localStorage.clear();
    }
});


