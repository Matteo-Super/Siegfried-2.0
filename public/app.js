/* Siegfried 2.0 — App Logic */

// ── Arduino Code Templates ──
const CODE = {
  obstacle: `#include <Servo.h>\n\nconst int TRIG=11,ECHO=12,SERVO_PIN=10;\nconst int MA1=4,MA2=7,MAPWM=5,MB1=8,MB2=9,MBPWM=6;\nServo head;\n\nvoid setup(){\n  Serial.begin(9600);\n  pinMode(TRIG,OUTPUT);pinMode(ECHO,INPUT);\n  for(int p:{MA1,MA2,MAPWM,MB1,MB2,MBPWM}) pinMode(p,OUTPUT);\n  head.attach(SERVO_PIN);head.write(90);delay(800);\n}\n\nint measure(){\n  digitalWrite(TRIG,LOW);delayMicroseconds(2);\n  digitalWrite(TRIG,HIGH);delayMicroseconds(10);\n  digitalWrite(TRIG,LOW);\n  long d=pulseIn(ECHO,HIGH,30000);\n  return d?d*0.034/2:999;\n}\n\nvoid drive(int la,int lb,int ra,int rb,int spd){\n  digitalWrite(MA1,la);digitalWrite(MA2,lb);\n  digitalWrite(MB1,ra);digitalWrite(MB2,rb);\n  analogWrite(MAPWM,spd);analogWrite(MBPWM,spd);\n}\nvoid fwd(int s){drive(1,0,1,0,s);}\nvoid rev(int s){drive(0,1,0,1,s);}\nvoid left(int s){drive(0,1,1,0,s);}\nvoid right(int s){drive(1,0,0,1,s);}\nvoid halt(){drive(0,0,0,0,0);}\n\nvoid loop(){\n  int d=measure();\n  if(d>0&&d<25){\n    halt();delay(200);\n    head.write(150);delay(300);int L=measure();\n    head.write(30);delay(300);int R=measure();\n    head.write(90);delay(200);\n    if(L>R&&L>25)left(180);else if(R>25)right(180);\n    else{rev(180);delay(500);right(250);}\n    halt();delay(150);\n  }else fwd(200);\n  delay(40);\n}`,
  line: `const int SL=A0,SC=A1,SR=A2;\nconst int MA1=4,MA2=7,MAPWM=5,MB1=8,MB2=9,MBPWM=6;\n\nvoid setup(){\n  for(int p:{SL,SC,SR}) pinMode(p,INPUT);\n  for(int p:{MA1,MA2,MAPWM,MB1,MB2,MBPWM}) pinMode(p,OUTPUT);\n}\n\nvoid go(int ls,int rs){\n  digitalWrite(MA1,1);digitalWrite(MA2,0);\n  digitalWrite(MB1,1);digitalWrite(MB2,0);\n  analogWrite(MAPWM,ls);analogWrite(MBPWM,rs);\n}\nvoid halt(){analogWrite(MAPWM,0);analogWrite(MBPWM,0);}\n\nvoid loop(){\n  bool l=digitalRead(SL),c=digitalRead(SC),r=digitalRead(SR);\n  if(c&&!l&&!r) go(150,150);\n  else if(l&&!r) go(0,180);\n  else if(r&&!l) go(180,0);\n  else if(!l&&!c&&!r) go(80,80);\n  else if(l&&c&&r){halt();delay(400);}\n  delay(10);\n}`,
  bluetooth: `#include <SoftwareSerial.h>\nSoftwareSerial BT(2,3);\nconst int MA1=4,MA2=7,MAPWM=5,MB1=8,MB2=9,MBPWM=6;\nint spd=200;\n\nvoid setup(){\n  Serial.begin(9600);BT.begin(9600);\n  for(int p:{MA1,MA2,MAPWM,MB1,MB2,MBPWM}) pinMode(p,OUTPUT);\n}\nvoid drive(int a,int b,int c,int d,int s){\n  digitalWrite(MA1,a);digitalWrite(MA2,b);digitalWrite(MB1,c);digitalWrite(MB2,d);\n  analogWrite(MAPWM,s);analogWrite(MBPWM,s);}\nvoid loop(){\n  if(!BT.available())return;\n  char c=BT.read();\n  switch(c){\n    case'F':drive(1,0,1,0,spd);break;\n    case'B':drive(0,1,0,1,spd);break;\n    case'L':drive(0,1,1,0,spd);break;\n    case'R':drive(1,0,0,1,spd);break;\n    case'S':drive(0,0,0,0,0);break;\n    case'1':spd=100;break;case'2':spd=150;break;\n    case'3':spd=200;break;case'4':spd=255;break;\n  }\n}`
};

// ── New Arduino Firmware Code ──
const ARDUINO_FIRMWARE = `//RGB
#include "Freenove_WS2812B_RGBLED_Controller.h"
#include "Servo.h"

byte fadeValue = 0;  // 0 = Komplett Grün, 255 = Komplett Rot
byte rainbowStep = 0;

// LED
#define I2C_ADDRESS 0x20
#define LEDS_ANZ 10
Freenove_WS2812B_Controller strip(I2C_ADDRESS, LEDS_ANZ, TYPE_GRB);

// Motoren
#define PIN_DIRECTION_RIGHT 3
#define PIN_DIRECTION_LEFT 4
#define PIN_MOTOR_PWM_RIGHT 5
#define PIN_MOTOR_PWM_LEFT 6
#define PIN_BUZZER A0

// Infrarot
#define PIN_TRACKING_LEFT A1
#define PIN_TRACKING_CENTER A2
#define PIN_TRACKING_RIGHT A3

#define speedT1 100
#define speedT2 140
#define speedT_1 -100
#define speedT_2 -140
#define speedF 80

// Servo
#define PIN_SERVO 2
Servo servo;
byte servoOffset = 12;

// Ultrasonic
#define PIN_SONIC_TRIG 7
#define PIN_SONIC_ECHO 8
#define MAX_DISTANCE 220  // In cm
#define SONIC_TIMEOUT (MAX_DISTANCE * 60)
#define SOUND_VELOCITY 0.034  // cm pro Mikrosekunde

bool isStopped = true;
unsigned long freePathStartTime = 0;
int stuckCounter = 0;

// Funktionen
float getSonar() {
  unsigned long pingTime;
  float distance;
  digitalWrite(PIN_SONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_SONIC_TRIG, LOW);

  pingTime = pulseIn(PIN_SONIC_ECHO, HIGH, SONIC_TIMEOUT);

  if (pingTime != 0) {
    distance = (float)pingTime * SOUND_VELOCITY / 2;
  } else {
    distance = MAX_DISTANCE;
  }
  return distance;
}

void motorRun(int speedL, int speedR) {
  int dirL = 0, dirR = 0;
  if (speedL > 0) {
    dirL = 1;
  } else {
    dirL = 0;
    speedL = abs(speedL);
  }
  if (speedR > 0) {
    dirR = 0;
  } else {
    dirR = 1;
    speedR = abs(speedR);
  }

  digitalWrite(PIN_DIRECTION_RIGHT, dirR);
  digitalWrite(PIN_DIRECTION_LEFT, dirL);
  analogWrite(PIN_MOTOR_PWM_RIGHT, speedR);
  analogWrite(PIN_MOTOR_PWM_LEFT, speedL);
}

byte RIGHT = 1;
byte LEFT = 0;

void drehen(int Grad, int direction = RIGHT) {
  if (direction == RIGHT) {
    motorRun(140, -140);
    delay(4.9 * Grad);
    motorRun(0, 0);
  } else if (direction == LEFT) {
    motorRun(-180, 180);
    delay(4.9 * Grad);
    motorRun(0, 0);
  }
}

void befreien() {
  Serial.println("BIN FESTGEFAHREN! Befreiungs-Modus aktiviert...");
  for (int i = 0; i < 150; i += 20) {
    strip.setAllLedsColor(255, i, 0);
    digitalWrite(PIN_BUZZER, HIGH);
  }
  digitalWrite(PIN_BUZZER, HIGH);
  motorRun(-180, -180);
  delay(300);
  for (int i = 0; i < 4; i++) {
    motorRun(200, -200);
    delay(200);
    motorRun(-200, 200);
    delay(200);
  }
  digitalWrite(PIN_BUZZER, LOW);
  drehen(220);
  motorRun(0, 0);
  stuckCounter = 0;
}

void setup() {
  Serial.begin(9600);
  servo.attach(PIN_SERVO);
  servo.write(90 + servoOffset);

  pinMode(PIN_SONIC_TRIG, OUTPUT);
  pinMode(PIN_SONIC_ECHO, INPUT);
  pinMode(PIN_DIRECTION_RIGHT, OUTPUT);
  pinMode(PIN_DIRECTION_LEFT, OUTPUT);
  pinMode(PIN_MOTOR_PWM_RIGHT, OUTPUT);
  pinMode(PIN_MOTOR_PWM_LEFT, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_TRACKING_LEFT, INPUT);
  pinMode(PIN_TRACKING_RIGHT, INPUT);
  pinMode(PIN_TRACKING_CENTER, INPUT);

  while (!strip.begin());

  for (int i = 0; i <= 255; i += 5) {
    strip.setAllLedsColor(0, i, 0);
    delay(2);
  }
}

byte sensorValue[4];

byte getSensorVal() {
  sensorValue[0] = digitalRead(PIN_TRACKING_LEFT);
  sensorValue[1] = digitalRead(PIN_TRACKING_CENTER);
  sensorValue[2] = digitalRead(PIN_TRACKING_RIGHT);
  sensorValue[3] = sensorValue[0] << 2 | sensorValue[1] << 1 | sensorValue[2];
  return sensorValue[3];
}

byte trackingSensorVal;
bool Auto = false;
unsigned long timeTracking0;

void trackingLine() {
  switch (trackingSensorVal) {
    case 0:
      if (millis() - timeTracking0 > 1200) Auto = true;
      isStopped = true;
      break;
    case 7:
      motorRun(speedF, speedF);
      strip.setAllLedsColor(0, 255, 0);
      break;
    case 1:
      motorRun(speedT2, speedT_2);
      strip.setAllLedsColor(255, 122, 0);
      timeTracking0 = millis();
      break;
    case 2:
      motorRun(speedF, speedF);
      strip.setAllLedsColor(0, 255, 0);
      timeTracking0 = millis();
      break;
    case 3:
      motorRun(speedT1, speedT_1);
      strip.setAllLedsColor(255, 122, 0);
      timeTracking0 = millis();
      break;
    case 4:
      motorRun(speedT_2, speedT2);
      strip.setAllLedsColor(255, 122, 0);
      timeTracking0 = millis();
      break;
    case 5:
      motorRun(speedT_2, speedT2);
      strip.setAllLedsColor(255, 122, 0);
      timeTracking0 = millis();
      break;
    case 6:
      motorRun(speedT_1, speedT1);
      strip.setAllLedsColor(255, 122, 0);
      timeTracking0 = millis();
      break;
  }
}

void automaticAvoidance() {
  float distance[5];
  distance[0] = getSonar();

  if (distance[0] > 0 && distance[0] <= 30) {
    if (!isStopped) {
      stuckCounter++;
      freePathStartTime = millis();
    }
    if (stuckCounter >= 4) befreien();

    motorRun(-120, -120);
    delay(200);
    motorRun(0, 0);

    for (int i = fadeValue; i <= 255; i += 25) {
      strip.setAllLedsColor(i, 255 - i, 0);
      delay(10);
    }
    fadeValue = 255;
    isStopped = true;

    for (int i = 40; i <= 140; i += 25) {
      servo.write(i + servoOffset);
      delay(200);
      int index = (i - 40) / 25;
      distance[index] = getSonar();
    }
    delay(200);
    servo.write(90 + servoOffset);
    
    float maxDist = distance[0];
    int bestIndex = 0;
    
    for (int i = 1; i < 5; i++) {
      if (distance[i] > maxDist) {
        maxDist = distance[i];
        bestIndex = i;
      }
    }

    if (maxDist <= 40) {
      drehen(180);
    } else {
      switch (bestIndex) {
        case 0: drehen(85, RIGHT); break;
        case 1: drehen(30, RIGHT); break;
        case 2: drehen(30, RIGHT); break; 
        case 3: drehen(30, LEFT); break;
        case 4: drehen(85, LEFT); break;
      }
    }

    for (int i = fadeValue; i >= 0; i -= 25) {
      strip.setAllLedsColor(i, 255 - i, 0);
      delay(10);
    }
    fadeValue = 0;
  } else {
    if (!isStopped && (millis() - freePathStartTime > 200)) {
      stuckCounter = 0;
    }
    if (isStopped) {
      motorRun(200, 200);
      isStopped = false;
      freePathStartTime = millis();
      rainbowStep = 0;
    }
    if (millis() - freePathStartTime >= 2000) {
      for (int i = 0; i < LEDS_ANZ; i++) {
        strip.setLedColor(i, strip.Wheel(((i * 256 / LEDS_ANZ) + rainbowStep) & 255));
      }
      rainbowStep += 3;
      if (rainbowStep >= 255) rainbowStep = 0;
      delay(5);
    } else {
      if (fadeValue > 0) fadeValue -= 15;
      if (fadeValue < 0) fadeValue = 0;
      strip.setAllLedsColor(fadeValue, 255 - fadeValue, 0);
    }
  }
}

void loop() {
  trackingSensorVal = getSensorVal();
  if (trackingSensorVal != 0) {
    Auto = false;
    timeTracking0 = millis();
  } else if (millis() - timeTracking0 > 1200) {
    Auto = true;
  }
  if (Auto == false) {
    strip.setAllLedsColor(0, 255, 0);
    trackingLine();
  } else {
    automaticAvoidance();
  }
}`;

// ── Theme Toggle ──
function initTheme(){
  const btn=document.getElementById('theme-btn');
  const icon=document.getElementById('theme-icon');
  const saved=localStorage.getItem('siegfried-theme');
  if(saved==='light') document.body.classList.add('light');

  function syncIcon(){
    const isLight=document.body.classList.contains('light');
    icon.className=isLight?'fa-solid fa-sun':'fa-solid fa-moon';
  }
  syncIcon();

  btn.addEventListener('click',()=>{
    document.body.classList.toggle('light');
    localStorage.setItem('siegfried-theme',document.body.classList.contains('light')?'light':'dark');
    syncIcon();
  });
}

// ── Scroll Reveal (IntersectionObserver) ──
function initReveal(){
  const els=document.querySelectorAll('.reveal');
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}});
  },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
  els.forEach(el=>obs.observe(el));
}

// ── Canvas Simulator ──
const canvas=document.getElementById('sim-canvas');
const c=canvas.getContext('2d');
const overlay=document.getElementById('sim-overlay');

const S={
  mode:'manual',x:320,y:210,speed:0,angle:-Math.PI/2,
  target:0,steer:0,
  friction:.94,driftTraction:.86,turnRate:.065,
  tracks:[],particles:[],obstacles:[],battery:82,collision:false
};

function initObstacles(){
  S.obstacles=[
    {x:140,y:100,r:15},{x:500,y:300,r:15},
    {x:120,y:310,r:15},{x:510,y:110,r:15},
    {x:320,y:210,r:11}
  ];
}

class Particle{
  constructor(x,y,type){
    this.x=x;this.y=y;this.type=type;
    if(type==='smoke'){
      this.vx=(Math.random()-.5)*5;this.vy=(Math.random()-.5)*5;
      this.sz=Math.random()*5+3;this.a=.4;this.decay=.02;
    }else{
      const sp=Math.random()*50+20,an=Math.random()*Math.PI*2;
      this.vx=Math.cos(an)*sp;this.vy=Math.sin(an)*sp;
      this.sz=Math.random()*2+1;this.a=1;this.decay=.05;
    }
  }
  update(dt){this.x+=this.vx*dt;this.y+=this.vy*dt;this.a-=this.decay;if(this.type==='smoke')this.sz+=.15}
  draw(ctx){
    ctx.beginPath();ctx.arc(this.x,this.y,this.sz,0,Math.PI*2);
    ctx.fillStyle=this.type==='smoke'
      ?`rgba(148,163,184,${Math.max(this.a,0)})`
      :`rgba(251,191,36,${Math.max(this.a,0)})`;
    ctx.fill();
  }
}

function collide(x,y){
  const r=13;
  if(x<r||x>canvas.width-r||y<r||y>canvas.height-r) return true;
  for(const o of S.obstacles){
    const dx=x-o.x,dy=y-o.y;
    if(Math.sqrt(dx*dx+dy*dy)<r+o.r) return true;
  }
  return false;
}

let scanAngle=0;
function sensorDist(){
  const sw=Math.sin(Date.now()*.005)*.5;scanAngle=sw;
  const sa=S.angle+sw,dx=Math.cos(sa),dy=Math.sin(sa);
  const nx=S.x+Math.cos(S.angle)*16,ny=S.y+Math.sin(S.angle)*16;
  let best=999;
  if(dx>0)best=Math.min(best,(canvas.width-nx)/dx);
  else if(dx<0)best=Math.min(best,-nx/dx);
  if(dy>0)best=Math.min(best,(canvas.height-ny)/dy);
  else if(dy<0)best=Math.min(best,-ny/dy);
  for(const o of S.obstacles){
    const vx=o.x-nx,vy=o.y-ny,pr=vx*dx+vy*dy;
    if(pr>0){const pp=Math.abs(vx*(-dy)+vy*dx);if(pp<o.r+4){const d=Math.sqrt(pr*pr+pp*pp)-o.r;if(d>0&&d<best)best=d}}
  }
  return Math.round(best*.25);
}

// ── Keyboard (Canvas-scoped) ──
const keys={};
canvas.addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyS','KeyA','KeyD'].includes(e.code))e.preventDefault();
  if(S.mode!=='manual')return;
  keys[e.code]=true;applyKeys();
});
canvas.addEventListener('keyup',e=>{if(S.mode!=='manual')return;keys[e.code]=false;applyKeys()});
canvas.addEventListener('focus',()=>overlay.classList.add('hidden'));
canvas.addEventListener('blur',()=>{overlay.classList.remove('hidden');for(let k in keys)keys[k]=false;applyKeys()});

function applyKeys(){
  S.target=0;S.steer=0;
  if(keys.ArrowUp||keys.KeyW){S.target=140;mark('d-up',true)}else mark('d-up',false);
  if(keys.ArrowDown||keys.KeyS){S.target=-80;mark('d-down',true)}else mark('d-down',false);
  if(keys.ArrowLeft||keys.KeyA){S.steer=-1;mark('d-left',true)}else mark('d-left',false);
  if(keys.ArrowRight||keys.KeyD){S.steer=1;mark('d-right',true)}else mark('d-right',false);
  if(keys.Space){S.target=0;S.steer=0;mark('d-stop',true)}else mark('d-stop',false);
}
function mark(id,on){const el=document.getElementById(id);if(el){on?el.classList.add('active'):el.classList.remove('active')}}

// DPad buttons
function dpadBind(id,spd,str){
  const el=document.getElementById(id);if(!el)return;
  const dn=()=>{canvas.focus();if(S.mode!=='manual')return;if(spd!==undefined)S.target=spd;if(str!==undefined)S.steer=str;el.classList.add('active')};
  const up=()=>{el.classList.remove('active');if(str!==undefined)S.steer=0};
  el.addEventListener('mousedown',dn);el.addEventListener('mouseup',up);el.addEventListener('mouseleave',up);
  el.addEventListener('touchstart',e=>{e.preventDefault();dn()});el.addEventListener('touchend',e=>{e.preventDefault();up()});
}
dpadBind('d-up',140,undefined);dpadBind('d-down',-80,undefined);
dpadBind('d-left',undefined,-1);dpadBind('d-right',undefined,1);
const stopEl=document.getElementById('d-stop');
if(stopEl){stopEl.addEventListener('mousedown',()=>{canvas.focus();S.target=0;S.steer=0;stopEl.classList.add('active')});stopEl.addEventListener('mouseup',()=>stopEl.classList.remove('active'))}

// Mode buttons
const mManual=document.getElementById('mode-manual'),mAuto=document.getElementById('mode-auto');
mManual.addEventListener('click',()=>{S.mode='manual';mManual.classList.add('active');mAuto.classList.remove('active');S.target=0;document.getElementById('t-status').textContent='Manual'});
mAuto.addEventListener('click',()=>{S.mode='autopilot';mAuto.classList.add('active');mManual.classList.remove('active');S.target=65;document.getElementById('t-status').textContent='Autopilot'});

let autoSt='drive',avoidDir=1,avoidT=0,lastT=0;

function tick(ts){
  if(!lastT)lastT=ts;
  const dt=Math.min((ts-lastT)/1000,.1);lastT=ts;

  const light=document.body.classList.contains('light');
  const accent=light?'#4f46e5':'#818cf8';
  const gridC=light?'rgba(79,70,229,.035)':'rgba(129,140,248,.025)';
  const obstBorder=light?'rgba(79,70,229,.2)':'rgba(129,140,248,.2)';

  // Battery drain
  if(Math.abs(S.speed)>5&&S.battery>0){S.battery-=dt*.03;if(S.battery<=0){S.battery=0;S.target=0;document.getElementById('t-status').textContent='LOW BATT'}}

  // Autopilot
  if(S.mode==='autopilot'&&S.battery>0){
    const sd=sensorDist();
    if(autoSt==='avoid'){S.target=-15;S.steer=avoidDir;avoidT-=dt;if(avoidT<=0)autoSt='drive'}
    else{S.target=65;S.steer=0;if(sd<22){autoSt='avoid';avoidDir=Math.random()>.5?1:-1;avoidT=.9}}
  }

  // Physics
  S.speed+=(S.target-S.speed)*4*dt;
  if(Math.abs(S.speed)>8){const f=S.speed<0?-1:1;S.angle+=S.steer*S.turnRate*f*(50+Math.abs(S.speed))*.007}
  S.speed*=Math.abs(S.speed)>100?S.driftTraction:S.friction;

  const nx=S.x+Math.cos(S.angle)*S.speed*dt,ny=S.y+Math.sin(S.angle)*S.speed*dt;
  if(!collide(nx,ny)){S.x=nx;S.y=ny;S.collision=false}
  else{if(!S.collision){S.collision=true;for(let i=0;i<12;i++)S.particles.push(new Particle(S.x,S.y,'spark'))}S.speed=-S.speed*.2;S.target=0}

  // Drift
  const drifting=Math.abs(S.steer)>.1&&Math.abs(S.speed)>70;
  if(drifting){
    const lr=S.angle-Math.PI/2,rr=S.angle+Math.PI/2;
    const w1x=S.x-Math.cos(S.angle)*10+Math.cos(lr)*8,w1y=S.y-Math.sin(S.angle)*10+Math.sin(lr)*8;
    const w2x=S.x-Math.cos(S.angle)*10+Math.cos(rr)*8,w2y=S.y-Math.sin(S.angle)*10+Math.sin(rr)*8;
    S.tracks.push({x1:w1x,y1:w1y,x2:w2x,y2:w2y,a:.45});
    if(Math.random()>.3){S.particles.push(new Particle(w1x,w1y,'smoke'));S.particles.push(new Particle(w2x,w2y,'smoke'))}
  }
  S.tracks.forEach(t=>t.a-=.006);S.tracks=S.tracks.filter(t=>t.a>0);
  S.particles.forEach(p=>p.update(dt));S.particles=S.particles.filter(p=>p.a>0);

  // ── DRAW ──
  c.clearRect(0,0,canvas.width,canvas.height);

  // Grid
  c.strokeStyle=gridC;c.lineWidth=1;
  for(let x=0;x<canvas.width;x+=24){c.beginPath();c.moveTo(x,0);c.lineTo(x,canvas.height);c.stroke()}
  for(let y=0;y<canvas.height;y+=24){c.beginPath();c.moveTo(0,y);c.lineTo(canvas.width,y);c.stroke()}

  // Tracks
  c.lineWidth=2;
  for(const t of S.tracks){
    c.strokeStyle=light?`rgba(15,23,42,${t.a*.25})`:`rgba(148,163,184,${t.a*.2})`;
    c.beginPath();c.moveTo(t.x1,t.y1);c.lineTo(t.x1+1,t.y1+1);c.stroke();
    c.beginPath();c.moveTo(t.x2,t.y2);c.lineTo(t.x2+1,t.y2+1);c.stroke();
  }

  // Sensor cone
  const sd=sensorDist();
  const nx2=S.x+Math.cos(S.angle)*14,ny2=S.y+Math.sin(S.angle)*14;
  const gr=c.createRadialGradient(nx2,ny2,4,nx2,ny2,Math.min(sd*4,120));
  if(sd<22){gr.addColorStop(0,'rgba(251,191,36,.2)');gr.addColorStop(1,'rgba(251,191,36,0)')}
  else{gr.addColorStop(0,light?'rgba(79,70,229,.12)':'rgba(129,140,248,.15)');gr.addColorStop(1,'rgba(99,102,241,0)')}
  c.fillStyle=gr;c.beginPath();c.moveTo(nx2,ny2);c.arc(nx2,ny2,Math.min(sd*4,120),S.angle-.2,S.angle+.2);c.closePath();c.fill();

  // Obstacles
  for(const o of S.obstacles){
    c.beginPath();c.arc(o.x,o.y,o.r,0,Math.PI*2);
    c.fillStyle=light?'rgba(15,23,42,.02)':'rgba(255,255,255,.01)';
    c.strokeStyle=obstBorder;c.lineWidth=1.5;c.fill();c.stroke();
    c.beginPath();c.arc(o.x,o.y,3,0,Math.PI*2);
    c.fillStyle=accent;c.fill();
  }

  // Particles
  for(const p of S.particles)p.draw(c);

  // Car
  c.save();c.translate(S.x,S.y);c.rotate(S.angle);

  // Wheels
  const wheelColor=light?'#334155':'#1e293b';
  const wheelStroke=drifting?'#fbbf24':accent;
  const drawW=(wx,wy,sa)=>{
    c.save();c.translate(wx,wy);c.rotate(sa);
    c.fillStyle=wheelColor;c.strokeStyle=wheelStroke;c.lineWidth=1;
    c.fillRect(-3,-7,6,14);c.strokeRect(-3,-7,6,14);
    c.restore();
  };
  const fs=S.steer*.3;
  drawW(11,-9,fs);drawW(11,9,fs);drawW(-11,-9,0);drawW(-11,9,0);

  // Chassis
  c.fillStyle=light?'rgba(241,245,249,.9)':'rgba(15,23,42,.92)';
  c.strokeStyle=accent;c.lineWidth=1.6;
  c.shadowBlur=light?3:7;c.shadowColor=accent;
  c.beginPath();
  c.moveTo(-14,-9);c.lineTo(14,-9);c.quadraticCurveTo(17,-9,17,-6);
  c.lineTo(17,6);c.quadraticCurveTo(17,9,14,9);
  c.lineTo(-14,9);c.quadraticCurveTo(-17,9,-17,6);
  c.lineTo(-17,-6);c.quadraticCurveTo(-17,-9,-14,-9);
  c.closePath();c.fill();c.stroke();c.shadowBlur=0;

  // Battery
  c.fillStyle='#fbbf24';c.globalAlpha=.7;c.fillRect(-9,-4,11,8);c.globalAlpha=1;

  // PCB
  c.fillStyle=light?'#e2e8f0':'#0f172a';c.strokeStyle='rgba(168,85,247,.35)';c.lineWidth=.8;
  c.fillRect(0,-5,10,10);c.strokeRect(0,-5,10,10);
  c.fillStyle='#34d399';c.beginPath();c.arc(7,-2,1.2,0,Math.PI*2);c.fill();

  // Sensor head
  c.save();c.translate(13,0);c.rotate(scanAngle);
  c.fillStyle='#334155';c.strokeStyle=accent;c.lineWidth=.8;
  c.fillRect(-2,-5,4,10);c.strokeRect(-2,-5,4,10);
  c.fillStyle=light?'#1e293b':'#0f172a';
  c.beginPath();c.arc(0,-3,2.5,0,Math.PI*2);c.arc(0,3,2.5,0,Math.PI*2);c.fill();
  c.strokeStyle=accent;c.lineWidth=.6;c.stroke();
  c.restore();

  c.restore();

  // Telemetry
  document.getElementById('t-speed').textContent=Math.round(Math.abs(S.speed))+' cm/s';
  document.getElementById('t-dist').textContent=sd>150?'—':sd+' cm';
  document.getElementById('t-batt').textContent=S.battery.toFixed(1)+' V';

  requestAnimationFrame(tick);
}

function initFirmwareCode() {
  const codeEl = document.getElementById('firmware-code');
  const copyBtn = document.getElementById('copy-btn');
  if (codeEl) {
    codeEl.textContent = ARDUINO_FIRMWARE;
  }
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(ARDUINO_FIRMWARE).then(() => {
        const oldHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = oldHtml;
        }, 2000);
      }).catch(err => {
        console.error('Fehler beim Kopieren des Codes: ', err);
      });
    });
  }
}

// ── Init ──
window.addEventListener('DOMContentLoaded',()=>{
  initTheme();
  initReveal();
  initObstacles();
  initFirmwareCode();
  requestAnimationFrame(tick);
});
