var market = angular.module('market', [])

market.controller('FileListController', ['$scope', '$http', function($scope, $http){
    console.log("FileListController!");
    $scope.currentDirectory = 'Markets'; //default dir
    $scope.showFilesLoading = true;
    $scope.showFileDownloading = false;
    $http.get('/ftplist?currentDirectory=Markets').success( function(response){
        console.log('Initial File list ' + response.toString());
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
    $scope.listLoadedFiles = function(){
        console.log("Listing loaded files");
        $scope.fileLoadedList = []
        $http.get('/loadedfilelist').success( function(response){
            console.log('Files retrieved ' + response.toString());
            $scope.fileLoadedList = response;
        });
    };
    $scope.loadFile = function(fileName){
        console.log("Loading file " + fileName);
        var fullPath = $scope.currentDirectory + "/" + fileName;
        $scope.showFileDownloading = true;
        $http.post('/importfile?filePath=' + fullPath).success( function(response){
            console.log('Loaded! ' + fullPath);
            $scope.showFileDownloading = false;
            //reload files
            $scope.listLoadedFiles();
        });
    };
    
    //call the function to show loaded files
    $scope.listLoadedFiles();
    
}]);

market.controller('SearchController', ['$scope', '$http', function($scope, $http){
    console.log("SearchController!");
    $scope.showSearching = false;
    $scope.dateFromInput = "";
    $scope.dateToInput = "";
    $scope.locationInput = "";
    $scope.nodeInput = "";
    $scope.dataList = [];
    $scope.graphData = null;

    $scope.search = function(){
        console.log("Searching ");
        $scope.dataList = []
        $scope.showSearching = true;
         $http
            .get('/search', {dateFrom: $scope.dateFromInput, dateTo: $scope.dateToInput, location: $scope.locationInput, node: $scope.nodeInput})
            .success(function(response){
                console.log('Search response ' + response.toString());
                $scope.dataList = response.detail;
                $scope.graphData = response.graphData;
            })
            .error(function(response){
                console.log('Error searching!: ' + response);
            });
        
    };
}]);

