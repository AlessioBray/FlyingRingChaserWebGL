// Global variables and constants 

var textScore = null;
var maxScore = null;

POPUP_ID = 'popup';
POPUP_CONTENT_ID= 'popupContent' ;
CLOSE_BUTTON_ID= 'closeButton';

var score = document.getElementById('scoringtab');
var canvas = document.getElementById("c");
var lightController = document.getElementById("lightcontroller");
var moveController = document.getElementById("movecontroller");
var dirLightAlphaASlider = document.getElementById("dirLightAlphaA");
var dirLightBetaASlider = document.getElementById("dirLightBetaA"); //32
var dirLightAlphaBSlider = document.getElementById("dirLightAlphaB");
var dirLightBetaBSlider = document.getElementById("dirLightBetaB"); //32
var directionalLightColorASlider = document.getElementById("LAlightColor"); //#4d4d4d
var directionalLightColorBSlider = document.getElementById("LBlightColor"); //#4d4d4d

var programs = new Array();
var gl;
var model;
var vertices;
var normals;
var indices;
var positionAttributeLocation = new Array();
var normalAttributeLocation = new Array();
var uvAttributeLocation = new Array();
var textLocation = new Array();
var matrixLocation = new Array();
var nMatrixLocation = new Array();
var pMatrixLocation = new Array();

var ambientLightColorHandle = new Array();
var ambientMaterialHandle = new Array();
var materialDiffColorHandle = new Array();
var specularColorHandle = new Array();
var shineSpecularHandle = new Array();
var emissionColorHandle = new Array();
var lightDirectionHandleA = new Array();
var lightColorHandleA = new Array();
var lightDirectionHandleB = new Array();
var lightColorHandleB = new Array();

var aspect;
var perspectiveMatrix;
var viewMatrix;
var worldmatrix;

var inverseViewProjMatrix; //used in skybox


// lights 
var directionalLightA;
var directionalLightColorA;
var directionalLightB;
var directionalLightColorB;

// define material diffusion color 
var materialColor = [0.75164, 0.60648, 0.22648];

// define ambient light color and material
var ambientLight = [1.0, 1.0, 1.0];
var ambientMat = [0.24725, 0.1995, 0.0745];
  
// define specular component of color
var specularColor = [0.628281,	0.555802,	0.366065];
var specShine = 0.4*64;

// World matrix
var Rx = 0.0;
var Ry = 0.0;
var Rz = 90.0;
var S  = 1.0;


var matricesArrays= [
    //starship
    [utils.MakeWorld(0.0, 0.0, -3.0, Rx, Ry, Rz, 0.5)],
    //rings
    [utils.MakeWorld( -3.0, 0.0, -1.5, Rx, Ry, Rz, 0.5)],
    //asteroids
    [utils.MakeWorld( 3.0, 0.0, -1.5, Rx, Ry, Rz, 0.5)]
    //other objects .... [],[]...
    //
];  

// Camera
var camera_x = 0.0;
var camera_y = 0.0;
var camera_z = 20;
var delta = 5;
var camera_yaw = 0;
var camera_pitch = 0;

// Perspective
var zNear = 0.1;
var zFar = 100;
var fieldOfViewDeg = 15;

// initialize resource paths
var path = window.location.pathname;
var page = path.split("/").pop();
var baseDir = window.location.href.replace(page, '');
var shaderDir = baseDir + "shaders/";
var modelsDir = baseDir + "assets/models/";
var textureDir = baseDir + "assets/textures/"


var allMeshes;
var moonMesh;
var ringMesh;
var vaos;
var vao;


function onDropdownChange(value){
    
    console.log("Drop-down value changed to "+ value);

    switch (value) {
        case 'x-wing':
            allMeshes = [x_wingMesh];
            break;
        case 'ring':
            allMeshes = [ringMesh];
            break;
        case 'asteroid':
            allMeshes = [asteroidMesh];
            break;
      }
    
}