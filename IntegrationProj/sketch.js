let music1;
let music2;
let music3;
let sound1;
let sound2;
let music1On = false;
let music2On = false;
let player;
let cursorX = 0, cursorY = 0;
let sensorData = {};
let cursorSpeed = 5;
let bg;
let done = false;
let startTime;
let elapsedTime = 0;
/*
let synth = new Tone.PolySynth();
let dSynth = new Tone.PolySynth();
let pattern = new Tone.Pattern(function (time, note) {
  synth.triggerAttackRelease(note, 0.25, time);
}, ['A1', ['A2', 'A3'], null, 'A5']);
const synthA = new Tone.FMSynth();
const synthB = new Tone.AMSynth();
let chord = new Tone.Part((time, notes)=>{
  dSynth.triggerAttackRelease(notes.note, '2n', time)
}, chords);
chord.loop = 8;
chord.loopEnd = '2m';
*/
function preload() {
  bg = loadImage('assets/space.jpg');
  music1 = loadSound('assets/clown.mp3');
  music2 = loadSound('assets/metal.mp3');
  music3 = loadSound('assets/carefree.mp3');
  sound1 = loadSound('assets/pop.wav');
  sound2 = loadSound('assets/finish.wav');
}

function setup() {
  new Canvas(bg.width * 1.5, bg.height * 1.5);
  imageMode(CENTER);

  player = new Sprite();
  player.diameter = 100;
  player.color = 'orange';
  player.text = ".>_<.";

  coins = new Group();
	coins.diameter = 15;
	coins.x = () => random(15, width - 15);
	coins.y = () => random(15, height - 15);
	coins.amount = 100;
  coins.text = ">:/";
  
  cursorX = bg.width * 1.5 / 2;
  cursorY = bg.height * 1.5 / 2;

  if ("serial" in navigator) {
    connectButton = createButton("BEGIN!");
    connectButton.position(10, bg.height * 1.5);
    connectButton.mousePressed(connect);
  }
}

function mousePressed() {
  if(!music1On) {
    music1.play();
    music1On = true;
    startTime = millis();
  }
}

function draw() {
  clear();
  image(bg, width / 2, height / 2, bg.width * 1.5, bg.height * 1.5);

  elapsedTime = millis() - startTime;
  let minutes = floor(elapsedTime / 60000);
  let seconds = floor((elapsedTime % 60000) / 1000);
  textSize(20);
  text(`${nf(minutes,2)}:${nf(seconds,2)}`, 15, height - 15); 


  serialRead();
  if (sensorData.x)
    cursorX += cursorSpeed * sensorData.x / 512;
  if (sensorData.y)
    cursorY += cursorSpeed * sensorData.y / 512;
  
  if (sensorData.sw) {
    cursorSpeed = 25;
    player.diameter = 150;
    player.color = 'red';
    player.text = ">O,_________,O<";
    player.rotationSpeed = 10;
    if(music1On) {
      music1.stop();
      music2.play();
      music1On = false;
      music2On = true;
    }
  }
  else {
    cursorSpeed = 5;
    player.diameter = 100;
    player.color = 'orange';
    player.text = ".>_<.";
    player.rotationSpeed = 0;
    if(music2On) {
      music2.stop();
      music1.play();
      music1On = true;
      music2On = false;      
    }
  }
  
  cursorX = constrain(cursorX, 35, width - 35);
  cursorY = constrain(cursorY, 35, height - 35);
  player.x = cursorX;
  player.y = cursorY;

  fill(255, 255, 255);
  textSize(20);
  text(`Evil Coins Remaining: ${coins.length}`, width - 250, height - 15);

  for(let i = 0; i < coins.length; i++) {
    if(coins[i].x < 0 || coins[i].x > width || coins[i].y < 0 || coins[i].y > height) {
      sound1.play();
      coins[i].remove();
    }
  }
  if(coins.length === 0)
    if(!done) {
      done = true;
      clear();
      rect(15, 15, 450, 30, 20);
      fill(0, 0, 0);
      let minutes = floor(elapsedTime / 60000);
      let seconds = floor((elapsedTime % 60000) / 1000);
      let score = `${nf(minutes,2)}:${nf(seconds,2)}`;
      text(`Thank you for playing! Your time score is ${score}!`, 30, 40);
      player.diameter = 125;
      player.text = "Nice job!"; 
      player.color = 'cyan';
      noLoop();
      music1.stop();
      music2.stop();
      sound2.play();
      music3.play();
    }
}


function serialRead() {
  (async () => {
    while (reader) {
      const { value, done } = await reader.read();
      if (done) {
        reader.releaseLock();
        break;
      }
      try {
        sensorData = JSON.parse(value);
      }
      catch (e) {
        console.log("bad json parse: " + e);
      }
    }
  })();
}
async function connect() {
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: 38400 }); 
  reader = port.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TransformStream(new LineBreakTransformer()))
    .getReader();
 }
 class LineBreakTransformer {
  constructor() {
    this.chunks = "";
  }
  transform(chunk, controller) {
    this.chunks += chunk;
    const lines = this.chunks.split("\n");
    this.chunks = lines.pop();
    lines.forEach((line) => controller.enqueue(line));
  }
  flush(controller) {
    controller.enqueue(this.chunks);
  }
 }