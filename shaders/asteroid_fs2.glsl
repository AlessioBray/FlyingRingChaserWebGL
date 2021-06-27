#version 300 es
precision highp float;

in vec3 fsNormal; 
in vec4 fsPosition;
in vec2 fsUV;
in vec3 fsTangentLightPos;
in vec3 fsTangentViewPos;
in vec3 fsTangentFragPos;

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

// Maps
uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
uniform sampler2D depthMap;

uniform float heightScale;

//texture
uniform sampler2D in_texture;

out vec4 outColor;

//computes the lambert diffuse
vec3 lambertDiffuse(vec3 lightDir, vec3 lightCol, vec3 normalVec) {
    vec3 diffL = lightCol * clamp(dot(normalVec, lightDir), 0.0, 1.0);
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

    outColor = color;// * texture(in_texture, fsUV); // vec4(rgba.rgb, 1.0);

}

vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
{ 
    // number of depth layers
    const float minLayers = 8;
    const float maxLayers = 32;
    float numLayers = mix(maxLayers, minLayers, abs(dot(vec3(0.0, 0.0, 1.0), viewDir)));  
    // calculate the size of each layer
    float layerDepth = 1.0 / numLayers;
    // depth of current layer
    float currentLayerDepth = 0.0;
    // the amount to shift the texture coordinates per layer (from vector P)
    vec2 P = viewDir.xy / viewDir.z * heightScale; 
    vec2 deltaTexCoords = P / numLayers;
  
    // get initial values
    vec2  currentTexCoords     = texCoords;
    float currentDepthMapValue = texture(depthMap, currentTexCoords).r;
      
    while(currentLayerDepth < currentDepthMapValue)
    {
        // shift texture coordinates along direction of P
        currentTexCoords -= deltaTexCoords;
        // get depthmap value at current texture coordinates
        currentDepthMapValue = texture(depthMap, currentTexCoords).r;  
        // get depth of next layer
        currentLayerDepth += layerDepth;  
    }
    
    // get texture coordinates before collision (reverse operations)
    vec2 prevTexCoords = currentTexCoords + deltaTexCoords;

    // get depth after and before collision for linear interpolation
    float afterDepth  = currentDepthMapValue - currentLayerDepth;
    float beforeDepth = texture(depthMap, prevTexCoords).r - currentLayerDepth + layerDepth;
 
    // interpolation of texture coordinates
    float weight = afterDepth / (afterDepth - beforeDepth);
    vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords * (1.0 - weight);

    return finalTexCoords;
}

void main()
{           
    // offset texture coordinates with Parallax Mapping
    vec3 viewDir = normalize(fsTangentViewPos - fsTangentFragPos);
    vec2 texCoords = fsUV;
    
    texCoords = ParallaxMapping(fsUV,  viewDir);       
    if(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0)
        discard;

    // obtain normal from normal map
    vec3 normal = texture(normalMap, texCoords).rgb;
    normal = normalize(normal * 2.0 - 1.0);   
   
    // get diffuse color
    vec3 color = texture(diffuseMap, texCoords).rgb;
    // ambient
    vec3 ambient = 0.1 * color;

    
    // diffuse
    vec3 lightDir = normalize(fs_in.TangentLightPos - fs_in.TangentFragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * color;
    // specular    
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);

    vec3 specular = vec3(0.2) * spec;
    FragColor = vec4(ambient + diffuse + specular, 1.0);
}