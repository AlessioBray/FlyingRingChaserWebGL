var fs = `#version 300 es
precision mediump float;

in vec3 fs_norm;

uniform vec3 specularColor;
uniform float specShine;
uniform vec3 mDiffColor;
uniform vec3 emit;

//directional light A
uniform vec3 lightDirectionA; 
uniform vec3 lightColorA;

//directional light B
uniform vec3 lightDirectionB; 
uniform vec3 lightColorB;

//ambient
uniform vec3 ambientLightCol;
uniform vec3 ambientMat;

out vec4 outColor;

//computes the lambert diffuse
vec3 lambertDiffuse(vec3 lightDir, vec3 lightCol, vec3 normalVec) {
  vec3 diffL = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0);
  return diffL;
}

void main() {
  
  //normalize fsNormal, it might not be in the normalized form coming from the vs
  vec3 nNormal = normalize(fs_norm);
  
  //light directions
  vec3 lDirA = normalize(lightDirectionA); 
  vec3 lDirB = normalize(lightDirectionB);

  //computing Lambert diffuse color
  //directional lights
  vec3 diffA = lambertDiffuse(lDirA,lightColorA,nNormal);
  vec3 diffB = lambertDiffuse(lDirB,lightColorB,nNormal);

  //total lambert component
  vec3 lambertDiff = clamp((mDiffColor*(diffA + diffB)), 0.0, 1.0);

  //computing ambient color
  vec3 ambient = ambientLightCol * ambientMat;
  
  //computing BRDF color
  vec4 color = vec4(clamp(lambertDiff + ambient + emit, 0.0, 1.0).rgb,1.0);
  
  outColor = color;
}`;

