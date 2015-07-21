angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

    .controller('AppCtrl', function($http, $scope, $ionicModal, $timeout, $location, $q, $ionicLoading, Friends, ngFB, $rootScope) {

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
        $scope.fbLogin();
        //// $scope.modal.show(); # not anymore
    };

    $scope.fbLogin = function () {        
        ngFB.login({scope: 'email,user_friends,publish_actions'}).then(
            function (response) {
                if (response.status === 'connected') {                
                    $ionicLoading.show({template: '<p>Adicionando amigos<p><ion-spinner></ion-spinner>'});
                    window.localStorage.accessToken = response.authResponse.accessToken;     
                    getFriendsList();
                    $scope.closeLogin();
                    
                    $scope.userLogged = true;
                    
                    console.log(response)
                } else {
                    alert('Facebook login failed');
                }
            });
    };

    var getFriendsList = function(){   

        var array = [];
        
        var f = function (next)
        { 
            $http.get(next).then(function(nextResult){

                array = array.concat(nextResult.data.data);
                
                if(nextResult.data.paging.next != null ){
                   //// f(nextResult.data.paging.next); # we don't need all friends yet..
                    
                    Friends.addAllFriends(array)
                        .then(function(){
                            console.log('finished', new Date());                                                  
                            $rootScope.$broadcast('bdPopulated');
                        });
                }else{
                
                    Friends.addAllFriends(array)
                        .then(function(){
                            console.log('finished', new Date());                                                  
                            $rootScope.$broadcast('bdPopulated');
                        });
                    
                }
            });
        }
        
        ngFB.api({path: '/me/taggable_friends' })
            .then(function(result){                  
            array = result.data;                    
            f(result.paging.next);                   
        }, function(error){ 
            console.log('error', error) 
        });       

    }    

    $scope.loggedUser = function(){
        console.log(window.localStorage.hasOwnProperty("accessToken"))
        if(!window.localStorage.hasOwnProperty("accessToken")){
            $scope.login();
        }
    }
    
     $scope.logout = function(){

        console.log('logout');
        ngFB.logout();                
        $location.path('/app');

        localStorage.clear();
        console.warn('localStorage clear');
        Friends.clearDatabase().then(function() { console.warn('BD clear'); });
        $scope.userLogged = false;
    }

})

    .controller('FriendsCtrl', function($scope, $stateParams, $ionicLoading, Friends, sharedService) {

    console.log('FriendsCtrl');

    $scope.$on('bdPopulated', function() {  
        console.log('bdPopulated');
        Friends.getTop10()
            .then(function(fs){  
                        $scope.friends = fs; 
                        console.log('Qtd ' + $scope.friends.length, new Date()); 
                        $ionicLoading.hide();      
                    });
    });

    $scope.searchKey = "";

    $scope.clearSearch = function () {
        $scope.searchKey = "";        
    }

    $scope.friendsBkp;

    $scope.search = function () {  
        console.log('searching...')
        if($scope.searchKey.length > 2){
            Friends.searchFriends($scope.searchKey)
                .then(function(fs){ 
                $scope.friendsBkp = $scope.friends;
                $scope.friends = fs 
            });            
        } 

        else{
            $scope.friends = $scope.friendsBkp;
        }
    };

    $scope.$on('$ionicView.enter', function(e) {
        if($scope.searchKey.length == 0)
            Friends.getTop10().then(function(fs){ console.log(fs); $scope.friends = fs }); 
    });
})

    .controller('FriendCtrl', function($scope, $stateParams, $rootScope, $ionicPopup, Friends) {        
    var friendId = $stateParams.friendId;    

    Friends.getFriendByID(friendId).then(function(result){ $scope.friend = result; });
    
    $scope.data = {};
    
    $scope.showDebtPopup = function() {        

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
            template: '<input type="number" step="0.01" min="0" ng-model="data.debt">',
            title: 'Quanto te deve?',
            scope: $scope,
            buttons: [
                { text: 'Cancel', 
                  onTap: function(){ myPopup.close(); }
                },
                {
                    text: '<b>Salvar</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!$scope.data.debt) {
                            //don't allow the user to close unless he enters wifi password
                            e.preventDefault();                            
                            myPopup.close();
                        } else {                                                   
                            return $scope.data.debt;
                        }                        
                    }
                },
            ]
        });
        myPopup.then(function(res) {
            var newFriend = angular.copy($scope.friend);
            newFriend.debt = res;
            
            console.log('old', $scope.friend, 'new',newFriend);
            
            Friends.updateFriend($scope.friend, newFriend)
                .then(function(){
                    Friends.getFriendByID(friendId)
                        .then(function(result){ 
                            $scope.friend = result; 
                        })
                });
        });
    };
    
    $scope.showCreditPopup = function() {
        
        $scope.data = {};

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
            template: '<input type="number" step="0.01" min="0" ng-model="data.credit">',
            title: 'Quanto vc deve?',
            scope: $scope,
            buttons: [
                { text: 'Cancel', 
                  onTap: function(){ myPopup.close(); }
                },
                {
                    text: '<b>Salvar</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!$scope.data.credit) {
                            //don't allow the user to close unless he enters wifi password
                            e.preventDefault();                            
                            myPopup.close();
                        } else {                                                   
                            return $scope.data.credit;
                        }                        
                    }
                },
            ]
        });
        myPopup.then(function(res) {
            var newFriend = angular.copy($scope.friend);
            newFriend.credit = res;
            
            console.log('old', $scope.friend, 'new',newFriend);
            
            Friends.updateFriend($scope.friend, newFriend)
                .then(function(){
                    Friends.getFriendByID(friendId)
                        .then(function(result){ 
                            $scope.friend = result; 
                        })
                });
        });
    };

    $scope.editMember = function(origFriend, editFriend) {            
        Friends.update(origFriend, editFriend);
        $rootScope.$broadcast('bdPopulated');
    };
})

    .controller('ProfileCtrl', function ($http, $scope, $location, $cordovaSQLite, ngFB, Friends) {        

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
        console.warn('localStorage clear');
        Friends.clearDatabase().then(function() { console.warn('BD clear'); });
    }
});


