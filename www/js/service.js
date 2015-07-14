angular.module('starter.services', ['ngResource'])

.factory('Session', function ($resource) {
    return $resource('http://10.10.15.67:5000/sessions/:sessionId');
});