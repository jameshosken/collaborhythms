/**
* @Author: James Hosken
* @Date:   2017-06-25
* @Email:  james.hosken@nyu.edu
* @Filename: sketch.js
 * @Last modified by:   James Hosken
 * @Last modified time: 2017-06-26
*/

var socket = io();

socket.on("serverMsg", function(msg){
  console.log(msg);
})

////////
//Keys//
////////

var voices = []; // create an empty array for the 12 voices to be created
var myKeyCodes = [0,1,2,3,4,5,6,7];
// 195.998 (G) lowest note on violin
var octave_3 = [130.813, 138.591, 146.832, 155.563, 164.814, 174.614, 184.997, 195.998, 207.652, 220, 233.082, 246.942, 261.626];
// 261.626 MIddle C
var octave_4 = [261.626, 277.183, 293.665, 311.127, 329.628, 349.228, 369.994, 391.995, 415.305, 440.0, 466.164, 493.883,523.251];

var bgcolor = [255, 255, 255];

var buttons = [];

////////
//VARS//
/////////

var onCol;
var offCol;

var numRows = 4;
var numCols = 2;
function setup() {
  createCanvas(windowWidth,windowHeight);

  onCol   = color(255,0,0);
  offCol  = color(100,100,110);

  for(var i = 0; i < numRows * numCols; i++){

    var button = new ToggleButton(width/numCols * (i%numCols),    (Math.floor(i/numCols)) * height/numRows,    width/numCols,   height/numRows);
    buttons.push(button);
  }

  //  for (i=0; i<myKeyCodes.length; i++) {
  //    voices[i] = new makeVoice(octave_3[i]);
  //  }
}

function draw() {
  background(bgcolor, 0, 0);
  buttons.forEach(function(button){
    button.render();
  })
}

function ToggleButton(pX, pY, sX, sY){
  this.pos = createVector(pX, pY);
  this.size = createVector(sX, sY);

  this.on = false;

  this.col = color(100,100,100);

  this.toggle = function(){
    this.on = !this.on;
  }

  this.isClicked = function(){

    if(mouseX > this.pos.x && mouseX < this.pos.x+this.size.x){
      if(mouseY > this.pos.y && mouseY < this.pos.y+this.size.y){
        this.toggle();
      }
    }
  }

  this.render = function(){
    if(this.on){
      fill(onCol)
    }else{
      fill(offCol);
    }
    rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}

function mousePressed(){
  buttons.forEach(function(button){
    button.isClicked();
  })
}


function makeVoice(freq) {

  this.osc = new p5.Oscillator();
  this.osc.setType('triangle');
  this.osc.freq(freq);

  // create an envelope to structure each note
  this.attackLevel = .5;
  this.releaseLevel = 0;
  this.attackTime = 0.001
  this.decayTime = 0.2;
  this.susPercent = 0.3;
  this.releaseTime = 1.0;
  this.env = new p5.Env();
  this.env.setExp(true);
  this.env.setADSR(this.attackTime, this.decayTime, this.susPercent, this.releaseTime);
  this.env.setRange(this.attackLevel, this.releaseLevel);

  this.osc.amp(this.env);
  this.osc.start();


  this.playEnv = function() {
    //this.env.play();
    this.env.triggerAttack();
  }
  this.releaseEnv = function() {
    //this.env.play();
    this.env.triggerRelease();
  }
}


function keyPressed() {
  //console.log(keyCode);
  for (i=0; i<myKeyCodes.length; i++) {
    if(keyCode == myKeyCodes[i]) {
      voices[i].playEnv();
      bgcolor=map(i, 0, 12, 100, 250);
    }

  }
  if (keyCode == 51) {
    for (i=0; i<myKeyCodes.length; i++) {
      voices[i] = new makeVoice(octave_3[i]);
    }
  }
  if (keyCode == 52) {
    for (i=0; i<myKeyCodes.length; i++) {
      voices[i] = new makeVoice(octave_4[i]);
    }
  }
}
function keyReleased() {
  for (i=0; i<myKeyCodes.length; i++) {
    if(keyCode == myKeyCodes[i]) {
      voices[i].releaseEnv();
    }
  }
}
