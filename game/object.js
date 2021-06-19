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

var objSelected = document.getElementById("objSelected");
var objDiv = document.getElementById("obj")

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

var projectionMatrix;

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
var Rz = 0.0;
var S  = 1.0;

var Tz = 0.0;


var matricesArrays= [
    //starship
    [//utils.MakeWorld(10.0, 0.0, -3.0, Rx, Ry+90, Rz, 0.5),
        //utils.MakeWorld(-3.0, 0.0, -3.0, Rx, Ry+90, Rz, 0.5),
        //utils.MakeWorld( 0.0, 0.0, -1.5, Rx, Ry+90, Rz, 0.5)
    ],
    //rings
    [utils.MakeWorld( -3.0, 0.0, -1.5, Rx, Ry, Rz+90, 0.5)],
    //asteroids
    [utils.MakeWorld( 3.0, 0.0, -1.5, Rx, Ry, Rz, 0.5)]
    //other objects .... [],[]...
    //
];  

// Camera
var camera_x = 0.0;
var camera_y = 0.0;
var camera_z = 50;
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
var textureDir = baseDir + "assets/textures/";


var allMeshes;
var moonMesh;
var ringMesh;
var vaos;
var vao;

var selectedObjId = 0;

function onSelectedObjChange(value){
    
    console.log("Selected obj changed to "+ value);

    switch (value) {
        case 0:
            objSelected.textContent = "X-Wing";
            selectedObjId = XWING_INDEX;
            break;
        case 1:
            objSelected.textContent = "Ring";
            selectedObjId = RING_INDEX;
            break;
        case 2:
            objSelected.textContent = "Asteroid";
            selectedObjId = ASTEROID_INDEX;
            break;
      }
    
      changeRender();
}

// ring spawn
var lastNewRingTime = Date.now();
var SPAWNTIME = 1000;
var SPEED = 0.1;
var MAX_X = 10;
var MIN_X =  5; //negative
var MAX_Y = 3;
var MIN_Y = 1; //negative
var gameOn = false;


// to reduce lag when we call main to change the object showed
var requestAnimationId;

var XWING_INDEX = 0;
var RING_INDEX = 1;
var ASTEROID_INDEX = 2;

var SKYBOX_INDEX = 3;


// scene graph variables
var objects = [];

var showcaseNode;
