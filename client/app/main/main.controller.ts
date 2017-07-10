'use strict';

(function() {

class MainController {

  constructor($http, $scope, socket, Auth, $state, $interval, $window) {
    this.$http = $http;
    this.socket = socket;
    $scope.mapcells = [];
    this.Auth = Auth;
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = {};
    this.errors = {};
    this.submitted = false;
    this.$state = $state;
    this.reloadRoute = function() {
       $window.location.reload();
    }
    function refreshUser(){
      this.isLoggedIn = Auth.isLoggedIn;
      this.isAdmin = Auth.isAdmin;
      this.getCurrentUser = Auth.getCurrentUser;    
      deltaX = this.getCurrentUser().mapdeltax;
      deltaY = this.getCurrentUser().mapdeltay;
      playerid = this.getCurrentUser()._id;
      color = this.getCurrentUser().color;
      if(color!=undefined){
        rangeStyle = 'rgba'+color.slice(3, color.length - 1)+', 0.5)';
      }
      $scope.zoomToShow = size;
      $scope.rangeToShow = range;
      $scope.amountToShow = fillamount;
      console.log(deltaX,deltaY, color);
    }

    $scope.$on('$destroy', function() {
      //socket.unsyncUpdates('thing');
    });

    var playerid = this.getCurrentUser()._id;
    // block size
    var size = this.getCurrentUser().size;

    var range = this.getCurrentUser().range;
    var fillamount = this.getCurrentUser().fillamount;
    var color = this.getCurrentUser().color;
    var rangeStyle = this.getCurrentUser().color;
    if(color!=undefined){
      rangeStyle = 'rgba'+color.slice(3, color.length - 1)+', 0.5)';
    }
    
    // map variables
    if(this.getCurrentUser().mapdeltax!=undefined&&this.getCurrentUser().mapdeltay!=undefined){
      var deltaX = this.getCurrentUser().mapdeltax;
      var deltaY = this.getCurrentUser().mapdeltay;
    }else{
      var deltaX = 0;
      var deltaY = 0;
    }
    
    console.log(deltaX,deltaY, color);
    this.incSize = function(){
      size = size + 10;
      w = ~~ (canvas.width / size);
      h = ~~ (canvas.height / size);
      $scope.zoomToShow = size;
    }

    this.decSize = function(){
      if(size>10){
        size = size - 10;
        w = ~~ (canvas.width / size);
        h = ~~ (canvas.height / size);
        $scope.zoomToShow = size;
      }
    }

    this.incRange = function(){
      range = range + 2;
      $scope.rangeToShow = range;
    }

    this.decRange = function(){
      if(range>2){
        range = range - 2;
        $scope.rangeToShow = range;
      }
    }

    this.incAmount = function(){
      fillamount = fillamount + 5;
      $scope.amountToShow = fillamount;
    }

    this.decAmount = function(){
      if(fillamount>5){
        fillamount = fillamount - 5;
        $scope.amountToShow = fillamount;
      }
    }

    this.incDeltaX = function(){
      deltaX = deltaX + 1;
      console.log(deltaX);
    }

    this.decDeltaX = function(){
      if(deltaX>0){
        deltaX = deltaX - 1;
      }
      console.log(deltaX);
    }

    this.incDeltaY = function(){
      deltaY = deltaY + 1;
      console.log(deltaY);
    }

    this.decDeltaY = function(){
      if(deltaY>0){
        deltaY = deltaY - 1;
      }
      console.log(deltaY);
    }

    $scope.zoomToShow = size;
    $scope.rangeToShow = range;
    $scope.amountToShow = fillamount;

    // get some info about the canvas
    var canvas = document.getElementById('c');
    var ctx = canvas.getContext('2d');
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    // how many cells fit on the canvas
    var w = ~~ (canvas.width / size);
    var h = ~~ (canvas.height / size);

    console.log(w,h);

    // create empty state array
    var state = new Array(h);
    for (var y = 0; y < h; ++y) {
        state[y] = new Array(w);
    }

    // quick fill function to save repeating myself later
    function fill(s, gx, gy) {
      ctx.fillStyle = s;
      ctx.fillRect((gx * size) - (deltaX * size), (gy * size) - (deltaY * size), size, size);
    }

    function frame(s, gx, gy) {
      ctx.strokeStyle = s;
      ctx.rect((gx * size) - (deltaX * size), (gy * size) - (deltaY * size), size, size);
      ctx.stroke();
    }

    function drawRange(){
      if(click!=0){
        //console.log(rangeStyle);
        ctx.fillStyle = rangeStyle;
        ctx.fillRect(posSelect.x * size - (((range+deltaX*4) * size)/2) + size/2, posSelect.y * size - (((range+deltaY*4) * size)/2) + size/2, range * size, range * size);
        ctx.strokeStyle = color;
        ctx.lineWidth = size/5;
        ctx.rect(posSelect.x * size - (((range+deltaX*4) * size)/2) + size/2, posSelect.y * size - (((range+deltaY*4) * size)/2) + size/2, range * size, range * size);
        ctx.stroke();
      }
    }

   // $interval(refreshCanvas, 500);

    function drawCell(x, y, players, sum){
      //zmienna do przesuneicia
      var sumRatio = 0;
      for(var key in players){
        if(players[key].amount>0){
          ctx.fillStyle = players[key].color;
          var ratio = players[key].amount / sum;
          console.log(Math.round((x * size) - (deltaX*2 * size)), Math.round((y * size) - (deltaY*2 * size) + (sumRatio * size)), Math.round(size), Math.round(size * ratio));
          //console.log(players[key].playerid, players[key].color, x, y, Math.round(size), Math.round(size * ratio), ratio, '/', sum);
          var sizeY = Math.round(size * ratio);
          if(sizeY>size||sizeY==Number.POSITIVE_INFINITY){
            sizeY=size;
          }
          if(sizeY<0||sizeY==Number.NEGATIVE_INFINITY){
            sizeY=0;
          }

          var posY = Math.round((y * size) - (deltaY*2 * size) + (sumRatio * size));
          console.log('CHECK THIS', ((sumRatio * size)+sizeY),sizeY,size);
          if(((sumRatio * size)+sizeY)>size){
            //ctx.fillStyle = 'rgba'+color.slice(3, color.length - 1)+', 0.4)';
            //posY = Math.round((y * size) - (deltaY*2 * size));
            //sumRatio = 0;
          }

          ctx.fillRect(Math.round((x * size) - (deltaX*2 * size)), posY, Math.round(size), sizeY);
          sumRatio = sumRatio + ratio;
        }
        
        //console.log(key, sumRatio, ratio, sum, size, players[key]);
      }
    }

    function getMap(){
      console.log(playerid, size, Auth.isLoggedIn());
      if(playerid==undefined||size==undefined){
        deltaX = Auth.getCurrentUser().mapdeltax;
        deltaY = Auth.getCurrentUser().mapdeltay;
        playerid = Auth.getCurrentUser()._id;
        color = Auth.getCurrentUser().color;
        size = Auth.getCurrentUser().size;
        range = Auth.getCurrentUser().range;
        fillamount = Auth.getCurrentUser().fillamount;
        if(color!=undefined){
          rangeStyle = 'rgba'+color.slice(3, color.length - 1)+', 0.5)';
        }
        $scope.zoomToShow = size;
        $scope.rangeToShow = range;
        $scope.amountToShow = fillamount;
      }
      if(Auth.isLoggedIn()==true&&playerid!=undefined&&size!=undefined){
        $http.post('/api/maps', {'deltaX': deltaX, 'deltaY': deltaY, 'resX': w, 'resY': h, 'playerid': playerid}).then(response => {
          //console.log(response.data);
          $scope.mapcells = {};
          $scope.mapcells = response.data;
          //this.socket.syncUpdates('map', $scope.mapcells);
          ctx.canvas.width  = window.innerWidth;
          ctx.canvas.height = window.innerHeight;
          w = ~~ (canvas.width / size);
          h = ~~ (canvas.height / size);

          console.log($scope.mapcells);
          for (var key in $scope.mapcells){
            //console.log(key, 'x:', $scope.mapcells[key].x, 'y:', $scope.mapcells[key].y);
            var sumAmount = 0;
            for (var playerKey in $scope.mapcells[key].players){
              //console.log(key, playerKey, $scope.mapcells[key].players.length, $scope.mapcells[key].players[playerKey].playerid, $scope.mapcells[key].players[playerKey].amount, $scope.mapcells[key].players[playerKey].color);
              sumAmount = parseInt(sumAmount) + parseInt($scope.mapcells[key].players[playerKey].amount);
              if(playerKey>=($scope.mapcells[key].players.length-1)){
                //console.log($scope.mapcells[key].x,$scope.mapcells[key].y,deltaX,deltaY);
                drawCell($scope.mapcells[key].x, $scope.mapcells[key].y, $scope.mapcells[key].players, sumAmount);
              }
            }
          }
        drawRange();
        });
      }
      
    }

    $interval(getMap, 200);

    var click = 0;
    var posEnd = {
      x: 0,
      y: 0
    }
    var posSelect = {
      x: 0,
      y: 0
    }
    // click event, using jQuery for cross-browser convenience
    jQuery(canvas).click(function(e) {
        click++;
        click=click%2;
        
        // get mouse click position
        var mx = e.offsetX;
        var my = e.offsetY;

        // calculate grid square numbers
        var gx = ~~ (mx / size) + deltaX;
        var gy = ~~ (my / size) + deltaY;
        
        // make sure we're in bounds
        if (gx < 0 || gx >= w  + deltaX || gy < 0 || gy >= h + deltaY) {
            return;
        }
        console.log(gx,gy);
        if(click==0){
          fill(rangeStyle, gx, gy);
          frame(color, gx, gy);

          //console.log("send");
          posEnd.x=gx+deltaX;
          posEnd.y=gy+deltaY;
          console.log('playerid', Auth.getCurrentUser()._id, '\n', 'posSelect', posSelect, '\n', 'posEnd', posEnd, '\n',  'range', range, '\n', 'fillamount', fillamount, '\n',  'deltaX', deltaX, '\n', 'deltaY', deltaY, '\n', 'resX', w, '\n', 'resY', h, '\n', 'size', size, '\n', 'color', color);
          
          if(playerid!=undefined){
            $http.post('/api/things', {'playerid': playerid, 'posSelect': posSelect, 'posEnd': posEnd, 'range': range, 'fillamount': fillamount, 'deltaX': deltaX, 'deltaY': deltaY, 'resX': w, 'resY': h, 'size': size, 'color': color});
          }
        }else{
          console.log("select");
          posSelect.x=gx+deltaX;
          posSelect.y=gy+deltaY;
        }
    });

    $scope.exitfullscreen = function(){
      screenfull.exit();
    }

    document.getElementById('fullscreen').addEventListener('click', function() {
      if (screenfull.enabled) {
          screenfull.request();
      } else {
          screenfull.toggle();
      }
    });
  }

  login(form) {
    this.submitted = true;

    if (form.$valid) {
      this.Auth.login({
        email: this.user.email,
        password: this.user.password
      })
      .then(() => {
        // Logged in, redirect to home
        //this.$state.go('main');
        this.reloadRoute();
        //this.refreshUser();
        /*
        this.$http.get('/api/things').then(response => {
          $scope.mapcells = response.data;
          this.socket.syncUpdates('map', $scope.mapcells);
        });
        */
      })
      .catch(err => {
        this.errors.other = err.message;
      });
    }
  }

  $onInit() {
    //this.socket.syncUpdates('map', $scope.mapcells);
    /*
    if(this.isLoggedIn()){
      this.$http.get('/api/things').then(response => {
        $scope.mapcells = response.data;
        this.socket.syncUpdates('map', $scope.mapcells);
      });
    }
    */
  }

  incSize(){
    this.incSize();
  }

  decSize(){
    this.decSize();
  }
  incRange(){
    this.incRange();
  }

  decRange(){
    this.decRange();
  }
  incAmount(){
    this.incAmount();
  }

  decAmount(){
    this.decAmount();
  }

  incDeltaX(){
    this.incDeltaX();
  }

  decDeltaX(){
    this.decDeltaX();
  }

  incDeltaY(){
    this.incDeltaY();
  }

  decDeltaY(){
    this.decDeltaY();
  }
}

angular.module('tapticApp')
  .component('main', {
    templateUrl: 'app/main/main.html',
    controller: MainController
  });

})();
