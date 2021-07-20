var gl; // context

var programs = new Array(); // shader array

var vaos;

var requestAnimationId; // Id of the animation that is being requested

var selectedObjId = 0; // id showcase obj

// Meshes
// ------

var allMeshes;
var xwingMesh;
var ringMesh;
var asteroidMesh;
var healthMesh;
var speedMesh;

// ------

// Scene graph
// -----------

var objects = [];

var XWING_INDEX = 0;
var RING_INDEX = 1;
var ASTEROID_INDEX = 2;
var HEALTH_INDEX = 3;
var SPEED_INDEX = 4;
var SKYBOX_INDEX = 5;

var NUMBER_SHOWCASE_OBJECTS = 5;

var showcaseNode;
var xwingNode;
var ringNode;

// -----------

// Initialize resource paths
// -------------------------

var path = window.location.pathname;
var page = path.split("/").pop();
var baseDir = window.location.href.replace(page, '');
var shaderDir = baseDir + "shaders/";
var modelsDir = baseDir + "assets/models/";
var textureDir = baseDir + "assets/textures/";

// -------------------------

// Matrices
// --------

var projectionMatrix;

// World matrix
var worldmatrix;
var Rx = 0.0;
var Ry = 0.0;
var Rz = 0.0;
var S  = 1.0;
var Tz = 0.0; 

// View Matrix
var viewMatrix;
var camera_x = 0.0;
var camera_y = 0.0;
var camera_z = 50;
var camera_elevation = 0;
var camera_angle = 0;

var lookRadius = camera_z; //same initialization as camera_z (variable used in the showcase to keep track of the zoom effect)

// Perspective matrix
var perspectiveMatrix;
var zNear = 0.1;
var zFar = 100;
var fieldOfViewDeg = 15;
var aspect;

// --------

// HTML elements
// -------------

var canvas = document.getElementById("c");
var lightController = document.getElementById("lightcontroller");
var moveController = document.getElementById("movecontroller");
var objSelected = document.getElementById("objSelected");
var objDiv = document.getElementById("obj");
var score = document.getElementById('score');
var scoretab = document.getElementById('showcaseScoringTab');
var bestscore = document.getElementById('bestscore');
var healthBar = document.getElementById("healthbar");
var levelTab = document.getElementById("levelTab");
healthBar.style.display = "none"; // healthbar is initially is hidden
levelTab.style.display = "none";

// Light controller elements
var dirLightAlphaASlider = document.getElementById("dirLightAlphaA");
var dirLightBetaASlider = document.getElementById("dirLightBetaA"); //32
var dirLightAlphaBSlider = document.getElementById("dirLightAlphaB");
var dirLightBetaBSlider = document.getElementById("dirLightBetaB"); //32
var directionalLightColorASlider = document.getElementById("LAlightColor"); //#4d4d4d
var directionalLightColorBSlider = document.getElementById("LBlightColor"); //#4d4d4d

// Lights values 
var directionalLightA;
var directionalLightColorA;
var directionalLightB;
var directionalLightColorB;

// Score Popup
var textScore = null;
var maxScore = null;

POPUP_ID = 'gameOverPopup';
POPUP_CONTENT_ID = 'popupContent' ;
CLOSE_BUTTON_ID = 'closeButton';

//Level system
var levelNode = null;
var MAX_LEVEL = 4;
var MIN_LEVEL = 1;
var level;


// -------------

// Attributes and Uniforms location variables
// ------------------------------------------

var positionAttributeLocation = new Array();
var normalAttributeLocation = new Array();
var uvAttributeLocation = new Array();

// Matrices
var worldViewProjectionMatrixLocation = new Array();
var normalMatrixLocation = new Array();
var worldMatrixLocation = new Array();
var cameraPositionLocation = new Array();

// Lights
var lightDirectionHandleA = new Array();
var lightColorHandleA = new Array();
var lightDirectionHandleB = new Array();
var lightColorHandleB = new Array();

// X-Wing
var textureLocation;
var isCollidedLocation;

var isAsteroidCollisionLocation;
var isHealthCollisionLocation;
var isSpeedCollisionLocation;

var collisionTimeElapsedLocation; /////////////////////////////

// Asteroid maps
var normalMapLocation;
var diffuseMapLocation;
var aoMapLocation;
var metalnessMapLocation;
var heightMapLocation;

// Ring
var changeColorLocation;
var isMissedLocation;

// ------------------------------------------

// Textures variables
// ------------------

var images = [];
var textures = [];

// ------------------

// Skybox
// ------

var skyboxTexture;

var skyboxVertPos;
var skyboxVertPosAttr;
var skyboxMatrix;

var skyboxVao;

var skyboxTexHandle;

var skyboxProgram;

var inverseViewProjMatrix; //used in skybox

// ------

// Game
// ----

var gameOn = false;
var GAME_CAMERA_POSITION = [0, 0, 70.0, 0, 0]; // x, y, z, elev, ang
var GAME_XWING_POSITION = [0, -0.85, 60.0];

// Game initialization
var deltaX = 0;
var deltaY = 0;
var deltaZ = 0;
var deltaRx = 0;
var deltaRy = 0;
var deltaRz = 0;
var deltaLookRadius = 0;
var deltaCameraAngle = 0;
var deltaCameraElevation = 0;
var isCameraMoved = false;
var starshipX = 0;
var starshipY = 0;
var starshipZ = 0;
var NUMBER_INITIALIZATION_FRAMES = 100;
var elapsedInitializationFrames = NUMBER_INITIALIZATION_FRAMES;
var stable = true;

// Spawn
var lastNewRingTime = Date.now();
var INITIAL_SPEED = 0.30;
var INITIAL_SPAWN = 3000;
var speed = INITIAL_SPEED;
var spawnTime = INITIAL_SPAWN;// * speed * (Math.pow(level,8)) ; // spawntime decreases with levels
var RINGSPAWNRATE = 0.35;
var ASTEROIDSPAWNRATE = 0.45;
var HEALTHSPAWNRATE = 0.1;
var SPEEDSPAWNRATE = 0.1;
var spawnRates = [RINGSPAWNRATE,ASTEROIDSPAWNRATE,HEALTHSPAWNRATE,SPEEDSPAWNRATE];
var deltaMove = 0.01;
var deltaRotRz = 0.25;//0.3;
var deltaRotRx = 0.15;//deltaRotRz * 0.25; 
var ANGULARSPEED_X = 0.6;
var ANGULARSPEED_Y = 0.6;
var ANGULARSPEED_Z = 0.6;
var MAX_X = 4 - GAME_XWING_POSITION[0];//10;
var MIN_X = 2 - GAME_XWING_POSITION[0]; //5; 
var MAX_Y = 2 - GAME_XWING_POSITION[1]; //2 
var MIN_Y = 1 - GAME_XWING_POSITION[1]; //1
var MAX_ROTATION_X_STARSHIP = 5;
var MAX_ROTATION_Z_STARSHIP = 10;

// Collision
var COLLISION_RADIUS_ASTEROID = 1.5;
var COLLISION_RADIUS_RING = 2.5;
var COLLISION_RADIUS_HEALTH = 1.0;
var COLLISION_RADIUS_SPEED = 1.0;
var SCORE_RING = 300;
var ASTEROID_DAMAGE = 30;

var startingCollisionTime;

// Collision Animation
var deltaImpact = 30;
var startCollisionAnimation = false;
var firstPartCollisionAnimation = true;
var secondPartCollisionAnimation = false;
var thirdPartCollisionAnimation = false;
var initAnimation = true;
var maxRz;
var minRz;
var delta = 2.5;

// Object pooling
var NUM_OBJECTS_IN_SCENE = 10;
var nodes = [];
var freeslot = 0;
var collision_index = -1;

//state machine
var state = 0;
var STATE_STABLE = 0;
var STATE_MOVING_UP = 1;
var STATE_MOVING_DOWN = 2;
var STATE_MOVING_RIGHT = 3;
var STATE_MOVING_LEFT = 4;
var STATE_COLLISSION_1 = 5; 
var STATE_COLLISSION_2 = 6;
var STATE_COLLISSION_3 = 7;

var STATE_MOVING_LEFT_UP = 8;
var STATE_MOVING_RIGHT_UP = 9;
var STATE_MOVING_LEFT_DOWN = 10;
var STATE_MOVING_RIGHT_DOWN = 11;

var STATE_STABILIZE_LEFT = 12;
var STATE_STABILIZE_RIGHT = 13;
var STATE_STABILIZE_UP = 14;
var STATE_STABILIZE_DOWN = 15;

var STATE_STABILIZE_LEFT_UP = 16;
var STATE_STABILIZE_RIGHT_UP = 17;
var STATE_STABILIZE_LEFT_DOWN = 18;
var STATE_STABILIZE_RIGHT_DOWN = 19;

var stabilization = 0;

// ----


// Events
// ------

var keys = new Array();

// ------