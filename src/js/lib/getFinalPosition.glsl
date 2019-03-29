#pragma glslify: cnoise = require(../lib/noise.glsl)

float ease(float c){
    return 2.*c - c*c;
}

vec3 getFinalPosition(vec3 pos,float time, float koef, float scaleCompensation, float noiseScale) {
  	float temp = time/30.;

    vec3 npos = normalize(pos);
    // vec3 noisePos = pos*0.45;
    vec3 noisePos1 = scaleCompensation*pos*5.05;
    // vec3 noisePos2 = pos*2.05;

    // float noiseval = cnoise(noisePos + vec3(temp*mix(2.5,1.,ease(scaleCompensation))));
    // float noiseval = cnoise(noisePos + vec3(temp));
    float noiseval1 = cnoise(noisePos1 + vec3(temp*3.));
    // float noiseval2 = cnoise(noisePos2 + vec3(temp*2.));



    
    // vec3 posOffset = npos * noiseval;
    // for small bubble
    vec3 posOffset1 = npos * noiseval1;
    // for big bubble
    // vec3 posOffset2 = npos * noiseval2;

    // float mainNoiseKoef = mix(0.1,mix(1.5,0.1,scaleCompensation), koef);
    // float mainNoiseKoef = mix(0.1,noiseScale, koef);

    return pos  + posOffset1*0.03;
}

#pragma glslify: export(getFinalPosition)
