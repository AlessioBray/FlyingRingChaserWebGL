#version 300 es

in vec3 inPosition;
in vec3 inNormal;
out vec3 fsNormal;
out vec4 fs_pos;
uniform mat4 matrix;      //worldViewPrijection matrix to draw objects
uniform mat4 worldViewMatrix;  //worldView matrix to transform coordinates into Camera Space
uniform mat4 nMatrix;     //matrix to transform normals

void main() {
  fs_pos = worldViewMatrix * vec4(inPosition,1.0); //coordinates in Camera Space
  fsNormal = mat3(nMatrix) * inNormal; 

  gl_Position = matrix * vec4(inPosition, 1.0);
}