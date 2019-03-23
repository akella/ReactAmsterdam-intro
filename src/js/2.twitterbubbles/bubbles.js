import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js';
import { Scene } from 'three/src/scenes/Scene.js';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
import { Raycaster } from 'three/src/core/Raycaster.js';
import {
  RepeatWrapping,
  FloatType,
  DoubleSide,
  RGBAFormat,
  AdditiveBlending,
  NearestFilter,
  ClampToEdgeWrapping
} from 'three/src/constants';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import {
  PlaneBufferGeometry,
  PlaneGeometry
} from 'three/src/geometries/PlaneGeometry';
import {
  SphereBufferGeometry,
  SphereGeometry
} from 'three/src/geometries/SphereGeometry';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BufferAttribute } from 'three/src/core/BufferAttribute';
import { Mesh } from 'three/src/objects/Mesh';
import { Group } from 'three/src/objects/Group';
import { Points } from 'three/src/objects/Points';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { InstancedBufferGeometry } from 'three/src/core/InstancedBufferGeometry';
import { InstancedBufferAttribute } from 'three/src/core/InstancedBufferAttribute';
import { CubeTextureLoader } from 'three/src/loaders/CubeTextureLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';


import * as dat from 'dat.gui';


import b from './bubble/bubble.js';



class Sketch {
  constructor(selector, analyser) {
    this.container = document.getElementById(selector);
    this.scene = new Scene();

    this.renderer = new WebGLRenderer({ alpha: true,antialias: true });
    this.raycaster = new Raycaster();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer.setClearColor( 0xeeeeee, 0 );
    this.scale = 0;
		
    if(analyser) {
      this.analyser = analyser;
      this.analyserNode = analyser.analyser;
    };

    this.container.appendChild(this.renderer.domElement);

    this.camera = new PerspectiveCamera(
      70,
      this.container.offsetWidth/ this.container.offsetHeight,
      0.001, 1000
    );
    this.camera.position.set( 0, 0, 4.5);
    
    this.time = 0;
    this.paused = true;
    this.currentWave = 0;
  }

  initiate(cb) {
    // promise!
    let promises = [this.setupcubeTexture(),this.loadMatCap()];

    Promise.all(promises).then(() => {
      this.addBubble();

      this.animate();
      
      this.punch();
      cb();
    });
  
    
    this.setupResize();
    this.resize();
    this.settings();
    
    

  }






  punch() {
    let that = this;

    // reset
    this.sphere = new Mesh(new SphereBufferGeometry( 1, 48, 48 ), new MeshBasicMaterial( { color: 0x2194CE } ));
    // this.scene.add(this.plane);
    this.container.addEventListener('click',(e) => {
      let mouse = {};
      // console.log(event,e);
      let viewportOffset = this.renderer.domElement.getBoundingClientRect();
      mouse.x = ( (event.clientX - viewportOffset.left) / this.container.getBoundingClientRect().width ) * 2 - 1;
      mouse.y = - ( (event.clientY - viewportOffset.top) / this.container.getBoundingClientRect().height ) * 2 + 1;
      // console.log(event.clientX - viewportOffset.left, this.renderer.domElement.clientWidth,this.container.getBoundingClientRect().width);
      that.raycaster.setFromCamera( mouse, that.camera);

      let intersects = that.raycaster.intersectObjects( [that.sphere] );

      if ( intersects.length > 0 ) {

        let p = intersects[ 0 ].point;
        let waveIndex = that.currentWave;
        that.instancedMesh.material.uniforms.wPosition.value[waveIndex] = new Vector3(p.x,p.y,p.z);
        let fake = {
          wHeight: 0.04,
          wTime: 0.0,
          wLength: 0.15,
        };
        let tl = new TimelineMax({onUpdate: function() {
          that.instancedMesh.material.uniforms.wHeight.value[waveIndex] = fake.wHeight;
          that.instancedMesh.material.uniforms.wTime.value[waveIndex] = fake.wTime;
          that.instancedMesh.material.uniforms.wLength.value[waveIndex] = fake.wLength;
        }});
        tl
          .to(fake,5,{
            wHeight:0,
            wTime:0.7,
            wLength:0.3,
            ease: Expo.easeOut,
          });
        that.currentWave = (that.currentWave + 1)%10;

      }
    });
  }



  settings() {
    // @todo cut geometry to change number of dots
    let that = this;
    this.settings = {
      waveIndex: 0,
      startProgress: 0,
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
      green: 0,
    };
		

    this.gui = new dat.GUI();
    // this.gui.add(this.settings, 'startProgress', 0,1, 0.01);

		
  }



  setupcubeTexture() {
    let that = this;
    let path = 'img/newsky/';
    let format = '.jpg';
    let urls1 = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
    ];

    return new Promise(resolve => {
      that.textureCube1 = new CubeTextureLoader().load( urls1, resolve );
    });
    // this.textureCube1.format = THREE.RGBFormat;
  }



  loadMatCap() {
    let that = this;
    return new Promise(resolve => {
      that.matcap = new TextureLoader().load( 'img/matcap.jpg', resolve );
    });
  }


  addBubble() {

    let instances = 3;
    let instancePositions = [];
    let instanceOffset = [];
    let instanceScale = [];
    let instanceNoise = [];

    let bubgeo = b.geometry;


    // positions
    instancePositions.push(0,0,0);
    instancePositions.push(0.6,-0.6,0.9);
    instancePositions.push(1.3,-0.25,0.9);

    // scales
    instanceScale.push(1);
    instanceScale.push(0.13);
    instanceScale.push(0.08);

    // offsets
    instanceOffset.push(0);
    instanceOffset.push(0.5);
    instanceOffset.push(1);

    // offsets
    instanceNoise.push(1);
    instanceNoise.push(0);
    instanceNoise.push(0);


    this.instancedGeometry = new InstancedBufferGeometry();
    var vertices = bubgeo.attributes.position.clone();
    this.instancedGeometry.addAttribute( 'position', vertices );
    // instancedGeometry.attributes.position = cube.attributes.position;
    this.instancedGeometry.attributes.normal = bubgeo.attributes.normal;
    this.instancedGeometry.index = bubgeo.index;
    // instancedGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    this.instancedGeometry.addAttribute( 'instancePosition', new InstancedBufferAttribute( new Float32Array( instancePositions ), 3 ) );
    this.instancedGeometry.addAttribute( 'instanceOffset', new InstancedBufferAttribute( new Float32Array( instanceOffset ), 1 ) );
    this.instancedGeometry.addAttribute( 'instanceScale', new InstancedBufferAttribute( new Float32Array( instanceScale ), 1 ) );
    this.instancedGeometry.addAttribute( 'instanceNoise', new InstancedBufferAttribute( new Float32Array( instanceNoise ), 1 ) );


    this.instancedMesh = new Mesh( this.instancedGeometry, b.material );
    this.instancedMesh.material.uniforms[ 'tCube' ].value = this.textureCube1;
    this.instancedMesh.material.uniforms[ 'tMatCap' ].value = this.matcap;
    this.scene.add( this.instancedMesh );
  }

  setBallsPositions(ar) {
    // let ar = [
    //   0,0,0,
    //   0.6,-0.6,0.9,
    //   -1.3,-0.45,0.9
    // ];
    // setBallsPositions([
    //   0,0,0,
    //   0.6,-0.6,0.9,
    //   -1.3,-0.45,0.9
    // ])
    let len = this.instancedGeometry.attributes.instancePosition.array.length;

    for (let i = 0; i < len; i++) {
      this.instancedGeometry.attributes.instancePosition.array[i] = ar[i];
    }
    this.instancedGeometry.attributes.instancePosition.needsUpdate = true;
  }
  

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this)); 
  }

  resize() {
    var w = this.container.offsetWidth;
    var h = this.container.offsetHeight;
    this.renderer.setSize( w, h );
    this.camera.aspect = w / h;

    //this.camera.fov = 2 * Math.atan( 2 / ( 2 * 2.5 ) ) * ( 180 / Math.PI );
    this.camera.fov = 2 * Math.atan( ( 2 / this.camera.aspect ) / ( 2 * 2.5 ) ) * ( 180 / Math.PI ); // in degrees
    this.camera.updateProjectionMatrix();
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


  animate() {


		 if(this.paused) return;
		 
    this.settings.time += 0.05;
     
    // bubble
    if(this.instancedMesh) {
      this.instancedMesh.material.uniforms.time.value = this.settings.time;
      this.instancedMesh.material.uniforms.mRefractionRatio.value = this.settings.mRefractionRatio;
      this.instancedMesh.material.uniforms.mFresnelBias.value = this.settings.mFresnelBias;
      this.instancedMesh.material.uniforms.mFresnelPower.value = this.settings.mFresnelPower;
      this.instancedMesh.material.uniforms.mFresnelScale.value = this.settings.mFresnelScale;
    }
     



 
    // this.material.uniforms.uTime.value = this.time/100;
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}

module.exports = Sketch;
