---
title: "Mengenlehreuhr med Processing.js"
layout: post
link: http://blog.kjempekjekt.com/2014/03/09/mengenlehreuhr-med-processingjs/
date: 2014-03-09T14:07:05.949Z
tags:
  - JavaScript
---

På [Bergen CodingDojo i januar i år](http://blog.kjempekjekt.com/2014/01/09/codingdojo-mengenlehreuhr/) implementerte jeg en litt spesiell klokke - [en Mengenlehreuhr](http://en.wikipedia.org/wiki/Mengenlehreuhr) - sammen med Stian. Vi brukte **[Quil](https://github.com/quil/quil)**, som er et processing-biblotek for Clojure.

Nå har jeg forsøkt meg litt på processing i JavaScript også - med [Processing.js](http://processingjs.org/). Og hvis alt fungerer som tiltenkt skal du kunne se den samme klokken *live* nedenfor (...hvis du leser dette i RSS-feeden må du nok klikke deg inn på bloggen).

<p class="text-center"><canvas id="canvas1" width="100" height="100"></canvas></p>

Jeg har plassert viserne til en vanlig klokke oppå Mengenlehre-klokken, slik at det går an å resonere seg frem til hvordan den virker.

Å programmere dette i JavaScript var ikke noe problem, og Processing.js er nok dermed noe jeg kommer til å eksperimentere mer med. Er du interessert i å se hva som skulle til for å lage klokken er det bare å velge *"view source"* på bloggposten.

Kanskje jeg skal forsøke meg på et spill neste gang?! Noen som har en ide til hva jeg kan lage kanskje?

<script src="/assets/js/processing-1.4.1.min.js"></script>
<script id="script1" type="text/javascript">

var bulbs = {
  redOn: [255, 5, 5],
  redOff: [97, 29, 29],
  yellowOn: [252, 252, 3],
  yellowOff: [97, 90, 13]
};

function getLampSeconds(now) {
  return now.getSeconds() % 2 == 0
    ? bulbs.yellowOff
    : bulbs.yellowOn;
}

function quot(a, b) {
  return Math.floor(a / b);
}

function rem(a, b) {
  return a % b;
}

function fRed() { return 'red'; }
function fYellow() { return 'yellow'; }
function fYellowRed(i) { return i % 3 == 0 ? 'red' : 'yellow'; }

function getLampHours(now, timeFunc, part, lampCount, color) {
  var onCount = part(now[timeFunc](), 5),
      result = [];
  for(var i=0; i<lampCount; i++) {
    result.push(bulbs[color(i+1) + (i < onCount ? 'On' : 'Off')]);
  }
  return result;
}

// Simple way to attach js code to the canvas is by using a function
function sketchProc(processing) {

  var setColor = function (f, color) {
    f(color[0], color[1], color[2]);
  };

  processing.size(430, 480);
  processing.frameRate(10);

  processing.draw = function() {
    var centerX = processing.width / 2, centerY = processing.height / 2;
    var maxArmLength = Math.min(centerX, centerY);

    function drawLampSeconds(color){
      setColor(processing.fill, color);
      processing.ellipse(213, 70, 100, 100);
    }

    function drawSquareLamp(color, x, y, width) {
      setColor(processing.fill, color);
      processing.rect(x, y, width, 60); 
    }

    function drawLampSequence(colors, yOffset, lampOffset, width, margin) {
      for(var i in colors) {
        drawSquareLamp(colors[i], lampOffset + ((width+margin)*(i)), yOffset, width);
      }
    }

    function drawArm(position, lengthScale, weight) {      
      processing.stroke(0);
      processing.strokeWeight(weight);
      processing.line(centerX, centerY, 
        centerX + Math.sin(position * 2 * Math.PI) * lengthScale * maxArmLength,
        centerY - Math.cos(position * 2 * Math.PI) * lengthScale * maxArmLength);
    }

    processing.background(255);
    processing.strokeWeight(1);
    processing.stroke(0);

    var now = new Date();
    drawLampSeconds(getLampSeconds(now));
    drawLampSequence(getLampHours(now, "getHours", quot, 4, fRed), 135, 5, 100, 5);
    drawLampSequence(getLampHours(now, "getHours", rem, 4, fRed), 210, 5, 100, 5);
    drawLampSequence(getLampHours(now, "getMinutes", quot, 11, fYellowRed), 285, 6, 33, 5);
    drawLampSequence(getLampHours(now, "getMinutes", rem, 4, fYellow), 360, 5, 100, 5);

    // Moving hours arm by small increments
    var hoursPosition = (now.getHours() % 12 + now.getMinutes() / 60) / 12;
    drawArm(hoursPosition, 0.5, 5);

    // Moving minutes arm by small increments
    var minutesPosition = (now.getMinutes() + now.getSeconds() / 60) / 60;
    drawArm(minutesPosition, 0.80, 3);

    // Moving hour arm by second increments
    var secondsPosition = now.getSeconds() / 60;
    drawArm(secondsPosition, 0.90, 1);
  };
  
}

var canvas = document.getElementById("canvas1");
// attaching the sketchProc function to the canvas
var p = new Processing(canvas, sketchProc);
// p.exit(); to detach it
</script>