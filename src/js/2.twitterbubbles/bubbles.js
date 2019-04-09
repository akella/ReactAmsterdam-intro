import * as THREE from 'three';
window.THREE = THREE;
var createFontGeometry = require('three-bmfont-text');
var MSDFShader = require('three-bmfont-text/shaders/msdf');
import {TimelineMax} from 'gsap';

import firsttweet from './first/index.js';
const firsttweetanimation = firsttweet();

import * as dat from 'dat.gui';
import b from './bubble/bubble.js';
import Wall from './wall/wall.js';

import {Howl, Howler} from 'howler';

var OrbitControls = require('three-orbit-controls')(THREE);
function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}
function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}
function easeOutBack(x) {
  return (x-1) * (x-1) * ((1.70158 + 1) * (x-1) + 1.70158) + 1; 
}
function easeOutQuad(t) { return t*(2-t); }

class Sketch {
  constructor(selector, analyser) {
    this.container = document.getElementById(selector);
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    // this.renderer = new WebGLRenderer();
    // this.raycaster = new Raycaster();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.container.offsetWidth,
      this.container.offsetHeight
    );
    this.renderer.setClearColor(0x151515, 1);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.tweetPlease = document.getElementById('tweetplease');
    this.z = 50;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      50,
      this.container.offsetWidth / this.container.offsetHeight,
      0.001,
      100
    );
    this.camera.position.set(0, 0, -1);
    this.camera.lookAt(0, 0, -50);
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;
    this.paused = true;
    this.currentWave = 0;
    this.smiles = [];
    this.handles = [];
    this.currentNumber = 0;
    this.maximum = 10;

    this.newBubbleSound = new Howl({
      src: ['/sounds/newbubble.wav']
    });

    this.hitSound = new Howl({
      src: ['/sounds/hit.wav']
    });

    this.bgSound = new Howl({
      src: ['/sounds/bg.mp3'],
      volume: 0.3,
      loop: true
    });

    
  }

  initiate(cb) {
    // promise!
    let promises = [
      this.setupcubeTexture(),
      this.loadMatCap(),
      this.loadSmile('img/smiles/1.png'),
      this.loadSmile('img/smiles/2.png'),
      this.loadSmile('img/smiles/3.png'),
      this.loadSmile('img/smiles/4.png'),
      this.loadSmile('img/smiles/5.png'),
      this.loadFont()
    ];

    Promise.all(promises).then(() => {
      this.addBubble();
      this.addWall();
      this.prepareVideo();
      this.animate();

      // this.text();
      // this.punch();
      cb();
    });

    this.setupResize();
    this.resize();
    this.settings();
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    var w = this.container.offsetWidth;
    var h = this.container.offsetHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;

    //this.camera.fov = 2 * Math.atan( 2 / ( 2 * 2.5 ) ) * ( 180 / Math.PI );
    // this.camera.fov = 2 * Math.atan( ( 2 / this.camera.aspect ) / ( 2 * 2.5 ) ) * ( 180 / Math.PI ); // in degrees
    this.camera.updateProjectionMatrix();
  }

  punchWall(p) {
    // console.log(p, 'punch');
    this.wall.punch(p);
  }

  addWall() {
    this.wall = new Wall();
    this.scene.add(this.wall.getMesh());
  }

  loadFont() {
    let that = this;
    return new Promise(resolve => {
      fetch('fonts/font.json')
        .then(function(response) {
          return response.json();
        })
        .then(function(font) {
          that.font = font;
          that.fontTexture = new THREE.TextureLoader().load(
            'fonts/sheet0.png',
            resolve
          );
        });
    });
  }

  getText(text) {
    let that = this;

    let geometry = createFontGeometry({
      width: 2000,
      align: 'left',
      font: that.font,
      flipY: true
    });
    geometry.update(text);

    let material = new THREE.RawShaderMaterial(
      MSDFShader({
        map: that.fontTexture,
        side: THREE.DoubleSide,
        transparent: true,
        // depthTest: false,
        // wireframe: true,
        color: 'rgb(6, 225, 45)'
      })
    );

    geometry.computeBoundingBox();
    let mesh = new THREE.Mesh(geometry, material);
    let k = 0.008;
    mesh.scale.y = -k;
    mesh.scale.x = k;
    mesh.scale.z = k;
    mesh.position.x = 0;
    mesh.position.z = 0;
    mesh.position.y = 165;


    // move under ball
    let gg = mesh.geometry.attributes.position;
    for (let i = 0; i < gg.array.length; i = i + 2) {
      gg.array[i] += -geometry.boundingBox.max.x / 2;
      gg.array[i + 1] += 165;
    }

    return mesh;
  }

  settings() {
    // @todo cut geometry to change number of dots
    let that = this;
    this.settings = {
      revealVideo: 0,
      waveIndex: 0,
      nickname: '@username',
      uDensity: 40,
      time: 0,
      amplitude: 1,
      diffAmplitude: 0.3,
      period1: 0.41,
      period2: 0.85,
      perlinAmplitude: 0,
      timeSpeed: 0.37,
      oneWave: 1000,
      size: 5,
      mRefractionRatio: 1.02,
      mFresnelBias: 0.1,
      mFresnelPower: 2,
      mFresnelScale: 1,
      offset0: 0,
      offset1: 0.1,
      smileProgress: 0,
      addTweet: () => {
        this.addNewBubble(this.settings.nickname);
      },
      Punch: () => {
        this.punchWall(new THREE.Vector3(0,0,that.z));
      }
    };

    this.gui = new dat.GUI();
    // this.gui.add(this.settings, 'startProgress', 0,1, 0.01);
    // this.gui.add(this.settings, 'addTweet');
    // this.gui.add(this.settings, 'Punch');
    this.gui.add(this.settings, 'revealVideo',0,1,0.01);
    this.gui.add(this.settings, 'nickname');
  }

  setupcubeTexture() {
    let that = this;
    let path = 'img/newsky/';
    let format = '.jpg';
    let urls1 = [
      path + 'px' + format,
      path + 'nx' + format,
      path + 'py' + format,
      path + 'ny' + format,
      path + 'pz' + format,
      path + 'nz' + format
    ];

    return new Promise(resolve => {
      that.textureCube1 = new THREE.CubeTextureLoader().load(urls1, resolve);
    });
    // this.textureCube1.format = THREE.RGBFormat;
  }

  loadMatCap() {
    let that = this;
    return new Promise(resolve => {
      that.matcap = new THREE.TextureLoader().load('img/matcap.jpg', resolve);
    });
  }

  loadSmile(url) {
    let that = this;
    return new Promise(resolve => {
      let smile = new THREE.TextureLoader().load(url, resolve);
      smile.magFilter = THREE.NearestFilter;
      smile.minFilter = THREE.NearestFilter;
      that.smiles.push(smile);
    });
  }

  addNewBubble(nickname) {
    // console.log(this.currentBubbleIndex, this.maximum);
    if(this.currentBubbleIndex > this.maximum) {return;}
    let visible = this.instancedGeometry.attributes.instanceVisible.array;
    let position = this.instancedGeometry.attributes.instancePosition.array;
    let target = this.instancedGeometry.attributes.instanceTarget.array;
    let smile = this.instancedGeometry.attributes.instanceSmile.array;

    this.currentBubbleIndex++;

    // visib
    visible[this.currentBubbleIndex] = 1;
    //pos
    // let newpos = new THREE.Vector3(Math.random(),Math.random(),5*Math.random());
    let r = (0.5) * Math.sqrt(Math.random()) + 0.8;
    let rr = Math.sqrt(Math.random());
    let theta = Math.random() * 2 * 3.1415;
    let theta1 = Math.random() * 2 * 3.1415;

    let xx = r*Math.cos(theta);
    let yy = r*Math.sin(theta);
    let xx1 = rr*Math.cos(theta1);
    let yy1 = rr*Math.sin(theta1);



    let newpos = new THREE.Vector3( xx, yy, 0);
    position[this.currentBubbleIndex * 3] = newpos.x;
    position[this.currentBubbleIndex * 3 + 1] = newpos.y;
    position[this.currentBubbleIndex * 3 + 2] = newpos.z;

    target[this.currentBubbleIndex * 3] = xx1 * 7 ;
    target[this.currentBubbleIndex * 3 + 1] = yy1 * 7 ;
    target[this.currentBubbleIndex * 3 + 2] = -this.z;

    smile[this.currentBubbleIndex ] = Math.floor(Math.random()*3.9);
    console.log(smile);

    this.instancedGeometry.attributes.instancePosition.needsUpdate = true;
    this.instancedGeometry.attributes.instanceVisible.needsUpdate = true;
    this.instancedGeometry.attributes.instanceTarget.needsUpdate = true;
    this.instancedGeometry.attributes.instanceSmile.needsUpdate = true;

    // add text
    let textMesh = this.getText(nickname);
    this.handles.push(textMesh);
    this.scene.add(textMesh);
    this.newBubbleSound.play();
  }

  addBubble() {
    this.currentBubbleIndex = 0;
    let max = this.maximum;
    let instancePositions = [];
    let instanceOffset = [];
    let instanceScale = [];
    let instanceNoise = [];
    let instanceVisible = [];
    let instanceTarget = [];
    let instanceLife = [];
    let instanceSmile = [];

    let bubgeo = b.geometry;

    instancePositions = new Float32Array(max * 3);
    instanceTarget = new Float32Array(max * 3);
    instanceScale = new Float32Array(max);
    instanceOffset = new Float32Array(max);
    instanceNoise = new Float32Array(max);
    instanceVisible = new Float32Array(max);
    instanceLife = new Float32Array(max);
    instanceSmile= new Float32Array(max);

    // adding one first bubble
    // positions
    instancePositions[0] = 0;
    instancePositions[1] = 30;
    instancePositions[2] = -50;

    instanceTarget[0] = 0;
    instanceTarget[1] = 0;
    instanceTarget[2] = -this.z;

    // scales
    instanceScale.fill(0.6);

    // offsets
    instanceOffset.fill(0);

    // offsets
    instanceNoise.fill(1);
    // visible
    instanceVisible[0] = 1;
    instanceVisible[0] = 1;

    this.instancedGeometry = new THREE.InstancedBufferGeometry();
    var vertices = bubgeo.attributes.position.clone();
    this.instancedGeometry.addAttribute('position', vertices);
    // instancedGeometry.attributes.position = cube.attributes.position;
    this.instancedGeometry.attributes.normal = bubgeo.attributes.normal;
    this.instancedGeometry.attributes.uv = bubgeo.attributes.uv;
    this.instancedGeometry.index = bubgeo.index;
    // instancedGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    this.instancedGeometry.addAttribute(
      'instancePosition',
      new THREE.InstancedBufferAttribute(new Float32Array(instancePositions), 3)
    );
    this.instancedGeometry.addAttribute(
      'instanceOffset',
      new THREE.InstancedBufferAttribute(new Float32Array(instanceOffset), 1)
    );
    this.instancedGeometry.addAttribute(
      'instanceScale',
      new THREE.InstancedBufferAttribute(new Float32Array(instanceScale), 1)
    );
    this.instancedGeometry.addAttribute(
      'instanceNoise',
      new THREE.InstancedBufferAttribute(new Float32Array(instanceNoise), 1)
    );
    this.instancedGeometry.addAttribute(
      'instanceVisible',
      new THREE.InstancedBufferAttribute(new Float32Array(instanceVisible), 1)
    );
    this.instancedGeometry.addAttribute(
      'instanceLife',
      new THREE.InstancedBufferAttribute(new Float32Array(instanceLife), 1)
    );
    this.instancedGeometry.addAttribute(
      'instanceTarget',
      new THREE.InstancedBufferAttribute(new Float32Array(instanceTarget), 3)
    );
    this.instancedGeometry.addAttribute(
      'instanceSmile',
      new THREE.InstancedBufferAttribute(new Float32Array(instanceSmile), 1)
    );

    this.instancedMesh = new THREE.Mesh(this.instancedGeometry, b.material);
    // this.instancedMesh = new Mesh( this.instancedGeometry, new MeshBasicMaterial({color:0xff0000}) );
    this.instancedMesh.frustumCulled = false;
    this.instancedMesh.material.uniforms['tCube'].value = this.textureCube1;
    this.instancedMesh.material.uniforms['tMatCap'].value = this.matcap;
    this.instancedMesh.material.uniforms['tSmile'].value = this.smiles[3];
    this.instancedMesh.material.uniforms['tSmile1'].value = this.smiles[1];
    this.instancedMesh.material.uniforms['tSmile2'].value = this.smiles[2];
    this.instancedMesh.material.uniforms['tSmile3'].value = this.smiles[3];
    this.scene.add(this.instancedMesh);
    


    // setTimeout(() => {
    //   // shoud be in start by promise
    //   // this.animateFirst();
    // },1500);
    

    // debug
    // this.scene.add(
    //   new Mesh(
    //     new PlaneBufferGeometry(0.1,0.1),
    //     new MeshBasicMaterial( {color: 0xff0000} )
    //   )
    // );
  }

  animateFirst() {
    let pos = this.instancedGeometry.attributes.instancePosition;

    let tl = new TimelineMax();
    let state = {o:0};
    // let positionObj = {y:25,z:-50};
    // let target = {y:0,z:-4};

    // create text handle
    let firstusername = this.getText('@pixelscommander');
    this.handles.push(firstusername);
    this.scene.add(firstusername);
    firstusername.position.copy(new THREE.Vector3(0,-1.5,-4.6));

    // move ball into vision from far
    tl.to(state, 2, {
      o:1,
      onUpdate: () => {
        pos.array[1] = lerp(25,0, easeOutBack(state.o));
        pos.array[2] = lerp(-50,-4.6, easeOutQuad(state.o));
        pos.needsUpdate = true;
      }
    });
    // run text animation big with text
    tl.add(firsttweetanimation.show.play(),2);
    tl.to(this.settings, 2, {smileProgress: 1,ease: Power3.easeOut}, '-=1.5');
    tl.add(firsttweetanimation.hide.play(),5);
    tl.to(firstusername.position, 0.5, 
      {
        y: 0, 

        onComplete: () => {this.startTwitterIntegration();}
      },'-=0.5');
    tl.fromTo(this.tweetPlease, 1, {y:-200,opacity:0},{y:0,opacity:1},0);

  }

  startTwitterIntegration() {

    this.twitteranimated = true;

    // this.bgmusic = this.bgSound.play();
    this.bgSound.volume(0.3);
    // this.bgSound.fade(0, 1, 2000, this.bgmusic);

    // enable listener for sockets here
  }

  stopTwitterIntegration() {
    this.twitteranimated = false;
    // let tl = new TimelineMax();
    // tl.fromTo(this.tweetPlease, 1, {y:0,opacity:1},{y:-200,opacity:0},0);


    // this.bgmusic = this.bgSound.play();
    // this.bgSound.volume(0.3);
    // this.bgSound.fade(0.3,0,1000);
  }

  prepareVideo() {
    this.video = document.getElementById( 'video' );

    this.videotexture = new THREE.VideoTexture( this.video );
    this.videotexture.minFilter = THREE.LinearFilter;
    this.videotexture.magFilter = THREE.LinearFilter;
    this.videotexture.format = THREE.RGBFormat;

    this.wall.material.uniforms.texture.value = this.videotexture;


  }
  runVideo() {
    // alert('run video');

    this.video.play();
    let tl = new TimelineMax();
    // let tl = new TimelineMax();
    tl.fromTo(this.tweetPlease, 1, {y:0,opacity:1},{y:-200,opacity:0,scale: 0.6},0);
    tl.to(this.settings,4,{revealVideo:0.5},0);
    // run uniform to reveal surface

    // run play on video 
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  play() {
    this.paused = false;
    this.animate();
  }
  pause() {
    this.paused = true;
  }

  kill(mesh) {
    this.scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh = undefined;
  }

  animate() {
    if (this.paused) return;

    this.settings.time += 0.05;

    if(this.wall) {
      this.wall.material.uniforms.reveal.value = this.settings.revealVideo;
    }
    // bubble
    if (this.instancedMesh) {
      this.instancedMesh.material.uniforms.time.value = this.settings.time;
      this.instancedMesh.material.uniforms.smileProgress.value = this.settings.smileProgress;

      let lifes = this.instancedGeometry.attributes.instanceLife;
      let visible = this.instancedGeometry.attributes.instanceVisible;
      let target = this.instancedGeometry.attributes.instanceTarget;
      let pos = this.instancedGeometry.attributes.instancePosition;
      let visibilityUpdate = false;


      if(this.twitteranimated) {
        for (let i = 0; i < lifes.array.length; i++) {
          if (visible.array[i] > 0) {
          


            // life increase, and death
            lifes.array[i] += 0.005;
            if (lifes.array[i] > 1) {
              visible.array[i] = 0;
              visibilityUpdate = true;
              this.currentNumber++;
              this.hitSound.play();
              console.log(this.currentNumber);
              if(this.currentNumber>this.maximum-1) {
                console.log(this.onFinish);
                this.stopTwitterIntegration();
                if(this.onFinish) this.onFinish();
              }
              if (this.handles[i]) this.kill(this.handles[i]);
              this.punchWall(
                new THREE.Vector3(target.array[i * 3], target.array[i * 3 + 1], 0)
              );
            }


            // movement of text handle
            let cubeLife = lifes.array[i]*lifes.array[i]*lifes.array[i];
            // this.handles[i].position.z = -cubeLife * this.z;
            // console.log(pos.array[i * 3 + 2],'zzzz',lerp(
            //   pos.array[i * 3 + 2],
            //   -this.z,
            //   cubeLife
            // ),this.handles[0].position.z);
            this.handles[i].position.z = lerp(
              pos.array[i * 3 + 2],
              -this.z,
              cubeLife
            );
            this.handles[i].position.x = lerp(
              pos.array[i * 3],
              target.array[i * 3],
              cubeLife
            );
            this.handles[i].position.y = lerp(
              pos.array[i * 3 + 1],
              target.array[i * 3 + 1],
              cubeLife
            );

          }
        }
      
        lifes.needsUpdate = true;
      }
      if(visibilityUpdate) visible.needsUpdate = true;
    }

    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}

module.exports = Sketch;
