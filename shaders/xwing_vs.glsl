#version 300 es

in vec3 in_position; 
in vec3 in_normal;
in vec2 in_UV;

out vec3 fsNormal; 
out vec4 fsPosition;
out vec2 fsUV;

uniform mat4 worldViewProjectionMatrix;
uniform mat4 worldMatrix;
uniform mat4 normalMatrix; 

void main() {

    fsUV = vec2(in_UV.x, 1.0 - in_UV.y);
    fsNormal = mat3(normalMatrix) * in_normal;
    fsPosition = (worldMatrix * vec4(in_position, 1.0)).xyzw; // coordinates in world space
    gl_Position = worldViewProjectionMatrix * vec4(in_position, 1.0);

}