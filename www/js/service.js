angular.module('starter.services', ['ngResource'])

    .factory('Friends', function($q, $timeout){ 
    var friends = [];
    function set(data) {
        friends = data;
    }
    
    function getAll() {
        console.log('getAll');
        return friends;
    }
    
    function get(id){       
        
        var result = friends.filter(function(f){ return f.id == id });        
        console.log(result);        
        return result
    }
    
    function add(f){
        friends.push(f);      
    }
    
    var searchFriends = function(searchFilter) {
         
        //console.log('Searching friends for ' + searchFilter);

        var deferred = $q.defer();

	    var matches = friends.filter( function(friend) {
	    	if(friend.name.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 ) return true;
	    })

        $timeout( function(){
        
           deferred.resolve( matches );

        }, 500);

        return deferred.promise;

    };
    
    return {
        set: set,
        getAll: getAll,
        get: get,
        searchFriends: searchFriends,
        add: add
    }

}) ;