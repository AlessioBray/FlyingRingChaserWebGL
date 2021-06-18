function ClearBits(){
    gl.clearColor(0.0, 0.0, 0.0, 0.0); 
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
    positionAttributeLocation[0] = gl.getAttribLocation(programs[0], "in_position");  
    matrixLocation[0] = gl.getUniformLocation(programs[0], "matrix");
    normalAttributeLocation[0] = gl.getAttribLocation(programs[0], "in_normal");
    nMatrixLocation[0] = gl.getUniformLocation(programs[0], "nMatrix");
    pMatrixLocation[0] = gl.getUniformLocation(programs[0], "pMatrix");

    uvAttributeLocation[0] = gl.getAttribLocation(programs[0], "in_UV");
    textLocation[0] = gl.getUniformLocation(programs[0], "in_texture");
    ambientLightColorHandle[0] = gl.getUniformLocation(programs[0], "ambientLightCol");
    ambientMaterialHandle[0] = gl.getUniformLocation(programs[0], "ambientMat");
    materialDiffColorHandle[0] = gl.getUniformLocation(programs[0], 'mDiffColor');
    specularColorHandle[0] = gl.getUniformLocation(programs[0], "specularColor");
    shineSpecularHandle[0] = gl.getUniformLocation(programs[0], "specShine");
    emissionColorHandle[0] = gl.getUniformLocation(programs[0], "emit");    
    lightDirectionHandleA[0] = gl.getUniformLocation(programs[0], 'lightDirectionA');
    lightColorHandleA[0] = gl.getUniformLocation(programs[0], 'lightColorA');
    lightDirectionHandleB[0] = gl.getUniformLocation(programs[0], 'lightDirectionB');
    lightColorHandleB[0] = gl.getUniformLocation(programs[0], 'lightColorB');

    //skybox

    //skyboxTexHandle[0] = gl.getUniformLocation(programs[0], "u_texture"); // uniform
    //skyboxVertPosAttr[0] = gl.getAttribLocation(programs[0], "in_skybox_position"); // attribute
    
    //Uniforms
    positionAttributeLocation[1] = gl.getAttribLocation(programs[1], "in_position");  
   // normalAttributeLocation[1] = gl.getAttribLocation(programs[1], "in_normal");
    //uvAttributeLocation[1] = gl.getAttribLocation(programs[1], "in_UV");
    //textLocation[1] = gl.getUniformLocation(programs[1], "in_texture");
    matrixLocation[1] = gl.getUniformLocation(programs[1], "matrix");  
    //nMatrixLocation[1] = gl.getUniformLocation(programs[1], "nMatrix");
    //pMatrixLocation[1] = gl.getUniformLocation(programs[1], "pMatrix");

    /*
    ambientLightColorHandle[1] = gl.getUniformLocation(programs[1], "ambientLightCol");
    ambientMaterialHandle[1] = gl.getUniformLocation(programs[1], "ambientMat");
    materialDiffColorHandle[1] = gl.getUniformLocation(programs[1], 'mDiffColor');
    specularColorHandle[1] = gl.getUniformLocation(programs[1], "specularColor");
    shineSpecularHandle[1] = gl.getUniformLocation(programs[1], "specShine");
    emissionColorHandle[1] = gl.getUniformLocation(programs[1], "emit");    
    lightDirectionHandleA[1] = gl.getUniformLocation(programs[1], 'lightDirectionA');
    lightColorHandleA[1] = gl.getUniformLocation(programs[1], 'lightColorA');
    lightDirectionHandleB[1] = gl.getUniformLocation(programs[1], 'lightDirectionB');
    lightColorHandleB[1] = gl.getUniformLocation(programs[1], 'lightColorB'); */
    
    //skybox
    //skyboxTexHandle[1] = gl.getUniformLocation(program[1], "u_texture"); // uniform
    //skyboxVertPosAttr[1] = gl.getAttribLocation(program[1], "in_skybox_position"); // attribute
   
    //Uniforms
    positionAttributeLocation[2] = gl.getAttribLocation(programs[2], "in_position");  
   // normalAttributeLocation[2] = gl.getAttribLocation(programs[2], "in_normal");
    //uvAttributeLocation[2] = gl.getAttribLocation(programs[2], "in_UV");
    //textLocation[2] = gl.getUniformLocation(programs[2], "in_texture");
    matrixLocation[2] = gl.getUniformLocation(programs[2], "matrix");  
   // nMatrixLocation[2] = gl.getUniformLocation(programs[2], "nMatrix");
    //pMatrixLocation[2] = gl.getUniformLocation(programs[2], "pMatrix");

    /*
    ambientLightColorHandle[2] = gl.getUniformLocation(programs[2], "ambientLightCol");
    ambientMaterialHandle[2] = gl.getUniformLocation(programs[2], "ambientMat");
    materialDiffColorHandle[2] = gl.getUniformLocation(programs[2], 'mDiffColor');
    specularColorHandle[2] = gl.getUniformLocation(programs[2], "specularColor");
    shineSpecularHandle[2] = gl.getUniformLocation(programs[2], "specShine");
    emissionColorHandle[2] = gl.getUniformLocation(programs[2], "emit");    
    lightDirectionHandleA[2] = gl.getUniformLocation(programs[2], 'lightDirectionA');
    lightColorHandleA[2] = gl.getUniformLocation(programs[2], 'lightColorA');
    lightDirectionHandleB[2] = gl.getUniformLocation(programs[2], 'lightDirectionB');
    lightColorHandleB[2] = gl.getUniformLocation(programs[2], 'lightColorB');
    */
    //skybox
    //skyboxTexHandle[2] = gl.getUniformLocation(program[2], "u_texture"); // uniform
    //skyboxVertPosAttr[2] = gl.getAttribLocation(program[2], "in_skybox_position"); // attribute
    

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
    //Rx = Rx + 0.5;
    
}


function updateWorldMatrix(){

    SetMatrices();
    
    matrixArray = matricesArrays[idx]; 
    matrixArray[0] = utils.MakeWorld(0.0, 0.0, -3.0, Rx, Ry, Rz, S);
     
}

function drawElement(i,j){ // i is the index for vaos, j is index for worldMatrix
    //console.log("i: " + i);
    //console.log("j: " + j);
    gl.useProgram(programs[i]);
    let matricesArray = matricesArrays[i]; 
    let worldMatrix = matricesArray[j];

    utils.resizeCanvasToDisplaySize(gl.canvas);

    /////////// WORLD SPACE /////////////
    normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldMatrix));
    MV = utils.multiplyMatrices(viewMatrix, worldMatrix);
    Projection = utils.multiplyMatrices(perspectiveMatrix, MV);

    gl.uniformMatrix4fv(matrixLocation[i], gl.FALSE, utils.transposeMatrix(Projection));
    gl.uniformMatrix4fv(nMatrixLocation[i], gl.FALSE, utils.transposeMatrix(normalMatrix));
    gl.uniformMatrix4fv(pMatrixLocation[i], gl.FALSE, utils.transposeMatrix(worldMatrix));

    
    if(i==0){    
    gl.uniform3fv(materialDiffColorHandle[i], materialColor);
    gl.uniform3fv(lightColorHandleA[i], directionalLightColorA);
    gl.uniform3fv(lightDirectionHandleA[i], directionalLightA);
    gl.uniform3fv(lightColorHandleB[i], directionalLightColorB);
    gl.uniform3fv(lightDirectionHandleB[i], directionalLightB);
    gl.uniform3fv(ambientLightColorHandle[i], ambientLight);
    gl.uniform3fv(ambientMaterialHandle[i], ambientMat);
    gl.uniform3fv(specularColorHandle[i], specularColor);
    gl.uniform1f(shineSpecularHandle[i], specShine);
    }

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
    
    //for (var i = 0; i < allMeshes.length; i++) { //for each type of object
        let matricesArray = matricesArrays[idx];
        //console.log(matricesArray);
        for(var j = 0; j < matricesArray.length; j++){  // for each instance of that type
            drawElement(idx,j);
        }
    //}

    loadTexture();

    DrawSkybox();

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

async function LoadShaders() {

    //MultipleShaders
    await utils.loadFiles([shaderDir + 'xwing_vs.glsl', shaderDir + 'xwing_fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

        programs[0] = utils.createProgram(gl, vertexShader, fragmentShader);
  });
  

    await utils.loadFiles([shaderDir + 'ring_vs.glsl', shaderDir + 'ring_fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        
        programs[1] = utils.createProgram(gl, vertexShader, fragmentShader);
    });
  
    await utils.loadFiles([shaderDir + 'asteroid_vs.glsl', shaderDir + 'asteroid_fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

        programs[2] = utils.createProgram(gl, vertexShader, fragmentShader);
    });

    await utils.loadFiles([shaderDir + 'skybox_vs.glsl', shaderDir + 'skybox_fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

        programs[3] = utils.createProgram(gl, vertexShader, fragmentShader);
    });

}

async function LoadMeshes() {

    x_wingMesh = await utils.loadMesh(modelsDir + "X-WING.obj");
    ringMesh = await utils.loadMesh(modelsDir + "ring.obj" );
    asteroidMesh = await utils.loadMesh(modelsDir + "asteroid.obj" );
    allMeshes = [x_wingMesh,ringMesh,asteroidMesh    
               //,ringMesh
    ];
    idx = 0; //starship
}

async function init(){

    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    utils.resizeCanvasToDisplaySize(gl.canvas);

    await LoadShaders();

    await LoadMeshes();

    LoadEnvironment();
    
    main();
}

window.onload = init;
window.onresize = main; //(?)