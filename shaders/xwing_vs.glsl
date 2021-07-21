#version 300 es

in vec3 inPosition; 
in vec3 inNormal;
in vec2 inUV;

out vec3 fsNormal; 
out vec4 fsPosition;
out vec4 fsCamera;
out vec2 fsUV;

uniform mat4 worldViewProjectionMatrix; // World view rojection matrix (passed in js as transpose to match the glsl convention)
uniform mat4 worldMatrix; // world matrix (passed in js as transpose to match the glsl convention)
uniform mat4 normalMatrix; //normal matrix (passed in js as transpose to match the glsl convention)

uniform vec4 cameraPosition;

void main() {

    fsNormal = mat3(normalMatrix) * inNormal;           // World space as Shading Space
    fsPosition = (worldMatrix * vec4(inPosition, 1.0)); // World space as Shading Space

    fsCamera = cameraPosition;
    fsUV = vec2(inUV.x, 1.0 - inUV.y);

    gl_Position = worldViewProjectionMatrix * vec4(inPosition, 1.0);

}