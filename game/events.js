function keyDownFunction(e){
     
    switch(e.key){
  
        case "ArrowLeft" :
            case "a" :  
            //camera_yaw -= delta;
            selectedObjId = (selectedObjId - 1) % 3;
            if (selectedObjId < 0){
                selectedObjId = selectedObjId + 3;
            }
            onSelectedObjChange(selectedObjId);
            break;
        
        case "ArrowRight":
            case "d":   
            //camera_yaw += delta;
            selectedObjId = (selectedObjId + 1) % 3;
            onSelectedObjChange(selectedObjId);
            break;

        case "ArrowUp":
            case "w": 
            camera_pitch += delta;

            break;

        case "ArrowDown":
            case "s": 
            camera_pitch -= delta;

            break;

        default:
            break;  
    }

}

function keyUpFunction(e){

    if (e.keyCode == 32) {  // spacebar
        game();
    } 

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
    R = parseInt(col.substring(0,2) ,16) / 255;
    G = parseInt(col.substring(2,4) ,16) / 255;
    B = parseInt(col.substring(4,6) ,16) / 255;
    return [R,G,B]
}

createScore(); 
window.addEventListener("keydown", keyDownFunction, false);
window.addEventListener("keyup", keyUpFunction, false);
dirLightAlphaASlider.addEventListener("input",updateLights,false);
dirLightBetaASlider.addEventListener("input",updateLights,false);
dirLightAlphaBSlider.addEventListener("input",updateLights,false);
dirLightBetaBSlider.addEventListener("input",updateLights,false);
directionalLightColorASlider.addEventListener("input",updateLights,false);
directionalLightColorBSlider.addEventListener("input",updateLights,false);

canvas.addEventListener("mousedown", doMouseDown, false);
canvas.addEventListener("mouseup", doMouseUp, false);
canvas.addEventListener("mousemove", doMouseMove, false);

var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
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
			Rx = Rx - 0.5 * dx; /// ruota attorno a Rx e Rz dell'oggetto, invece deve essere assoluto => vedi come fa lui negli esempi
			Rz = Rz - 0.5 * dy;
		}
	}

}