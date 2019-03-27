uniform float time;
uniform float scale;

uniform float progress;


uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec2 pixels;
uniform vec2 uvRate1;
uniform int vortex;


uniform float wTime[10];
uniform float wLength[10];
uniform float wHeight[10];
uniform vec3 wPosition[10];


attribute vec3 shifted;
attribute vec3 centroid;
attribute vec3 controlpoint1;
attribute vec3 controlpoint2;
attribute vec3 instancePosition;

attribute vec3 instanceColor;
attribute float offset;
attribute float offset1;

varying float voffset;
varying vec2 vUv;
varying vec3 vColor;
varying vec3 vPosition;
varying float vRotation;
varying vec3 vNormal;
varying float vProgress;
varying float dProgress;

float getWaveHeight(vec3 pos, vec3 rCenter, float wH, float wF, float wL) {
    float dist = distance(pos, rCenter);
    float distWave = distance(dist, wF);
    float rOffset = 0.0;
    if(distWave < wL) {

        float t = (dist - wF + wL)/wL; // 0 ~ waveLength * 2.0;
        rOffset = -cos(t*3.1415) + 1.0;
    }

    

    vec3 tmpPos = normalize(pos);
    // return tmpPos * rOffset * wH;
    return rOffset*wH;
}


mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

vec3 bezier4(vec3 a, vec3 b, vec3 c, vec3 d, float t) {
  return mix(mix(mix(a, b, t), mix(b, c, t), t), mix(mix(b, c, t), mix(c, d, t), t), t);
}

float easeInOutQuint(float t){
  return t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 + 16.0 * (--t) * t * t * t * t;
}


void main() {
  // vColor = offset;
  vNormal = normal;
  vColor = instanceColor;
  // offset = instanceOffset;
    vUv = uv;
    vPosition = position.xyz;
    
    vec3 newposition = position;

    float tProgress = 0.;

    tProgress = easeInOutQuint(min(1.0, max(0.0, (progress - offset1*0.4) /0.6)));

    // tProgress = progress;
    vProgress = tProgress;


    // float tProgress = easeInOutQuint(min(1.0, max(0.0, (progress - (position.y/2. + position.x/2.+0.5)*0.5)) /0.6));
    // float tProgress = easeInOutQuint(min(1.0, max(0.0, (progress - (0.7 - length(centroid))*0.5)) /0.6));
    // vRotation = tProgress*6.28;

// newposition += vec3(tProgress);
  
  // vec3 newposition = mix(position,controlpoint1 + position,progress);
  
    // newposition = rotate(position - centroid,vec3(0.,1.,1.),tProgress*3.14*2.) + centroid;
  

    float wave = 0.0; 
    vProgress = 0.;
    for(int i=0; i<10; i++) {
        wave += getWaveHeight(position,wPosition[i],wHeight[i],wTime[i],wLength[i]);

    }

     // newposition.z  = position.z + wave*(1. + offset/2.);
     // vProgress += step(length(wPosition[0] - position), 2.*wTime[0]);
     dProgress = smoothstep(0.1,0., length(wPosition[0] - position) - progress*1.41 + 0.1 + offset/15.);
     // dProgress = length(wPosition[0] - position);
     dProgress = wave;

     // newposition = rotate(position - centroid,vec3(1.,1.,0.),dProgress*3.1415926*2.) + centroid;
     newposition.z =  newposition.z + (0.5 + offset)*sin(dProgress*3.14)/3.;
     // add scale to rotated
     
    vProgress = wave;
  // newposition.z = sin(3.14*tProgress)/10.;
  // position+ move
  // newposition = bezier4(newposition, controlpoint1, controlpoint2, shifted, tProgress);

    // newposition = rotate(centroid,vec3(0.,0.,1.),0.3) + centroid + newposition ;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newposition, 1.0 );
}