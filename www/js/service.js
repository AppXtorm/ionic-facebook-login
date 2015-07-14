angular.module('starter.services', ['ngResource'])

    .factory('Session', function ($resource) {
    return $resource('http://10.10.15.67:5000/sessions/:sessionId');
})

    .factory('Friends', function(){ 
    var friend = [];
    function set(data) {
        friend = data;
        console.log('friends setted');
    }
    function get() {
        console.log('friends requested');
        return friend;
    }
    function get(id){
        var result = friend.filter(function(f){ return f.id == id });
        
        console.log(result);
        
        return result
    }
    
    return {
        set: set,
        get: get
    }

}) ;