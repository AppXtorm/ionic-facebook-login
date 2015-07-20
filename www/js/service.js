angular.module('starter.services', ['ngResource'])

    .factory('Friends', function($q, $timeout, $cordovaSQLite, DBA){ 

    function addFriend(friend){               
        var parameters = [friend.id, friend.name, friend.picture.data.url];
        return DBA.query("INSERT INTO friend (id, name, picture, debt, credit) VALUES (?,?,?, 0, 0)", parameters);
    }
    
    function addAllFriends(friends){     
        
        var defer = $q.defer();
        var promises = [];
        
        function f(friend){
            addFriend(friend);
        }
        
        friends.forEach(function(friend){            
            promises.push(f(friend));
        });
        
        $q.all(promises).then(function(){ defer.resolve(); });
        
        return defer.promise;
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
    
    // change for most debts    
    function getTop10(){
        return DBA.query("SELECT * FROM friend order by debt desc LIMIT 10")
            .then(function(result){
            return DBA.getAll(result);
        });
    }

    function updateFriend(oldFriend, newFriend) {
        var parameters = [ newFriend.debt, newFriend.credit, oldFriend.id];
        return DBA.query("UPDATE friend SET debt = (?), credit = (?) WHERE id = (?)", parameters);
    }

    var searchFriends = function(searchFilter) {

        var deferred = $q.defer();

        var param = ['%' + searchFilter + '%'];

        var matches = DBA.query("SELECT * FROM friend WHERE name like (?) LIMIT 20", param)
        .then(function(result) {
            return DBA.getAll(result);
        }, function(error){ alert(error) });

        $timeout( function(){
            deferred.resolve( matches );
        }, 500);        

        return deferred.promise;

    };

    var clearDatabase = function(){
        return DBA.query("DELETE FROM friend");
    }

    return {
        getAllFriends : getAllFriends,
        searchFriends : searchFriends,
        updateFriend  : updateFriend,
        getFriendByID : getFriendByID,
        clearDatabase : clearDatabase,
        getTop10      : getTop10,
        addFriend     : addFriend,
        addAllFriends : addAllFriends
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
}) 

    .factory('sharedService', function($rootScope) {
        var sharedService = {};

        sharedService.message = '';

        sharedService.prepForBroadcast = function(msg) {
            this.message = msg;
            this.broadcastItem();
        };

        sharedService.broadcastItem = function() {
            $rootScope.$broadcast('handleBroadcast');
        };

        return sharedService;
});
