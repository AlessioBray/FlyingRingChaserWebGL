function ClearBits(){
    gl.clearColor(0.85, 1.0, 0.85, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function SetViewportAndCanvas(){
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    ClearBits();
}

function SetMatrices(){
    // Compute the camera matrix
    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
  	viewMatrix = utils.MakeView(camera_x, camera_y, camera_z, camera_pitch, camera_yaw);
}

function GetAttributesAndUniforms(){

    //Uniforms
    positionAttributeLocation = gl.getAttribLocation(program, "in_position");  
    normalAttributeLocation = gl.getAttribLocation(program, "in_normal");
    uvAttributeLocation = gl.getAttribLocation(program, "in_UV");
    textLocation = gl.getUniformLocation(program, "in_texture");
    matrixLocation = gl.getUniformLocation(program, "matrix");  
    nMatrixLocation = gl.getUniformLocation(program, "nMatrix");
    pMatrixLocation = gl.getUniformLocation(program, "pMatrix");

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

    //skybox
    skyboxTexHandle = gl.getUniformLocation(program, "u_texture"); // uniform
    skyboxVertPosAttr = gl.getAttribLocation(program, "in_skybox_position"); // attribute
}

function main() {

    utils.resizeCanvasToDisplaySize(gl.canvas);
    SetViewportAndCanvas();

    GetAttributesAndUniforms();

    vaos = new Array(allMeshes.length); 

    for (let i in allMeshes){
        vaos[i] = gl.createVertexArray(); 
        addMeshToScene(i);
    }      

    updateLight();
    drawScene();
}

function animate(){
   
    //**TODO**// Update score e.g. livesP.innerHTML = "LIVES: " + lives;
    Rx = Rx + 0.5;
    
}


function updateWorldMatrix(){

    SetMatrices();
  
    starshipArray = matricesArrays[0]; 
    ringsArray = matricesArrays[1];
    ringsArray[0]= utils.MakeWorld(-3.0, 0.0, -1.5, Rx, Ry, Rz, S);
    ringsArray[1]= utils.MakeWorld(3.0, 0.0, -1.5, Rx, Ry, Rz, S);
    starshipArray[0] = utils.MakeWorld(0.0, 0.0, -3.0, Rx, Ry, Rz, S);

}

function drawElement(i,j){ // i is the index for vaos, j is index for worldMatrix

    let matricesArray = matricesArrays[i]; 
    let worldMatrix = matricesArray[j];

    utils.resizeCanvasToDisplaySize(gl.canvas);

    //ClearBits();  // multiple draw of objects doesn't work with this here

    normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldMatrix));
    MV = utils.multiplyMatrices(viewMatrix, worldMatrix);
    Projection = utils.multiplyMatrices(perspectiveMatrix, MV);
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(Projection));
    gl.uniformMatrix4fv(nMatrixLocation, gl.FALSE, utils.transposeMatrix(normalMatrix));
    gl.uniformMatrix4fv(pMatrixLocation, gl.FALSE, utils.transposeMatrix(worldMatrix));

    
    let viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
    let projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
    gl.uniformMatrix4fv(nMatrixLocation, gl.FALSE, utils.transposeMatrix(worldMatrix));
    
        
    gl.uniform3fv(materialDiffColorHandle, materialColor);
    gl.uniform3fv(lightColorHandleA, directionalLightColorA);
    gl.uniform3fv(lightDirectionHandleA, directionalLightA);
    gl.uniform3fv(lightColorHandleB, directionalLightColorB);
    gl.uniform3fv(lightDirectionHandleB, directionalLightB);
    gl.uniform3fv(ambientLightColorHandle, ambientLight);
    gl.uniform3fv(ambientMaterialHandle, ambientMat);
    gl.uniform3fv(specularColorHandle, specularColor);
    gl.uniform1f(shineSpecularHandle, specShine);

    gl.bindVertexArray(vaos[i]);
    gl.drawElements(gl.TRIANGLES, allMeshes[i].indices.length, gl.UNSIGNED_SHORT, 0 );

}

function loadTexture(){
    
    // Create a texture.
    var texture = gl.createTexture();
    // use texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // bind to the TEXTURE_2D bind point of texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Asynchronously load an image
    var image = new Image();
    image.src = textureDir + "X-Wing-textures.png";
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };
}
    
function drawScene() {    

    animate();

    updateWorldMatrix(); // to update rings world matrices

    ClearBits();

    // add each mesh / object with its world matrix
    
    for (var i = 0; i < allMeshes.length; i++) { //for each type of object
        let matricesArray = matricesArrays[i];
        for(var j = 0; j < matricesArray.length; j++){  // for each instance of that type
            drawElement(i,j);
        }
    }

    loadTexture();

    //DrawSkybox();

    window.requestAnimationFrame(drawScene);
}

function addMeshToScene(i) {

    let mesh = allMeshes[i];
    gl.bindVertexArray(vaos[i]);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    if (i == 0){ //if starship
        var uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.textures), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(uvAttributeLocation);
            gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    }
     

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexNormals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);
    
}

async function loadShaders() {

    // load vertex and fragment shaders from file
    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });

    gl.useProgram(program);
}

async function loadMeshes() {

    x_wingMesh = await utils.loadMesh(modelsDir + "X-WING.obj");
    ringMesh = await utils.loadMesh(modelsDir + "ring.obj" );
    
    allMeshes = [x_wingMesh,ringMesh
            
               //,ringMesh
    ];
}

async function init(){

    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    utils.resizeCanvasToDisplaySize(gl.canvas);

    await loadShaders();

    await loadMeshes();


    //LoadEnvironment();
    
    main();
}

window.onload = init;
window.onresize = main; //(?)