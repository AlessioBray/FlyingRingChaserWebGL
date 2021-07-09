function keyDownFunction(e){

    switch(e.key){
  
        case "ArrowLeft":
        case "a":  
            if (!gameOn){
                selectedObjId = (selectedObjId - 1) % 3;
                if (selectedObjId < 0){
                    selectedObjId = selectedObjId + 3;
                }
                onSelectedObjChange(selectedObjId);
                break;
            }
            else{
                changeState(STATE_MOVING_LEFT);
                //moveStarship('left');
                break;
            }
            
        case "ArrowRight":
        case "d":
            if (!gameOn){
                selectedObjId = (selectedObjId + 1) % 3;
                onSelectedObjChange(selectedObjId);
                break;
            }
            else{
                changeState(STATE_MOVING_RIGHT);
                //moveStarship('right');
                break;
            }

        case "ArrowUp":
        case "w": 
            if (gameOn){
                changeState(STATE_MOVING_UP);
                //moveStarship('up');
            }
            
            break;

        case "ArrowDown":
        case "s": 
            
            if (gameOn){
               changeState(STATE_MOVING_DOWN);
               //moveStarship('down');
            }
            break;

        default:
            break;  
    }

}

function keyUpFunction(e){

    if (e.keyCode == 32) {  // spacebar
        if (!gameOn){

            canvas.removeEventListener("mousedown", doMouseDown, false);
            canvas.removeEventListener("mouseup", doMouseUp, false);
            canvas.removeEventListener("mousemove", doMouseMove, false);
            canvas.removeEventListener("mousewheel", doMouseWheel, false);

            window.removeEventListener("keydown", keyDownFunction, false);
            window.removeEventListener("keyup", keyUpFunction, false);
            
            startGame();

        }
        else{
            gameOver();
        }    
    }

    if((e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || 
        e.keyCode == 65 // "a"
        || e.keyCode == 32 //"w"
        || e.keyCode == 83 // "s"
        || e.keyCode == 68 //"d" 
        ) && gameOn) {
            changeState(STATE_STABLE);
        };

}

function updateLights(){

    var dirLightAlphaA = utils.degToRad(dirLightAlphaASlider.value);//20
    var dirLightBetaA = utils.degToRad(dirLightBetaASlider.value);//32

    directionalLightA = [Math.cos(180 - dirLightAlphaA) * Math.cos(dirLightBetaA),
                         Math.sin(180 - dirLightAlphaA),
                         Math.cos(180 - dirLightAlphaA) * Math.sin(dirLightBetaA)
                        ];

    directionalLightColorA = fromHexToRGBVec(directionalLightColorASlider.value);//#4d4d4d

    // directional light B
    var dirLightAlphaB = utils.degToRad(dirLightAlphaBSlider.value);//55
    var dirLightBetaB = utils.degToRad(dirLightBetaBSlider.value);//95

    directionalLightB = [-Math.cos(dirLightAlphaB) * Math.cos(dirLightBetaB),
                        Math.sin(dirLightAlphaB),
                        Math.cos(dirLightAlphaB) * Math.sin(dirLightBetaB)
                        ];

    directionalLightColorB = fromHexToRGBVec(directionalLightColorBSlider.value);//5e5e5e

}

function fromHexToRGBVec(hex) {
    col = hex.substring(1,7);
    R = parseInt(col.substring(0,2), 16) / 255;
    G = parseInt(col.substring(2,4), 16) / 255;
    B = parseInt(col.substring(4,6), 16) / 255;
    return [R,G,B]
}

var mouseState = false;
var lastMouseX = -100, 
    lastMouseY = -100;

function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
}

function doMouseUp(event) {
	lastMouseX = -100;
	lastMouseY = -100;
	mouseState = false;
}

function doMouseMove(event) {
	if(mouseState) {
		var dx = event.pageX - lastMouseX;
		var dy = lastMouseY - event.pageY;
		lastMouseX = event.pageX;
		lastMouseY = event.pageY;
		
		if((dx != 0) || (dy != 0)) {
			camera_angle = camera_angle + 0.5 * dx;
			camera_elevation = camera_elevation + 0.5 * dy;
		}
        
        camera_z = lookRadius * Math.cos(utils.degToRad(-camera_angle)) * Math.cos(utils.degToRad(-camera_elevation));
	    camera_x = lookRadius * Math.sin(utils.degToRad(-camera_angle)) * Math.cos(utils.degToRad(-camera_elevation));
	    camera_y = lookRadius * Math.sin(utils.degToRad(-camera_elevation));
	    viewMatrix = utils.MakeView(camera_x, camera_y, camera_z, camera_elevation, -camera_angle);
    }

}

function doMouseWheel(event) {
	var nLookRadius = lookRadius + event.wheelDelta / 100.0;
	if((nLookRadius > 5.0) && (nLookRadius < 70.0)) {
		lookRadius = nLookRadius;
	}

    camera_z = lookRadius * Math.cos(utils.degToRad(-camera_angle)) * Math.cos(utils.degToRad(-camera_elevation));
	camera_x = lookRadius * Math.sin(utils.degToRad(-camera_angle)) * Math.cos(utils.degToRad(-camera_elevation));
	camera_y = lookRadius * Math.sin(utils.degToRad(-camera_elevation));
	viewMatrix = utils.MakeView(camera_x, camera_y, camera_z, camera_elevation, -camera_angle);
}

function onSelectedObjChange(objectId){
    
    //console.log("Selected obj changed to "+ objectId);

    switch (objectId) {
        case XWING_INDEX:
            objSelected.textContent = "X-Wing";
            selectedObjId = XWING_INDEX;
            break;
        case RING_INDEX:
            objSelected.textContent = "Ring";
            selectedObjId = RING_INDEX;
            break;
        case ASTEROID_INDEX:
            objSelected.textContent = "Asteroid";
            selectedObjId = ASTEROID_INDEX;
            break;
      }
    
      changeRender();
}


createScore();

// Light event listeners
dirLightAlphaASlider.addEventListener("input",updateLights,false);
dirLightBetaASlider.addEventListener("input",updateLights,false);
dirLightAlphaBSlider.addEventListener("input",updateLights,false);
dirLightBetaBSlider.addEventListener("input",updateLights,false);
directionalLightColorASlider.addEventListener("input",updateLights,false);
directionalLightColorBSlider.addEventListener("input",updateLights,false);

// Showcase event listeners (mouse movement)
canvas.addEventListener("mousedown", doMouseDown, false);
canvas.addEventListener("mouseup", doMouseUp, false);
canvas.addEventListener("mousemove", doMouseMove, false);
canvas.addEventListener("mousewheel", doMouseWheel, false);

// Showcase event listeners (key)
window.addEventListener("keydown", keyDownFunction, false);
window.addEventListener("keyup", keyUpFunction, false);