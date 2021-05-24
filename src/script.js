var vs = `#version 300 es

precision mediump float;

in vec3 inPosition;
in vec3 inNormal;
in vec2 in_uv;

out vec2 fsUV;
out vec3 fsNormal;
out vec4 fs_pos;

uniform mat4 matrix;      //worldViewPrijection matrix to draw objects
uniform mat4 worldViewMatrix;  //worldView matrix to transform coordinates into Camera Space
uniform mat4 nMatrix;     //matrix to transform normals

void main() {
  fsUV = in_uv;
  fs_pos = worldViewMatrix * vec4(inPosition,1.0); //coordinates in Camera Space
  fsNormal = mat3(nMatrix) * inNormal; 

  gl_Position = matrix * vec4(inPosition, 1.0);
}`;

var fs = `#version 300 es

precision mediump float;

in vec2 fsUV;
in vec3 fsNormal;
in vec4 fs_pos;

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

//texture
uniform sampler2D in_texture;

//point light
uniform vec4 pLPos;
uniform vec3 pLCol;

out vec4 outColor;

//computes the lambert diffuse
vec3 lambertDiffuse(vec3 lightDir, vec3 lightCol, vec3 normalVec) {
  vec3 diffL = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0);
  return diffL;
}

//computes the blinn specular
vec3 blinnSpecular(vec3 lightDir, vec3 lightCol, vec3 normalVec, vec4 fs_pos, float specShine) {
  // camera space implies eye position to be (0,0,0)
  vec3 eyeDir = vec3(normalize(-fs_pos));
  vec3 halfVec = normalize(eyeDir + lightDir);
  vec3 specularBl = pow(max(dot(halfVec, normalVec), 0.0), specShine) * lightCol;

  return specularBl;
}

//computes the color of a point light with decay
vec3 pointLightColor(vec4 pLPos, vec3 pLCol, vec4 fs_pos, float target, float decay) {
	vec3 lCol = pLCol * pow(target / length(pLPos - fs_pos), decay);

  return lCol;
}

void main() {
  
  //normalize fsNormal, it might not be in the normalized form coming from the vs
  vec3 nNormal = normalize(fsNormal);
  
  //light directions
  vec3 lDirA = normalize(lightDirectionA); 
  vec3 lDirB = normalize(lightDirectionB);
  vec3 lDirP = vec3(normalize(pLPos-fs_pos));

  //computing Lambert diffuse color
  //directional lights
  vec3 diffA = lambertDiffuse(lDirA,lightColorA,nNormal);
  vec3 diffB = lambertDiffuse(lDirB,lightColorB,nNormal);
  //point lights
	vec3 lCol = pointLightColor(pLPos, pLCol, fs_pos, 0.5, 1.0);
  vec3 diffusePointContact = lambertDiffuse(lDirP,lCol,nNormal);

  //total lambert component
  vec3 lambertDiff = clamp((mDiffColor*(diffusePointContact + diffA + diffB )), 0.0, 1.0);

  //computing ambient color
  vec3 ambient = ambientLightCol * ambientMat;
  
  //computing Blinn specular color
  vec3 specA = blinnSpecular(lDirA,lightColorA,nNormal,fs_pos,specShine);
  vec3 specB = blinnSpecular(lDirB,lightColorB,nNormal,fs_pos,specShine);
  vec3 specP = blinnSpecular(lDirP,lCol,nNormal,fs_pos,specShine);

  //total specular component
  vec3 blinnSpec = specularColor * (specA + specB + specP);
  
  //computing BRDF color
  vec4 color = vec4(clamp(blinnSpec + lambertDiff + ambient + emit, 0.0, 1.0).rgb,1.0);
  
  //compose final color with texture
  vec4 outColorfs = color * texture(in_texture, fsUV);
  outColor = outColorfs;
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



var ambientLightColorHandle;
var ambientMaterialHandle;
var specularColorHandle;
var shineSpecularHandle;
var emissionColorHandle;
var lightDirectionHandleA;
var lightColorHandleA;
var lightDirectionHandleB;
var lightColorHandleB;


function getAttributesAndUniformLocations(){
	positionAttributeLocation = gl.getAttribLocation(program, "inPosition");  
	normalAttributeLocation = gl.getAttribLocation(program, "inNormal");  
	matrixLocation = gl.getUniformLocation(program, "matrix");
	materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
	normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');

  ambientLightColorHandle = gl.getUniformLocation(program, "ambientLightCol");
  ambientMaterialHandle = gl.getUniformLocation(program, "ambientMat");
  specularColorHandle = gl.getUniformLocation(program, "specularColor");
  shineSpecularHandle = gl.getUniformLocation(program, "specShine");
  emissionColorHandle = gl.getUniformLocation(program, "emit");    
  lightDirectionHandleA = gl.getUniformLocation(program, 'lightDirectionA');
  lightColorHandleA = gl.getUniformLocation(program, 'lightColorA');
  lightDirectionHandleB = gl.getUniformLocation(program, 'lightDirectionB');
  lightColorHandleB = gl.getUniformLocation(program, 'lightColorB');
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
  
  // define material color 
  var materialColor = [1.0, 1.0, 1.0];

  // define ambient light color and material
  var ambientLight = [0.15, 0.9, 0.8];
  var ambientMat = [0.4, 0.2, 0.6];
    
  //define specular component of color
  var specularColor = [1.0, 1.0, 1.0];
  var specShine = 10.0;
  

	for(i = 0; i < 4; i++){
		var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, cubeWorldMatrix[i]);
		var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
		gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

		if (i < 3) gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(cubeWorldMatrix[i]));
		else gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(cubeNormalMatrix));

    // Passing "static" parameters to the shaders

		gl.uniform3fv(materialDiffColorHandle, cubeMaterialColor);
    gl.uniform3fv(materialDiffColorHandle, materialColor);
    gl.uniform3fv(lightColorHandleA, directionalLightColorA);
    //gl.uniform3fv(lightDirectionHandleA, lightDirectionTransformedA);
    gl.uniform3fv(lightColorHandleB, directionalLightColorB);
    //gl.uniform3fv(lightDirectionHandleB, lightDirectionTransformedB);
    gl.uniform3fv(ambientLightColorHandle, ambientLight);
    gl.uniform3fv(ambientMaterialHandle, ambientMat);
    gl.uniform3fv(specularColorHandle, specularColor);
    gl.uniform1f(shineSpecularHandle, specShine);
  

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

function fromHexToRGBVec(hex) {
  col = hex.substring(1,7);
    R = parseInt(col.substring(0,2) ,16) / 255;
    G = parseInt(col.substring(2,4) ,16) / 255;
    B = parseInt(col.substring(4,6) ,16) / 255;
  return [R,G,B]
}

// DIRECTIONALS LIGHTS

// directional light A
var dirLightAlphaA = utils.degToRad(document.getElementById("dirLightAlphaA").value);//20
var dirLightBetaA = utils.degToRad(document.getElementById("dirLightBetaA").value);//32

var directionalLightA = [Math.cos(180 - dirLightAlphaA) * Math.cos(dirLightBetaA),
  Math.sin(180 - dirLightAlphaA),
  Math.cos(180 - dirLightAlphaA) * Math.sin(dirLightBetaA)
  ];
var directionalLightColorA = fromHexToRGBVec(document.getElementById("LAlightColor").value);//#4d4d4d

// directional light B
var dirLightAlphaB = utils.degToRad(document.getElementById("dirLightAlphaB").value);//55
var dirLightBetaB = utils.degToRad(document.getElementById("dirLightBetaB").value);//95

var directionalLightB = [-Math.cos(dirLightAlphaB) * Math.cos(dirLightBetaB),
  Math.sin(dirLightAlphaB),
  Math.cos(dirLightAlphaB) * Math.sin(dirLightBetaB)
  ];
var directionalLightColorB = fromHexToRGBVec(document.getElementById("LBlightColor").value);//5e5e5e

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