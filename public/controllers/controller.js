var market = angular.module('market', [])

market.controller('FileListController', ['$scope', '$http', function($scope, $http){
    console.log("FileListController!");
    $scope.currentDirectory = 'Markets'; //default dir
    $scope.showFilesLoading = true;
    $scope.showFileDownloading = false;
    $http.get('/ftplist?currentDirectory=Markets').success( function(response){
        console.log('File list ' + response.toString());
        $scope.fileList = response;
        $scope.showFilesLoading = false;
    });
    $scope.listDir = function(dirName){
        console.log("Loading dir " + dirName);
        $scope.currentDirectory = $scope.currentDirectory + "/" + dirName;
        $scope.fileList = []
        $scope.showFilesLoading = true;
        $http.get('/ftplist?currentDirectory=' + $scope.currentDirectory).success( function(response){
            console.log('Load dir ' + response.toString());
            $scope.fileList = response;
            $scope.showFilesLoading = false;
        });
    };
    $scope.listPreviousDir = function(){
        $scope.currentDirectory = $scope.currentDirectory.substring(0, $scope.currentDirectory.lastIndexOf("/"));
        console.log("Previous dir " + $scope.currentDirectory);
        $scope.fileList = []
        $scope.showFilesLoading = true;
        $http.get('/ftplist?currentDirectory=' + $scope.currentDirectory).success( function(response){
            console.log('Load dir ' + response.toString());
            $scope.fileList = response;
            $scope.showFilesLoading = false;
        });
    };
    $scope.loadFile = function(fileName){
        console.log("Loading file " + fileName);
        var fullPath = $scope.currentDirectory + "/" + fileName;
        $scope.showFileDownloading = true;
        $http.post('/importfile?filePath=' + fullPath).success( function(response){
            console.log('Loaded! ' + fullPath);
            $scope.showFileDownloading = false;
        });
    };
        
}]);

market.controller('LoadedListController', ['$scope', '$http', function($scope, $http){
    console.log("LoadedListController!");
//    $http.get('/ftplist?currentDirectory=Markets').success( function(response){
//        console.log('File list ' + response);
//        $scope.fileList = response;
//    });
    $scope.fileList = [{name: 'File1', rows:10000}, {name: 'File2', rows:12000}];
}]);
