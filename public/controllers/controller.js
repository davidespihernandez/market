var market = angular.module('market', [])
market.controller('IndexController', ['$scope', '$http', function($scope, $http){
    console.log("Hello from controller!");
    
    $http.get('/dayslist').success( function(response){
        console.log('Got the data requested');
        $scope.daysList = response;
    });
    
}]);