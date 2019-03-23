// #pragma glslify: cnoise = require(../lib/noise.glsl)
#pragma glslify: getFinalPosition = require(../../lib/getFinalPosition.glsl)
uniform float mRefractionRatio;
uniform float mFresnelBias;
uniform float mFresnelScale;
uniform float mFresnelPower;
uniform float time;

uniform float startProgress;
uniform float scaleMain;
uniform float noiseMode;
uniform float noiseScale;

// waves
uniform float wTime[10];
uniform float wLength[10];
uniform float wHeight[10];
uniform vec3 wPosition[10];


varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

varying vec3 eye;
varying vec3 vNormal;
// varying vec3 vPosition;

attribute vec3 instancePosition;
attribute float instanceOffset;
attribute float instanceScale;
attribute float instanceNoise;


vec3 getWaveHeight(vec3 pos, vec3 rCenter, float wH, float wF, float wL) {
    float dist = distance(pos, rCenter);
    float distWave = distance(dist, wF);
    float rOffset = 0.0;
    if(distWave < wL) {

        float t = (dist - wF + wL)/wL; // 0 ~ waveLength * 2.0;
        rOffset = -cos(t*3.1415) + 1.0;
    }

    

    vec3 tmpPos = normalize(pos);
    return tmpPos * rOffset * wH;
}


vec3 getPosition(vec3 values) {
	// return values;
    return normalize(values); 
} 

vec3 getFinalPositionWithWave(vec3 pos,float time, float koef, float scaleCompensation, float noiseScale) {
	vec3 withoutWave = getFinalPosition(pos,time,koef, scaleCompensation, noiseScale);
	vec3 wave = vec3(0.0); 
	for(int i=0; i<10; i++) {
	    wave += getWaveHeight(pos,wPosition[i],wHeight[i],wTime[i],wLength[i]);
	}
	return withoutWave + wave*instanceNoise;
}





void main() {

	float currentScale = mix(0.01, instanceScale,scaleMain);
	
	float temp = time + 50.*instanceOffset;
	// temp = 0.;
	float minigap = 0.002;
	minigap = 0.001;
	vec3 pos = getPosition(position);
	vec3 p0  = getPosition(vec3(position.x+minigap, position.y, position.z));
	vec3 p1  = getPosition(vec3(position.x, position.y+ minigap, position.z ));


	vec3 finalPos  = getFinalPositionWithWave(pos,temp,instanceNoise,currentScale,noiseScale);
	vec3 finalPos0 = getFinalPositionWithWave(p0,temp,instanceNoise,currentScale,noiseScale);
    vec3 finalPos1 = getFinalPositionWithWave(p1,temp,instanceNoise,currentScale,noiseScale);

    vec3 v0 = finalPos0 - finalPos;
    vec3 v1 = finalPos1 - finalPos;


    if(position.z<0.01 && abs(position.x)>0.01){
    	vec3 p2,p3;
    	if(position.x<0.01){
			p2  = getPosition(vec3(position.x, position.y, position.z));
			p3  = getPosition(vec3(position.x, position.y -minigap*3., position.z - minigap*3.));
		} else{
			p2  = getPosition(vec3(position.x, position.y, position.z));
			p3  = getPosition(vec3(position.x + minigap, position.y -minigap, position.z + minigap));
		}
    	
	    vec3 newp = getFinalPositionWithWave(p2,temp,instanceNoise,currentScale,noiseScale);
	    vec3 newp0 = getFinalPositionWithWave(p3,temp,instanceNoise,currentScale,noiseScale);
	    v0 = newp - newp0;
    } else{
    	if(position.z<0.01 && abs(position.x)<0.01){
	    	v0 = finalPos1 - finalPos;
	    	v1 = finalPos0 - finalPos;
    	}
    }
    // account for normals on the edfe @TODO
    // if(abs(position.z)<0.5) {
    //     float gap = 0.01;

    //     if(position.y < 0.0) {
    //         pos = getPosition(vec3(position.x, position.y+gap, position.z + 0.02));
    //         p0  = getPosition(vec3(position.x+0.01, position.y+gap, position.z ));
    //     } else {
    //         pos = getPosition(vec3(position.x, position.y, position.z + 0.3));
    //         p0  = getPosition(vec3(position.x+0.3, position.y, position.z + 0.02 ));
    //     }

    //     // pos = getPosition(vec3(position.x, position.y+gap, position.z +0.02));
    //     // p0  = getPosition(vec3(position.x+0.01, position.y+gap, position.z));

    //     vec3 newP = getFinalPosition(pos,time);
    //     vec3 newP0 = getFinalPosition(p0,time);
    //     v1 = newP0 - newP;
    // } 
    // end



	vec3 vCross = cross(v0, v1);
	

	vec3 newposition = position;
	// scale
	finalPos *= currentScale;
	//position
	finalPos += instancePosition;


	// move small balls in 
	vec3 circleMove = vec3(sin(time/10. + instanceOffset*5.), cos(time/5. + instanceOffset*5.),0.);
	finalPos += mix(circleMove*0.01, vec3(0.), instanceNoise);

	vec4 mvPosition = modelViewMatrix * vec4( finalPos, 1.0 );

	//  fresnel calculations
	vec4 worldPosition = modelMatrix * vec4( finalPos, 1.0 );
	vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
	vec3 I = worldPosition.xyz - cameraPosition;
	vReflect = reflect( I, worldNormal );
	vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );
	vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );
	vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );
	vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );
	// matcap stuff
	eye = normalize( vec3( modelViewMatrix * vec4( finalPos, 1.0 ) ) );
  	vNormal = normalize( normalMatrix * vCross );

	gl_Position = projectionMatrix * mvPosition;
}