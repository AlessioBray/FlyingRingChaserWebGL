#version 300 es
precision highp float;

in vec3 fsNormal;
in vec4 fsPosition;
in vec2 fsUV;

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

// inverseprojmatrix
uniform mat4 matrix;

//texture
uniform sampler2D in_texture;

out vec4 outColor;

//computes the lambert diffuse
vec3 lambertDiffuse(vec3 lightDir, vec3 lightCol, vec3 normalVec) {
    vec3 diffL = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0);
    return diffL;
}

//computes the blinn specular
vec3 blinnSpecular(vec3 lightDir, vec3 lightCol, vec3 normalVec, vec4 fsPosition, float specShine) {
    // camera space implies eye position to be (0,0,0)
    vec4 eyePosition = vec4(0.0, 0.0, 0.0, 0.0);   // what is eyePos in world space??
    vec3 eyeDir = vec3(normalize(eyePosition - fsPosition));
    vec3 halfVec = normalize(eyeDir + lightDir);
    vec3 specularBl = pow(max(dot(halfVec, normalVec), 0.0), specShine) * lightCol;

    return specularBl;
}

void main() {
  
    //normalize fsNormal, it might not be in the normalized form coming from the vs
    vec3 nNormal = normalize(fsNormal);
    //light directions
    vec3 lDirA = normalize(-lightDirectionA); 
    vec3 lDirB = normalize(-lightDirectionB);
  
    //computing Lambert diffuse color
    //directional lights
    vec3 diffA = lambertDiffuse(lDirA, lightColorA, nNormal);
    vec3 diffB = lambertDiffuse(lDirB, lightColorB, nNormal);

    //total lambert component
    vec3 lambertDiff = clamp((mDiffColor*(diffA + diffB)), 0.0, 1.0);

    //computing Blinn specular color
    vec3 specA = blinnSpecular(lDirA, lightColorA, nNormal, fsPosition, specShine);
    vec3 specB = blinnSpecular(lDirB, lightColorB, nNormal, fsPosition, specShine);
    //total specular component
    vec3 blinnSpec = specularColor * (specA + specB);

    //computing ambient color
    vec3 ambient = ambientLightCol * ambientMat;
  
    //computing BRDF color
    vec4 color = vec4(clamp(blinnSpec + lambertDiff + ambient + emit, 0.0, 1.0).rgb,1.0);
  
    //vec4 outColorfs = color ;
  
    outColor = color;// * texture(in_texture, fsUV); // vec4(rgba.rgb, 1.0);
}