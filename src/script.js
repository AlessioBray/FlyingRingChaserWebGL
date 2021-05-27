var vs = `#version 300 es

in vec3 inPosition;
in vec3 inNormal;
out vec3 fsNormal;

uniform mat4 matrix; 
uniform mat4 nMatrix;     //matrix to transform normals

void main() {
  fsNormal = mat3(nMatrix) * inNormal; 
  gl_Position = matrix * vec4(inPosition, 1.0);
}`;

var fs = `#version 300 es

precision mediump float;

in vec3 fsNormal;
out vec4 outColor;

uniform vec3 mDiffColor; //material diffuse color 
uniform vec3 lightDirection; // directional light direction vec
uniform vec3 lightColor; //directional light color 

void main() {

  vec3 nNormal = normalize(fsNormal);
  vec3 lambertColor = mDiffColor * lightColor * dot(-lightDirection,nNormal);
  outColor = vec4(clamp(lambertColor, 0.0, 1.0),1.0);
}`;

/***********************
 Get the context
************************/

var canvas;
var gl;

function getCanvas(){
	canvas = document.getElementById("canvas");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		document.write("GL context not opened");
    	return;
	}
	utils.resizeCanvasToDisplaySize(gl.canvas);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0.85, 0.85, 0.85, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
}

/***********************
 Program initialization
************************/

var program = null;

function compileAndLinkShaders(){
	var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vs);
	var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fs);
	program = utils.createProgram(gl, vertexShader, fragmentShader);
	gl.useProgram(program);
}

var positionAttributeLocation;  
var normalAttributeLocation;  
var matrixLocation;
var materialDiffColorHandle;
var lightDirectionHandle;
var lightColorHandle;
var normalMatrixPositionHandle;

function getAttributesAndUniformLocations(){
	positionAttributeLocation = gl.getAttribLocation(program, "inPosition");  
	normalAttributeLocation = gl.getAttribLocation(program, "inNormal");  
	matrixLocation = gl.getUniformLocation(program, "matrix");
	materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
	lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
	lightColorHandle = gl.getUniformLocation(program, 'lightColor');
	normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
}

var vao;

function createVAO(){
	vao = gl.createVertexArray();
}

var positionBuffer;
var normalBuffer;
var indexBuffer;

function putAttributesOnGPU(){
	gl.bindVertexArray(vao);

	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

	normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(normalAttributeLocation);
	gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW); 
}

function initializeProgram(){
	compileAndLinkShaders();
	getAttributesAndUniformLocations();
	createVAO();
	putAttributesOnGPU();
}

/***********************
 Draw the scene
***********************/

function animate(){
    var currentTime = (new Date).getTime();
    if(lastUpdateTime){
      var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
      cubeRx += deltaC;
      cubeRy -= deltaC;
      cubeRz += deltaC;
    }

    cubeWorldMatrix[3] = utils.MakeWorld(0.0, 0.0, 0.0, cubeRx, cubeRy, cubeRz, 1.0);
    cubeNormalMatrix = utils.invertMatrix(utils.transposeMatrix(cubeWorldMatrix[3]));
    lastUpdateTime = currentTime;               
  }

  function drawScene() {
  	// Compute the camera matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 0.1;
    var zFar = 100;
    var fieldOfViewDeg = 90;
    var perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
  	var viewMatrix = utils.MakeView(camera_x, camera_y, 3.5, 0, 0); // was (..., -45, 40)

	animate();

	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	for(i = 0; i < 4; i++){
		var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, cubeWorldMatrix[i]);
		var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
		gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

		if (i < 3) gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(cubeWorldMatrix[i]));
		else gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(cubeNormalMatrix));

		gl.uniform3fv(materialDiffColorHandle, cubeMaterialColor);
		gl.uniform3fv(lightColorHandle,  directionalLightColor);
		gl.uniform3fv(lightDirectionHandle,  directionalLight);

		gl.bindVertexArray(vao);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 );
	}

	window.requestAnimationFrame(drawScene);
}

/********************************
           MAIN
**********************************/

var cubeNormalMatrix;
var cubeWorldMatrix = new Array();    //One world matrix for each cube...

//define directional light
var dirLightAlpha = -utils.degToRad(60);
var dirLightBeta  = -utils.degToRad(120);

var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
          Math.sin(dirLightAlpha),
          Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
          ];
var directionalLightColor = [0.1, 1.0, 1.0];

//Define material color
var cubeMaterialColor = [0.5, 0.5, 0.5];
var lastUpdateTime = (new Date).getTime();

var cubeRx = 0.0;
var cubeRy = 0.0;
var cubeRz = 0.0;


function main() {

  cubeWorldMatrix[0] = utils.MakeWorld( -3.0, 0.0, -1.5, 0.0, 0.0, 0.0, 0.5);
  cubeWorldMatrix[1] = utils.MakeWorld( 3.0, 0.0, -1.5, 0.0, 0.0, 0.0, 0.5);
  cubeWorldMatrix[2] = utils.MakeWorld( 0.0, 0.0, -3.0, 0.0, 0.0, 0.0, 0.5);

  getCanvas();

  initializeProgram();
    
  drawScene();

}

window.onload = main;

var camera_x = 0.0;
var camera_y = 0.0;
var delta = 0.1;
var camera_roll = 0;
var camera_pitch = 0;

function keyFunction(e){
 
      if (e.keyCode == 37 || e.keyCode == 65) {  // Left arrow | a
        camera_x -= delta;
        camera_roll = 30;
      }
      if (e.keyCode == 39 || e.keyCode == 68) {  // Right arrow | d
        camera_x += delta;
        camera_roll = -30;
      }
      if (e.keyCode == 38 || e.keyCode == 87) { // up | w
        camera_y += delta;
        camera_pitch = 30;
      }
      if (e.keyCode == 40 || e.keyCode == 83) { // down | s
        camera_y -= delta;
        camera_pitch = -30;
      }
      
      //If you put it here instead, you will redraw the cube only when the camera has been moved
      window.requestAnimationFrame(drawScene);
}
window.addEventListener("keydown", keyFunction, false);

// ---------------------------------------------------------------------------------------------------
// Se vogliamo aggiungere la visione angolata durante il movimento. Non è facile perchè mettendo 
// un angolazione occorre tenere conto che le coordinate della translation vanno impostate diversamente,
// considerando l'angolazione della camera.
/*
function keyFunctionRoll(e){
 
      if (e.keyCode == 37 || e.keyCode == 65) {  // Left arrow | a
        camera_roll = 0;
      }
      if (e.keyCode == 39 || e.keyCode == 68) {  // Right arrow | d
        camera_roll = 0;
      }
      if (e.keyCode == 38 || e.keyCode == 87) { // up | w
        camera_pitch = 0;
      }
      if (e.keyCode == 40 || e.keyCode == 83) { // down | s
        camera_pitch = 0;
      }
      
      //If you put it here instead, you will redraw the cube only when the camera has been moved
      window.requestAnimationFrame(drawScene);
}
window.addEventListener("keyup", keyFunctionRoll, false);
*/