---
title: "HTML canvas med Paper.js"
layout: post
link: http://blog.kjempekjekt.com/2014/05/09/html-canvas-paperjs/
date: 2014-05-09T13:38:37.179Z
tags:
  - JavaScript
---
I dag har jeg eksperimentert litt med [Paper.js](http://paperjs.org/), et open source biblotek for vektorgrafikk som bruker HTML5 Canvas. I forhold til processing.js ([som jeg har prøvd tidligere](http://blog.kjempekjekt.com/2014/03/09/mengenlehreuhr-med-processingjs/)) så tilbyr Paper.js et mere objektorientert API, og det virker som om det er enklere å lage ting hvor du har elementer som interakterer med hverandre og brukeren.

En av tingene jeg gjorde i dag var å implementere Conway's Game of Life ([noe jeg også har gjort før](http://blog.kjempekjekt.com/2012/01/18/conways-game-of-life/)). Og her er det:

<canvas id="conways" width="500" height="500" style="margin-bottom:20px;"></canvas>

Ta en titt på kilden til denne siden om du vil se hva som skulle til for å lage dette.

<script src="/assets/js/paper-full.js" type="text/javascript"></script>
<script type="text/paperscript" canvas="conways">
var DIMX = 50;
var DIMY = 50;
var CELLSIZE = 8;
var trottleBreak = 0;

var cells = [];
var nextGeneration = [];

for (var y = 0; y < DIMY; y++) {
  cells[y] = [];
  nextGeneration[y] = [];
  
  for (var x = 0; x < DIMY; x++) {
    var cell = Path.Rectangle({
      size: [CELLSIZE, CELLSIZE],
      point: [(CELLSIZE+1)*x, (CELLSIZE+1)*y],
      fillColor: "black",
      visible: (Math.random()*2 > 1),
    });
    cells[y][x] = cell;
  }
}

function getOneForActive(x, y) {
  x = x < 0 ? DIMX - 1 : x;
  y = y < 0 ? DIMY - 1 : y;
  x = x >= DIMX ? 0 : x;
  y = y >= DIMY ? 0 : y;
  return cells[y][x].visible ? 1 : 0;
}

function newStateFor(x, y) {
  var thisState = cells[y][x].visible;
  var neighboursCount = 
    getOneForActive(x, y+1) +
    getOneForActive(x, y-1) +
    getOneForActive(x+1, y+1) +
    getOneForActive(x+1, y) +
    getOneForActive(x+1, y-1) +
    getOneForActive(x-1, y+1) +
    getOneForActive(x-1, y) +
    getOneForActive(x-1, y-1);
  
  if (thisState == false)
    if  (neighboursCount == 3)
      return true;
    else
      return false;
  
  if (neighboursCount < 2) return false;
  if (neighboursCount == 2 || neighboursCount == 3) return true;
  return false;
}

function onFrame(event) {
  
  if (trottleBreak < 4) {
    trottleBreak++;
    return
  }
  trottleBreak = 0;
  
  for (var y = 0; y < DIMY; y++) {
    for (var x = 0; x < DIMY; x++) {
      nextGeneration[y][x] = newStateFor(x, y);
    }
  }
  for (y = 0; y < DIMY; y++) {
    for (x = 0; x < DIMY; x++) {
      cells[y][x].visible = nextGeneration[y][x];
    }
  }
}

</script>