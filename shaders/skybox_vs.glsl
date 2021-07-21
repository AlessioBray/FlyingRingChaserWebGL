#version 300 es

in vec3 inPosition;
     
out vec3 sampleDir;
     
void main() {
    gl_Position = vec4(inPosition, 1.0);
 
    // Since the positions are
    // centered around the origin we can just 
    // pass the position
    sampleDir = inPosition;
}