// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngOpenFB'])

    .run(function($ionicPlatform, ngFB) {

    ngFB.init({ appId: '804333932968844' })

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

    .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/menu.html",
            controller: 'AppCtrl'
        })

        .state('app.friends', {
            url: "/friends",
            views: {
                'menuContent': {
                    templateUrl: "templates/friends.html",
                    controller: 'AppCtrl'
                }
            }
        })

        .state('app.friend', {
            url: "/friend/:friendId",
            views: {
                'menuContent': {
                    templateUrl: "templates/friend.html",
                    controller: 'FriendCtrl'
                }
            }
        })

        .state('app.profile', {
            url: "/profile",
            views: {
                'menuContent': {
                    templateUrl: "templates/profile.html",
                    controller: "ProfileCtrl"
                }
            }
        });
    

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/friends');
});
