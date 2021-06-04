///////////
var pLight = new PointLight(new Vec2(0,0),"#000000", "");    //look in physics

function normalizeVec3(a) {  //to put in lib

  out = [];
  var normV = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
  out[0] = a[0]/normV;
  out[1] = a[1]/normV;
  out[2] = a[2]/normV;	 
  
  return out;
}
////////////

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

var positionAttributeLocation;  
var normalAttributeLocation;  
var matrixLocation;

//////////////////////
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
var pointLightPositionHandle;
var pointLightColorHandle;
//////////////////

function getAttributesAndUniformLocations(){

	positionAttributeLocation = gl.getAttribLocation(program, "inPosition");  
	normalAttributeLocation = gl.getAttribLocation(program, "inNormal");  
	matrixLocation = gl.getUniformLocation(program, "matrix");
	normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');

  //////////////////////////////////////
  ambientLightColorHandle = gl.getUniformLocation(program, "ambientLightCol");
  ambientMaterialHandle = gl.getUniformLocation(program, "ambientMat");
  materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
  specularColorHandle = gl.getUniformLocation(program, "specularColor");
  shineSpecularHandle = gl.getUniformLocation(program, "specShine");
  emissionColorHandle = gl.getUniformLocation(program, "emit");    
  lightDirectionHandleA = gl.getUniformLocation(program, 'lightDirectionA');
  lightColorHandleA = gl.getUniformLocation(program, 'lightColorA');
  lightDirectionHandleB = gl.getUniformLocation(program, 'lightDirectionB');
  lightColorHandleB = gl.getUniformLocation(program, 'lightColorB');
  pointLightPositionHandle = gl.getUniformLocation(program, 'pLPos');
  pointLightColorHandle = gl.getUniformLocation(program, 'pLCol');
  ///////////////////////////////////////

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

  ////////////

    // CAMERA SPACE TRANSFORMATION OF DIRECTIONAL LIGHTS 

    // Directional Lights direction transformation to Camera Space
    var lightDirMatrix = utils.sub3x3from4x4(utils.invertMatrix(utils.transposeMatrix(viewMatrix)));

    var lightDirectionTransformedA = normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLightA));
    var lightDirectionTransformedB = normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLightB));
    
    // POINT LIGHT

    //Position
    var x = pLight.position.x;
    var y = 9.853;//parseFloat(document.getElementById("y").value/1000);
    var z = pLight.position.y;

    let realCoords = [x,y,z];//fromPlaneToSpace(x,z);

    x = realCoords[0];
    z = realCoords[2];

    var pointLightPos = [x,y,z,1.0];

    //Color
    var pointLightColor = fromHexToRGBVec(pLight.color);

    //Transform the point light's Position into Camera Space
    var pointLightPosTransformationMatrix = viewMatrix;
    var pointLightPosTransformed = utils.multiplyMatrixVector(pointLightPosTransformationMatrix,pointLightPos);

	for(i = 0; i < 4; i++){
		var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, cubeWorldMatrix[i]);
		var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
		gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

		if (i < 3) gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(cubeWorldMatrix[i]));
		else gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(cubeNormalMatrix));

    // Passing "static" parameters to the shaders

    gl.uniform4fv(pointLightPositionHandle, pointLightPosTransformed);
    gl.uniform3fv(pointLightColorHandle, pointLightColor);

    gl.uniform3fv(materialDiffColorHandle, materialColor);
    gl.uniform3fv(lightColorHandleA, directionalLightColorA);
    gl.uniform3fv(lightDirectionHandleA, lightDirectionTransformedA);
    gl.uniform3fv(lightColorHandleB, directionalLightColorB);
    gl.uniform3fv(lightDirectionHandleB, lightDirectionTransformedB);
    gl.uniform3fv(ambientLightColorHandle, ambientLight);
    gl.uniform3fv(ambientMaterialHandle, ambientMat);
    gl.uniform3fv(specularColorHandle, specularColor);
    gl.uniform1f(shineSpecularHandle, specShine);
    //////////

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

///////////////////////////// define directional light

function fromHexToRGBVec(hex) {
  col = hex.substring(1,7);
    R = parseInt(col.substring(0,2) ,16) / 255;
    G = parseInt(col.substring(2,4) ,16) / 255;
    B = parseInt(col.substring(4,6) ,16) / 255;
  return [R,G,B]
}

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

// define ambient light color and material
var ambientLight = [0.15, 0.9, 0.8];
var ambientMat = [0.4, 0.2, 0.6];
  
//define specular component of color
var specularColor = [1.0, 1.0, 1.0];
var specShine = 10.0;


// define material color 
var materialColor = [1.0, 1.0, 0.0];


/////////////


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

  //getCanvas();

  initializeProgram();
    
  drawScene();

  //init global variables
  lightController = document.getElementById("lightcontroller");
  moveController = document.getElementById("movecontroller");
  score=document.getElementById('scoringtab');
  createScore(); 

}

var camera_x = 0.0;
var camera_y = 0.0;
var delta = 0.1;
var camera_roll = 0;
var camera_pitch = 0;

function keyDownFunction(e){

     
     switch(e.key){
      
      case "ArrowLeft" :
      case "a" :  
        camera_x -= delta;
        camera_roll = 30;
        break;
      
      case "ArrowRight":
      case "d":   
        camera_x += delta;
        camera_roll = -30;
        break;

      case "ArrowUp":
      case "w": 
        camera_y += delta;
        camera_pitch = 30;
        break;

      case "ArrowDown":
      case "s": 
        camera_y -= delta;
        camera_pitch = -30;
        break;

      default:
        break;  
     }
      //If you put it here instead, you will redraw the cube only when the camera has been moved
      window.requestAnimationFrame(drawScene);
}

function keyUpFunction(e){
  
 if (e.keyCode == 32){
    game();
  }
  
}


window.addEventListener("keydown", keyDownFunction, false);
window.addEventListener("keyup", keyUpFunction, false);

async function init(){ //init is an async function so we can use await inside it
  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');
  shaderDir = baseDir+"shaders/"; //Shader files will be put in the shaders folder

  //[..Retrieve canvas and webgl context here..]
  getCanvas();

  //await makes the init function stop until the loadFiles function has completed

  //compile and link shaders
  await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText){
  var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
  var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
  program = utils.createProgram(gl, vertexShader, fragmentShader);
  });
  gl.useProgram(program);
  main(); //Call the main function from here so it doesn’t have to be async too

  }
  
  window.onload = init; //Put init function here instead of main

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