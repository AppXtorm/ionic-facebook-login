angular.module('starter.services', ['ngResource'])

    .factory('Friends', function($q, $timeout, $cordovaSQLite, DBA){ 
    
    function addFriend(friend){        
        var parameters = [friend.id, friend.name, friend.picture.data.url];
        return DBA.query("INSERT INTO friend (id, name, picture) VALUES (?,?,?)", parameters);
    }
    
    function getFriendByID(id){                     
        return DBA.query("SELECT * FROM friend WHERE id = (?)", [id])
                            .then(function(result) {
                                return DBA.getById(result);
                            }); 
    }

    function getAllFriends(){
        return DBA.query("SELECT * FROM friend")
                            .then(function(result){
                                return DBA.getAll(result);
                            });
    }

    var searchFriends = function(searchFilter) {

        var deferred = $q.defer();

        var param = ['%' + searchFilter + '%'];

        var matches = DBA.query("SELECT * FROM friend WHERE name like (?)", param)
                            .then(function(result) {
                                return DBA.getAll(result);
                            });
        
        $timeout( function(){
            deferred.resolve( matches );
        }, 500);        

        return deferred.promise;

    };
    
    var clearDatabase = function(){
        return DBA.query("DELETE FROM friend");
    }

    return {
        getAllFriends: getAllFriends,
        searchFriends: searchFriends,
        getFriendByID: getFriendByID,
        clearDatabase: clearDatabase,
        addFriend: addFriend
    }

})

    .factory('DBA', function($cordovaSQLite, $q, $ionicPlatform) {
    var self = this;

    // Handle query's and potential errors
    self.query = function (query, parameters) {
        parameters = parameters || [];
        var q = $q.defer();

        $ionicPlatform.ready(function () {
            $cordovaSQLite.execute(db, query, parameters)
                .then(function (result) {
                q.resolve(result);
            }, function (error) {
                console.warn('I found an error');
                console.warn(error);
                q.reject(error);
            });
        });
        return q.promise;
    }

    // Proces a result set
    self.getAll = function(result) {
        var output = [];

        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }
        return output;
    }

    // Proces a single result
    self.getById = function(result) {
        var output = null;
        output = angular.copy(result.rows.item(0));
        return output;
    }

    return self;
}) ;