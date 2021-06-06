function main() {

    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.85, 1.0, 0.85, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    vertices = model.vertices;
    normals = model.vertexNormals;
    indices = model.indices;

    positionAttributeLocation = gl.getAttribLocation(program, "a_position");  
    normalsAttributeLocation = gl.getAttribLocation(program, "a_normal");
    matrixLocation = gl.getUniformLocation(program, "matrix");  
    nMatrixLocation = gl.getUniformLocation(program, "nMatrix");

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

    updateLight();
    drawScene();
}
    
    function drawScene() {    

    // Compute the camera matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 0.1;
    var zFar = 100;
    var fieldOfViewDeg = 90;
    var perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
  	var viewMatrix = utils.MakeView(camera_x, camera_y, 3.5, 0, 0); // was (..., -45, 40)
    var worldMatrix = utils.MakeWorld(Rx, Ry, Rz, 0.0, 0.0, 0.0, S);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalsAttributeLocation);
    gl.vertexAttribPointer(normalsAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW); 
  
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

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

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 );

    window.requestAnimationFrame(drawScene);
}

function init(){

    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }

    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vs);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fs);
    program = utils.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    
    model = new OBJ.Mesh(worldObjStr);
    
    main();
}

window.onload = init;

