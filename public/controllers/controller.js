var market = angular.module('market', ['chart.js','ui.bootstrap'])  

market.controller('FileListController', ['$scope', '$http', function($scope, $http){
    console.log("FileListController!");
    $scope.currentDirectory = 'Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03'; //default dir
    $scope.showFilesLoading = true;
    $scope.showFileDownloading = false;
    $http.get('/ftplist?currentDirectory=' + $scope.currentDirectory).success( function(response){
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
    $scope.locationInput = "AEC";
    $scope.nodeInput = "";
    $scope.dataList = [];
    $scope.graphSelectedSeries = "ALL";
    
    $scope.labels = [" ", " "];
    
    $scope.series = ["LMP", "MLC", "MCC", "MEC"];
    $scope.data = [
        [0, 0],
        [0, 0]
    ];
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    
    //angular bootstrap
    $scope.openFrom = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedFrom = true;
    };
    $scope.openTo = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedTo = true;
    };
    
    $scope.populateGraph = function(){
        var serie = $scope.graphSelectedSeries;
        $scope.labels = [];
        var LMP = [], MLC = [], MCC = [], MEC = [];
        $scope.data = [];
        $scope.dataList.forEach(function(item){
            $scope.labels.push(item.Interval);
            LMP.push(item.LMP);
            MLC.push(item.MLC);
            MCC.push(item.MCC);
            MEC.push(item.MEC);
        });
        if(serie === "ALL" || serie === "LMP"){
            $scope.data.push(LMP);
        }
        if(serie === "ALL" || serie === "MLC"){
            $scope.data.push(MLC);
        }
        if(serie === "ALL" || serie === "MCC"){
            $scope.data.push(MCC);
        }
        if(serie === "ALL" || serie === "MEC"){
            $scope.data.push(MEC);
        }
    };

    $scope.search = function(){
        console.log("Searching ");
        $scope.dataList = []
        $scope.showSearching = true;
         $http
            .get('/search?dateFrom=' + $scope.dateFromInput + "&dateTo=" + $scope.dateToInput + "&location=" + $scope.locationInput + "&node=" + $scope.nodeInput)
            .success(function(response){
                //console.log('Search response ' + response.toString());
                $scope.showSearching = false;
                $scope.dataList = response.detail;
                //fill the graph data
                $scope.populateGraph();
            })
            .error(function(response){
                console.log('Error searching!: ' + response);
            });
        
    };
    
    $scope.filterSeries = function(serie){
        $scope.graphSelectedSeries = serie;
        $scope.populateGraph();
    };
    
    $scope.search();
}]);

