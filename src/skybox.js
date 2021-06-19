var skyboxTexture;

var skyboxVertPos;
var skyboxVertPosAttr;

var skyboxVao;

var skyboxTexHandle;

var skyboxProgram;


function loadEnvironment(){
    skyboxVertPos = new Float32Array(
    [
      -1, -1, 1.0,
       1, -1, 1.0,
      -1,  1, 1.0,
      -1,  1, 1.0,
       1, -1, 1.0,
       1,  1, 1.0,
    ]);
    
    skyboxVao = gl.createVertexArray();
    gl.bindVertexArray(skyboxVao);
    
    var skyboxPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, skyboxVertPos, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(skyboxVertPosAttr);
    gl.vertexAttribPointer(skyboxVertPosAttr, 3, gl.FLOAT, false, 0, 0);
    
    skyboxTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + 3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
    
    var envTexDir = baseDir+"assets/env/";
 
    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
            url: envTexDir+'right.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
            url: envTexDir+'left.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
            url: envTexDir+'top.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
            url: envTexDir+'bottom.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 
            url: envTexDir+'front.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
            url: envTexDir+'back.png',
        },
    ];

    faceInfos.forEach((faceInfo) => {
        const {target, url} = faceInfo;
        
        // Upload the canvas to the cubemap face.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 2048;
        const height = 2048;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        
        // setup each face so it's immediately renderable
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
        
        // Asynchronously load an image
        const image = new Image();
        image.src = url;
        image.addEventListener('load', function() {
            // Now that the image has loaded upload it to the texture.
            gl.activeTexture(gl.TEXTURE0 + 3);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });
    
        
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
}

function DrawSkybox(){

    skyboxProgram = programs[3];

    //Uniforms
    skyboxTexHandle = gl.getUniformLocation(skyboxProgram, "u_texture"); 
    inverseViewProjMatrixHandle = gl.getUniformLocation(skyboxProgram, "inverseViewProjMatrix"); 
    skyboxVertPosAttr = gl.getAttribLocation(skyboxProgram, "in_position");
    
    gl.useProgram(skyboxProgram);
    
    gl.activeTexture(gl.TEXTURE0 + 3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
    gl.uniform1i(skyboxTexHandle, 3);

    var viewProjMat = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);
    inverseViewProjMatrix = utils.invertMatrix(viewProjMat);
    gl.uniformMatrix4fv(inverseViewProjMatrixHandle, gl.FALSE, utils.transposeMatrix(inverseViewProjMatrix));
    
    gl.bindVertexArray(skyboxVao);
    gl.depthFunc(gl.LEQUAL);
    gl.drawArrays(gl.TRIANGLES, 0, 1*6);
}