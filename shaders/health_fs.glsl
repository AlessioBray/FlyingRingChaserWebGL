#version 300 es
precision highp float;

in vec3 fsNormal;
in vec4 fsPosition;
in vec4 fsCamera;

// Directional light A
uniform vec3 lightDirectionA; 
uniform vec3 lightColorA;

// Directional light B
uniform vec3 lightDirectionB; 
uniform vec3 lightColorB;

const vec3 diffColor = vec3(0.48, 1, 0);

// Define specular component of color
const vec3 specularColor = vec3(0, 1, 0.22);
const float specShine = 16.0;

const vec3 emit = vec3(0);

// Ambient
const vec3 ambientLightCol = vec3(0.4, 0.4, 0.4); 
const vec3 ambientMat = vec3(0.48, 1, 0);

out vec4 outColor;

// Computes the lambert diffuse
vec3 lambertDiffuse(vec3 lightDir, vec3 lightCol, vec3 normalVec) {
    vec3 diffL = lightCol * diffColor * clamp(dot(normalVec, lightDir), 0.0, 1.0);
    return diffL;
}

// Computes the blinn specular
vec3 blinnSpecular(vec3 lightDir, vec3 lightCol, vec3 normalVec, vec4 fsPosition, float specShine) {
    
    vec4 eyePosition = fsCamera;
    vec3 eyeDir = vec3(normalize(eyePosition - fsPosition));
    vec3 halfVec = normalize(eyeDir + lightDir);
    vec3 specularBl = pow(max(dot(halfVec, normalVec), 0.0), specShine) * lightCol * specularColor;
    
    return specularBl;
}

void main() {
  
    // Normalize fsNormal, it might not be in the normalized form coming from the vs
    vec3 nNormal = normalize(fsNormal);

    // Light directions
    vec3 lDirA = normalize(-lightDirectionA); 
    vec3 lDirB = normalize(-lightDirectionB);
  
    // Computing Lambert diffuse color
    vec3 diffA = lambertDiffuse(lDirA, lightColorA, nNormal);
    vec3 diffB = lambertDiffuse(lDirB, lightColorB, nNormal);

    // Total lambert component
    vec3 lambertDiff = clamp((diffA + diffB), 0.0, 1.0);

    // Computing Blinn specular color
    vec3 specA = blinnSpecular(lDirA, lightColorA, nNormal, fsPosition, specShine);
    vec3 specB = blinnSpecular(lDirB, lightColorB, nNormal, fsPosition, specShine);

    // Total specular component
    vec3 blinnSpec = specA + specB;

    // Computing ambient color
    vec3 ambient = ambientLightCol * ambientMat;
  
    // Computing BRDF color
    vec4 color = vec4(clamp(blinnSpec + lambertDiff + ambient + emit, 0.0, 1.0).rgb, 1.0);
  
    outColor = color;

}