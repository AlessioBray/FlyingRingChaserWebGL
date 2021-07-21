#version 300 es

in vec3 inPosition; 
in vec3 inNormal;

out vec3 fsNormal; 
out vec4 fsPosition;
out vec4 fsCamera;

uniform mat4 worldViewProjectionMatrix; // World view projection matrix (passed in js as transpose to match the glsl convention)
uniform mat4 worldMatrix; // World matrix (passed in js as transpose to match the glsl convention)
uniform mat4 normalMatrix; // Normal matrix (passed in js as transpose to match the glsl convention)

uniform vec4 cameraPosition;

void main() {

    fsNormal = mat3(normalMatrix) * inNormal;           // World space as Shading Space
    fsPosition = (worldMatrix * vec4(inPosition, 1.0)); // World space as Shading Space

    fsCamera = cameraPosition;

    gl_Position = worldViewProjectionMatrix * vec4(inPosition, 1.0);

}