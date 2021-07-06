function clearBits(){
    gl.clearColor(0.0, 0.0, 0.0, 0.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function setViewportAndCanvas(){
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    clearBits();
}

function setMatrices(){
    // Compute the camera view matrix
    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
    viewMatrix = utils.MakeView(camera_x, camera_y, camera_z, camera_elevation, camera_angle);
}

function getAttributesAndUniforms(){
    
    for (var i = 0; i < programs.length - 1; i++){

        // Attributes locations

        positionAttributeLocation[i] = gl.getAttribLocation(programs[i], "inPosition");
        normalAttributeLocation[i] = gl.getAttribLocation(programs[i], "inNormal");
        
        if (i == XWING_INDEX || i == ASTEROID_INDEX){
            uvAttributeLocation[i] = gl.getAttribLocation(programs[i], "inUV");
        }
        
        // Uniforms locations

        worldViewProjectionMatrixLocation[i] = gl.getUniformLocation(programs[i], "worldViewProjectionMatrix");  
        normalMatrixLocation[i] = gl.getUniformLocation(programs[i], "normalMatrix");
        worldMatrixLocation[i] = gl.getUniformLocation(programs[i], "worldMatrix");
        cameraPositionLocation[i] = gl.getUniformLocation(programs[i], "cameraPosition");

        switch(i){
            
            case XWING_INDEX:
                textureLocation = gl.getUniformLocation(programs[i], "in_texture");
                break;
            
            case ASTEROID_INDEX:
                diffuseMapLocation = gl.getUniformLocation(programs[i], "diffuseMap");
                roughnessMapLocation = gl.getUniformLocation(programs[i], "roughnessMap");
                aoMapLocation = gl.getUniformLocation(programs[i], "aoMap");
                normalMapLocation = gl.getUniformLocation(programs[i], "normalMap");
                metalnessMapLocation = gl.getUniformLocation(programs[i], "metalnessMap");
                break;
        }


        // Light uniforms location COMMON to all objects
        lightDirectionHandleA[i] = gl.getUniformLocation(programs[i], 'lightDirectionA');
        lightColorHandleA[i] = gl.getUniformLocation(programs[i], 'lightColorA');
        lightDirectionHandleB[i] = gl.getUniformLocation(programs[i], 'lightDirectionB');
        lightColorHandleB[i] = gl.getUniformLocation(programs[i], 'lightColorB');

    }

}

function loadObjectsTextures(){

    // X-wing textures
    // ---------------
    
    // Create a texture.
    textures[0] = gl.createTexture();
    
    // Asynchronously load an image
    images[0] = new Image();
    images[0].onload = function() {
        // use texture unit 1
        gl.activeTexture(gl.TEXTURE1);
        // bind to the TEXTURE_2D bind point of texture unit 1
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]);
                
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };
    images[0].src = textureDir + "xwing/XWing_Diffuse.png";

    // ---------------

    // Asteroid textures
    // -----------------

    textures[1] = gl.createTexture();

    images[1] = new Image();
    images[1].onload = function() {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, textures[1]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[1]);
                
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };
    images[1].src = textureDir + "asteroid/copper-rock-alb.png";

    textures[2] = gl.createTexture();

    images[2] = new Image();
    images[2].onload = function() {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, textures[2]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[2]);
                
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };
    images[2].src = textureDir + "asteroid/copper-rock-rough.png";

    textures[3] = gl.createTexture();

    images[3] = new Image();
    images[3].onload = function() {
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, textures[3]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[3]);
                
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };
    images[3].src = textureDir + "asteroid/copper-rock-ao.png";

    textures[4] = gl.createTexture();

    images[4] = new Image();
    images[4].onload = function() {
        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, textures[4]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[4]);
                
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };
    images[4].src = textureDir + "asteroid/copper-rock-normal.png";

    textures[5] = gl.createTexture();

    images[5] = new Image();
    images[5].onload = function() {
        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, textures[4]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[5]);
                
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };
    images[5].src = textureDir + "asteroid/copper-rock-metal.png";

    textures[6] = gl.createTexture();

    images[6] = new Image();
    images[6].onload = function() {
        gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_2D, textures[4]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[6]);
                
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };
    images[6].src = textureDir + "asteroid/copper-rock-height.png";
    
    // -----------------

}

function main() {

    utils.resizeCanvasToDisplaySize(gl.canvas);
    setViewportAndCanvas();

    getAttributesAndUniforms(); 

    vaos = new Array(allMeshes.length);
    for (let i in allMeshes){
        vaos[i] = gl.createVertexArray(); 
        createMeshVAO(i);
    }

    loadObjectsTextures();

    createShowcaseSceneGraph();

    updateLights();

    drawScene();
}

function render(){

    utils.resizeCanvasToDisplaySize(gl.canvas);
    setViewportAndCanvas();

    createShowcaseSceneGraph();

    updateLights();

    drawScene();
}

function animateShowcase(){
    Ry = (Ry + 0.5) % 360;
}

function updateShowcaseWorldMatrix(){

    setMatrices();
    objects[0].updateWorldMatrix(utils.MakeRotateYMatrix(Ry));

}

function drawObject(obj){ // obj is the node that represent the object to draw

    gl.useProgram(obj.drawInfo.programInfo);

    /////////// WORLD SPACE /////////////

    let normalMatrix = utils.invertMatrix(utils.transposeMatrix(obj.worldMatrix));
    let viewWorldMatrix = utils.multiplyMatrices(viewMatrix, obj.worldMatrix);
    let projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

    if (obj.drawInfo.type == XWING_INDEX){

        // Diffuse map
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.uniform1i(textureLocation, 1);
        
    }
    if (obj.drawInfo.type == ASTEROID_INDEX){

        // Diffuse map
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, textures[1]);
        gl.uniform1i(diffuseMapLocation, 2);

        // Roughness map
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, textures[2]);
        gl.uniform1i(roughnessMapLocation, 3);

        // Ambient Occlusion map
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, textures[3]);
        gl.uniform1i(aoMapLocation, 4);
    
        // Normal map
        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, textures[4]);
        gl.uniform1i(normalMapLocation, 5);

        // Metalness map
        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, textures[5]);
        gl.uniform1i(metalnessMapLocation, 6);
    }

    gl.uniformMatrix4fv(worldViewProjectionMatrixLocation[obj.drawInfo.type], gl.FALSE, utils.transposeMatrix(projectionMatrix));
    gl.uniformMatrix4fv(normalMatrixLocation[obj.drawInfo.type], gl.FALSE, utils.transposeMatrix(normalMatrix));
    gl.uniformMatrix4fv(worldMatrixLocation[obj.drawInfo.type], gl.FALSE, utils.transposeMatrix(obj.worldMatrix));

    gl.uniform3fv(lightColorHandleA[obj.drawInfo.type], directionalLightColorA);
    gl.uniform3fv(lightDirectionHandleA[obj.drawInfo.type], directionalLightA);
    gl.uniform3fv(lightColorHandleB[obj.drawInfo.type], directionalLightColorB);
    gl.uniform3fv(lightDirectionHandleB[obj.drawInfo.type], directionalLightB);
    
    if (obj.drawInfo.type == XWING_INDEX || obj.drawInfo.type == RING_INDEX || obj.drawInfo.type == ASTEROID_INDEX){
        gl.uniform4fv(cameraPositionLocation[obj.drawInfo.type], [camera_x, camera_y, camera_z, 1]);
    }

    gl.bindVertexArray(obj.drawInfo.vertexArray);
    gl.drawElements(gl.TRIANGLES, obj.drawInfo.bufferLength, gl.UNSIGNED_SHORT, 0 );

}
    
function drawScene() {    

    animateShowcase();

    updateShowcaseWorldMatrix(); // to update rings world matrices

    clearBits();
   
    drawSkybox();

    for (var i = 0; i < objects.length; i++){
        drawObject(objects[i]);
    }

    requestAnimationId = window.requestAnimationFrame(drawScene);
}

function createMeshVAO(i) {

    let mesh = allMeshes[i];
    gl.bindVertexArray(vaos[i]);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation[i]);
    gl.vertexAttribPointer(positionAttributeLocation[i], 3, gl.FLOAT, false, 0, 0);

    if (i == XWING_INDEX || i == ASTEROID_INDEX){

        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.textures), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(uvAttributeLocation[i]);
        gl.vertexAttribPointer(uvAttributeLocation[i], 2, gl.FLOAT, false, 0, 0);

    }

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexNormals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation[i]);
    gl.vertexAttribPointer(normalAttributeLocation[i], 3, gl.FLOAT, false, 0, 0);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);

}

async function loadShaders() {

    await utils.loadFiles([shaderDir + 'skybox_vs.glsl', shaderDir + 'skybox_fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

        programs[SKYBOX_INDEX] = utils.createProgram(gl, vertexShader, fragmentShader);
    });

    await utils.loadFiles([shaderDir + 'xwing_vs.glsl', shaderDir + 'xwing_fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

        programs[XWING_INDEX] = utils.createProgram(gl, vertexShader, fragmentShader);
    });

    await utils.loadFiles([shaderDir + 'ring_vs.glsl', shaderDir + 'ring_fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        
        programs[RING_INDEX] = utils.createProgram(gl, vertexShader, fragmentShader);
    });
  
    await utils.loadFiles([shaderDir + 'asteroid_vs.glsl', shaderDir + 'asteroid_fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

        programs[ASTEROID_INDEX] = utils.createProgram(gl, vertexShader, fragmentShader);
    });

}

async function loadMeshes() {

    xwingMesh = await utils.loadMesh(modelsDir + "xwing_tiefighter.obj");
    ringMesh = await utils.loadMesh(modelsDir + "ring2.obj" );
    asteroidMesh = await utils.loadMesh(modelsDir + "sphere_triangulate.obj");

    allMeshes = [xwingMesh, ringMesh, asteroidMesh];

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

    loadEnvironment();
    
    main();
}

window.onload = init;
window.onresize = changeRender; 

function changeRender(){
    window.cancelAnimationFrame(requestAnimationId);
    render();
}