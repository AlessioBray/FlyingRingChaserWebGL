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
var healthBar = document.getElementById("healthbar");

healthBar.style.display = "none"; // initially is hidden


var objSelected = document.getElementById("objSelected");
var objDiv = document.getElementById("obj");


var dirLightAlphaASlider = document.getElementById("dirLightAlphaA");
var dirLightBetaASlider = document.getElementById("dirLightBetaA"); //32
var dirLightAlphaBSlider = document.getElementById("dirLightAlphaB");
var dirLightBetaBSlider = document.getElementById("dirLightBetaB"); //32
var directionalLightColorASlider = document.getElementById("LAlightColor"); //#4d4d4d
var directionalLightColorBSlider = document.getElementById("LBlightColor"); //#4d4d4d


//ring PBR uniforms
var albedoLocation;
var metalnessLocation;
var roughnessLocation;
var ambientOcclusionLocation;
var cameraPositionLocation;

var programs = new Array();
var gl;
var model;
var vertices;
var normals;
var indices;
var texture;
var positionAttributeLocation = new Array();
var normalAttributeLocation = new Array();
var uvAttributeLocation = new Array();
var textureLocation = new Array();
var worldViewProjectionMatrixLocation = new Array();
var normalMatrixLocation = new Array();
var worldMatrixLocation = new Array();
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

var cameraPositionLocation = new Array();
var normalMapLocation;
var diffuseMap;
var aoMapLocation;
var normalMap;
var metalnessMapLocation;
var heightMapLocation;

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

// Camera
var camera_x = 0.0;
var camera_y = 0.0;
var camera_z = 50;
var camera_elevation = 0;
var camera_angle = 0;

var lookRadius = 50; //same initialization as camera_z (variable used in the showcase to keep track of the zoom effect)

var delta = 5;

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

// id showcase obj
var selectedObjId = 0;

// ring spawn
var lastNewRingTime = Date.now();
var SPAWNTIME = 3500;
var ASTEROIDSPAWNRATE = 0.5;
var SPEED = 0.15;
var ANGULARSPEED_X = 0.6;
var ANGULARSPEED_Y = 0.6;
var ANGULARSPEED_Z = 0.6;
var MAX_X = 10;
var MIN_X =  5; 
var MAX_Y = 3;
var MIN_Y = 1; 

var gameOn = false;

// to reduce lag when we call main to change the object showed
var requestAnimationId;

var XWING_INDEX = 0;
var RING_INDEX = 1;
var ASTEROID_INDEX = 2;

var SKYBOX_INDEX = 3;

var CAMERA_INDEX = -1;


// scene graph variables
var objects = [];

var showcaseNode;
var xwingNode;
var ringNode;


//skybox
var skyboxTexture;

var skyboxVertPos;
var skyboxVertPosAttr;
var skyboxMatrix;

var skyboxVao;

var skyboxTexHandle;

var skyboxProgram;

// DAMAGE OF OBSTACLES

var ASTEROID_DAMAGE = 30;

//game
var GAME_CAMERA_POSITION = [0, 0, 50.0, 0, 0]; // x, y, z, elev, ang
var GAME_XWING_POSITION = [0, -0.85, 40.0];
var deltaX = 0;
var deltaY = 0;
var deltaZ = 0;
var deltaRx = 0;
var deltaRy = 0;
var deltaRz = 0;
var Z = 0;
var Y = 0;


var deltaLookRadius = 0;
var deltaCameraAngle = 0;
var deltaCameraElevation = 0;
var isCameraMoved = false;

var NUMBER_INITIALIZATION_FRAMES = 100;
var elapsedInitializationFrames = NUMBER_INITIALIZATION_FRAMES;