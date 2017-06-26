/**
* @Author: James Hosken
* @Date:   2017-06-25
* @Email:  james.hosken@nyu.edu
* @Filename: sketch.js
 * @Last modified by:   James Hosken
 * @Last modified time: 2017-06-26
*/

//Wait for data
var waiting = true;

////////////////
//TESTING MIDI//
////////////////
var drums = false;
//instrument: "synth_drums",



var socket = io();

socket.on("firstUpdate", function(data){
  console.log("DATA FROM SERVER");
  noteMatrix = data.matrix;

})

socket.on("update", function(data){
  console.log("CHANGE FROM SERVER");
  noteMatrix = data.matrix;

  //If initialised
  if(buttonColGroups.length > 0){
    var col = 0;
    buttonColGroups.forEach(function(buttonNodes){
      var row = 0;
      buttonNodes.forEach(function(button){
        if(noteMatrix[col][row]){
          button.turnOn();
        }else{
          button.turnOff();
        }
        row++
      })
      col++;
    })
  }
})

////////
//Keys//
////////

//var all_notes = [130.813, 138.591, 146.832, 155.563, 164.814, 174.614, 184.997, 195.998, 207.652, 220, 233.082, 246.942, 261.626, 277.183, 293.665, 311.127, 329.628, 349.228, 369.994, 391.995, 415.305, 440.0, 466.164, 493.883,523.251];

var beatCounter = 0;
var tempo = 20;
var barlength = 5;

////////
//VARS//
/////////

var onCol;
var offCol;

var numRows = 24;
var numCols = 16;
var buttonColGroups = [];


var noteMatrix = [[],[]];

var padding = 5;




function setup() {
  createCanvas(windowWidth, windowHeight);
}

window.onload = function () {
  MIDI.loadPlugin({
    soundfontUrl: "/soundfont/",
    instrument: "acoustic_grand_piano",
    onprogress: function(state, progress) {
      console.log(state, progress);
    },onsuccess: function(){
      console.log("Midi Loaded");
      delayedSetup();
    }
  });
}


function delayedSetup(){

  onCol   = color(255,0,0);
  offCol  = color(100,100,110);

  console.log(noteMatrix)

  if(noteMatrix.length < numCols){
    console.log("Making new matrix");
    for(var col = 0; col < numCols; col++){
      noteMatrix.push([]);
      for(var row =0; row < numRows; row++){
        noteMatrix[col].push(false);
      }
    }
  }

  for(var col = 0; col < numCols; col++){
    var buttonNodes     = [];
    var c = numRows-1;
    for(var row = 0; row < numRows; row++){
      var button = new ToggleButton(width/numCols * (col),    row * height/numRows,    width/numCols,   height/numRows, c);
      buttonNodes.push(button);
      try{
        if(noteMatrix[col][row]){
          console.log("Turning On");
          button.turnOn();
        }
      }catch(e){
        console.log("Unable to load noteMatrix");


      }
      c--;
    }

    buttonColGroups.push(buttonNodes);
  }
  frameRate(tempo);
  waiting = false;
}

function draw() {
  background(0);
  if(waiting){
    return;
  }
  //background(bgcolor, 0, 0);
  buttonColGroups.forEach(function(buttonNodes){
    buttonNodes.forEach(function(button){
      button.render();
    })
  })

  if(frameCount%barlength == 0){
    console.log("Playing Beat!");
    playBeat(beatCounter);
    beatCounter++;
    if(beatCounter >= numCols){
      beatCounter = 0;
    }
  }

  fill(255,50);
  rect(beatCounter*width/numCols, 0, width/numCols, height);

}

var playBeat = function(beat){

  //Cycle Nodes
  var buttonNodes = buttonColGroups[beat];

  buttonNodes.forEach(function(button){

    if(button.on){
      console.log("Button Playing");
      button.playButtonSound();
    }
  })

  //Draw Overlay

  
}


////////////////
//SOUND BUTTON//
////////////////

function ToggleButton(pX, pY, sX, sY, _note){
  this.pos = createVector(pX, pY);
  this.size = createVector(sX, sY);

  this.on = false;

  this.col = color(100,100,100);

  this.note = _note; //between 0 and 12

  this.toggle = function(){
    this.on = !this.on;
  }

  this.turnOn = function(){
    this.on = true;
  }

  this.turnOff = function(){
    this.on = false;
  }

  this.isClicked = function(){
    if(mouseX > this.pos.x && mouseX < this.pos.x+this.size.x){
      if(mouseY > this.pos.y && mouseY < this.pos.y+this.size.y){
        this.toggle();
        return(true);
      }
    }
    return false;
  }

  //PLAY SOUND
  this.playButtonSound = function(){
    console.log(this.note);

    var delay = 0; // play one note every quarter second
    var note = this.note + 50; // the MIDI note

    var velocity = 127; // how hard the note hits
    // play the note
    MIDI.setVolume(0, 127);
    MIDI.noteOn(0, note, velocity, delay);
    MIDI.noteOff(0, note, delay + 0.75);

  }

  this.render = function(){
    if(this.on){
      fill(onCol)
    }else{
      fill(offCol);
    }

    if(this.note == 0 || this.note == 4 || this.note == 7 || this.note == 12 ||this.note == 16 || this.note == 19 || this.note == 24){
      stroke(255);
    }else if(this.note == 2 || this.note == 5 || this.note == 9 || this.note == 11 || this.note == 14 || this.note == 17 || this.note == 21 ){
      stroke(155);
    }else{
      noStroke();
    }
    rect(this.pos.x+padding, this.pos.y+padding, this.size.x-padding, this.size.y-padding);
  }
}

function mousePressed(){
  var col = 0;
  buttonColGroups.forEach(function(buttonNodes){
    var row = 0;
    buttonNodes.forEach(function(button){
      if(button.isClicked()){
        noteMatrix[col][row] = !noteMatrix[col][row];
        socket.emit("clientMessage", {matrix: noteMatrix})
      }
      row++
    })
    col++;
  })
}
