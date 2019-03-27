import * as THREE from 'three';
import tvertex from './vertex.glsl';
import tfragment from './fragment.glsl';

export default class Wall {
  constructor() {
  	this.currentWave = 0;
  	this.z = -50;
  	// this.z = -3;
  	this.scale = 10.5;
  	// this.scale = 2;
  	this.number = 135;
  }
  getMesh() {
    let number = this.number;
    let z = this.z;
    let scale = this.scale;

    let can = document.createElement('canvas');
    can.width = window.innerWidth;
    can.height = window.innerWidth;
    // let ctx = can.getContext('2d');
    // ctx.fillStyle = '#ffffff';
    // ctx.fillRect(0,0, can.width,can.height);
    // document.body.appendChild(can);

    let gran = can.width / number;
    let granH = (gran * Math.sqrt(3)) / 2;
    let rows = can.height / granH;

    let positions = [];
    let offsets = [];
    let offsets1 = [];
    let uvs = [];
    let centroids = [];
    let currentShift = 0;
    let currentheight = 0;
    let numberOfTriangles = 0;
    for (let j = 0; j < rows; j++) {
      currentheight = j * granH;
      if (j % 2 === 1) {
        currentShift = -gran / 2;
      } else {
        currentShift = 0;
      }
      for (let i = 0; i <= number; i++) {
        positions.push([
          scale * (i * gran + currentShift - can.width / 2),
          scale * (currentheight - can.height / 2),
          z
        ]);
        positions.push([
          scale * (i * gran + gran / 2 + currentShift - can.width / 2),
          scale * (granH + currentheight - can.height / 2),
          z
        ]);
        positions.push([
          scale * (i * gran - gran / 2 + currentShift - can.width / 2),
          scale * (granH + currentheight - can.height / 2),
          z
        ]);

        positions.push([
          scale * (i * gran + currentShift - can.width / 2),
          scale * (currentheight - can.height / 2),
          z
        ]);
        positions.push([
          scale * (i * gran + gran + currentShift - can.width / 2),
          scale * (currentheight - can.height / 2),
          z
        ]);
        positions.push([
          scale * (i * gran + gran / 2 + currentShift - can.width / 2),
          scale * (granH + currentheight - can.height / 2),
          z
        ]);

        numberOfTriangles += 2;
      }
    }

    let flatpositions = [];
    for (let i = 0; i < positions.length; i++) {
      flatpositions.push(
        (scale * positions[i][0]) / can.width,
        (scale * positions[i][1]) / can.height,
        positions[i][2]
      );
      uvs.push(
        (positions[i][0] / scale + can.width / 2) / can.width,
        (positions[i][1] / scale + can.height / 2) / can.height
      );
    }

    // get random offsets, @TODO - not random
    for (let i = 0; i < positions.length; i = i + 3) {
      let rand = Math.random();
      let centroidX =
        (positions[i][0] / can.width +
          positions[i + 1][0] / can.width +
          positions[i + 2][0] / can.width) /
        3;
      let centroidY =
        (positions[i][1] / can.height +
          positions[i + 1][1] / can.height +
          positions[i + 2][1] / can.height) /
        3;
      centroids.push(
        centroidX,
        centroidY,
        0,
        centroidX,
        centroidY,
        0,
        centroidX,
        centroidY,
        0
      );
      offsets.push(rand, rand + 0.02, rand + 0.02);
      offsets1.push(rand, rand, rand);
    }

    let bufGeometry = new THREE.BufferGeometry();
    let vertices = new Float32Array(flatpositions);
    let uvsfinal = new Float32Array(uvs);
    offsets = new Float32Array(offsets);
    offsets1 = new Float32Array(offsets1);
    centroids = new Float32Array(centroids);

    bufGeometry.addAttribute(
      'position',
      new THREE.BufferAttribute(vertices, 3)
    );
    bufGeometry.addAttribute('offset', new THREE.BufferAttribute(offsets, 1));
    bufGeometry.addAttribute('offset1', new THREE.BufferAttribute(offsets1, 1));
    bufGeometry.addAttribute(
      'centroid',
      new THREE.BufferAttribute(centroids, 3)
    );
    bufGeometry.addAttribute('uv', new THREE.BufferAttribute(uvsfinal, 2));

    let wTime = [];
    let wHeight = [];
    let wLength = [];
    let wPosition = [];

    for (let i = 0; i < 10; i++) {
      wTime.push(0);
      wLength.push(0);
      wHeight.push(0);
      wPosition.push(new THREE.Vector3(0, 0, 0));
    }
    console.log(wLength);

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable'
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0 },
        scale: { type: 'f', value: 0 },
        progress: { type: 'f', value: 0 },
        offset: { type: 'f', value: 0 },
        vortex: { type: 'i', value: 0 },
        texture: {
          type: 't',
          value: new THREE.TextureLoader().load('img/video.jpg')
        },
        // texture1: {type: 't', value: new THREE.TextureLoader().load('img/2.png')},
        // texture2: {type: 't', value: new THREE.TextureLoader().load('img/1.png')},

        wTime: { type: 'fv1', value: wTime },
        wHeight: { type: 'fv1', value: wHeight },
        wLength: { type: 'fv1', value: wLength },
        wPosition: { type: 'v3v', value: wPosition }
      },
      // wireframe: true,
      vertexShader: tvertex,
      fragmentShader: tfragment,
      flatshading: THREE.FlatShading
    });

    let mesh = new THREE.Mesh(bufGeometry, this.material);

    // let meshio = new THREE.Mesh(
    //   new THREE.PlaneBufferGeometry(1,1),
    //   new THREE.MeshBasicMaterial( {color: 0xff0000} )
    // );
    return mesh;
  }

  punch(p) {
  	console.log(p);
  	let material = this.material;
  	let waveIndex = this.currentWave;
  	material.uniforms.wPosition.value[waveIndex] = new THREE.Vector3(p.x,p.y,this.z);
  	let fake = {
  	  wHeight: 0.02*this.scale,
  	  wTime: 0.0,
  	  wLength: 0.1*this.scale,
  	};
  	let tl = new TimelineMax({onUpdate: function() {
  	  material.uniforms.wHeight.value[waveIndex] = fake.wHeight;
  	  material.uniforms.wTime.value[waveIndex] = fake.wTime;
  	  material.uniforms.wLength.value[waveIndex] = fake.wLength;
  	}});
  	tl
  	  .to(fake,3,{
  	    wHeight:0.0,
  	    wTime:3.1*this.scale,
  	    wLength:2.6*this.scale,
  	    ease: Expo.easeOut,
  	  });
  	this.currentWave = (this.currentWave + 1)%10;
  }
}
