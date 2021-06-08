// Global variables and constants 

var textScore=null;
var maxScore = null;

POPUP_ID = 'popup';
POPUP_CONTENT_ID= 'popupContent' ;
CLOSE_BUTTON_ID= 'closeButton';

var score= document.getElementById('scoringtab');
var canvas = document.getElementById("c");
var lightController = document.getElementById("lightcontroller");
var moveController = document.getElementById("movecontroller");
var dirLightAlphaASlider = document.getElementById("dirLightAlphaA");
var dirLightBetaASlider = document.getElementById("dirLightBetaA");//32
var dirLightAlphaBSlider = document.getElementById("dirLightAlphaB");
var dirLightBetaBSlider = document.getElementById("dirLightBetaB");//32
var directionalLightColorASlider = document.getElementById("LAlightColor");//#4d4d4d
var directionalLightColorBSlider = document.getElementById("LBlightColor");//#4d4d4d

var program;
var gl;
var model;
var vertices;
var normals;
var indices;
var positionAttributeLocation;
var normalsAttributeLocation;
var matrixLocation;
var nMatrixLocation;

var ambientLightColorHandle;
var ambientMaterialHandle;
var materialDiffColorHandle;
var specularColorHandle;
var shineSpecularHandle;
var emissionColorHandle;    
var lightDirectionHandleA;
var lightColorHandleA;
var lightDirectionHandleB;
var lightColorHandleB;

var perspectiveMatrix;
var viewMatrix;

// lights 
var directionalLightA;
var directionalLightColorA;
var directionalLightB;
var directionalLightColorB;

// define material color 
var materialColor = [1.0, 1.0, 1.0];

// define ambient light color and material
var ambientLight = [0.15, 0.9, 0.8];
var ambientMat = [0.4, 0.2, 0.6];
  
// define specular component of color
var specularColor = [1.0, 1.0, 1.0];
var specShine = 10.0;

// World matrix
var Rx = 0.0;
var Ry = 0.0;
var Rz = 0.0;
var S  = 0.5;

// Camera
var camera_x = 0.0;
var camera_y = 1.25;
var camera_z = 4;
var delta = 5;
var camera_yaw = 0;
var camera_pitch = 0;

// Perspective
var zNear = 0.1;
var zFar = 100;
var fieldOfViewDeg = 15;