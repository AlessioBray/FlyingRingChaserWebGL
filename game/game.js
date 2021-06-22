function initializeGameSceneGraph(){

    objects = [];

    xwingNode = new Node();
    xwingNode.localMatrix = utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, S); //(0.0, -1.5, 40.0, 0, -90, 0, S) // for initialization moverment should be all to 0 expcept S=1
    xwingNode.drawInfo = {
        type: XWING_INDEX,
        materialColor: [1.0, 1.0, 1.0],
        programInfo: programs[XWING_INDEX],
        bufferLength: allMeshes[XWING_INDEX].indices.length,
        vertexArray: vaos[XWING_INDEX],
    };

    xwingNode.updateWorldMatrix();

    objects = [xwingNode];
    
}

var GAME_CAMERA_POSITION = [0, 0, 50.0, 0, 0]; // x, y, z, elev, ang
var GAME_XWING_POSITION = [0, -1.5, 40.0];
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

var NUMBER_INITIALIZATION_FRAMES = 100;

function computeDeltaGameInitializationMovements(){
    
    deltaZ = GAME_XWING_POSITION[2] / NUMBER_INITIALIZATION_FRAMES;
    deltaY = -1.5 / NUMBER_INITIALIZATION_FRAMES;

    if ((Ry % 360) >= 270 || (Ry % 360) <= 90){
        deltaRy = -2.5; //((Ry % 360) - 270) / NUMBER_INITIALIZATION_FRAMES;
    }
    else{ // if ((Ry % 360) < 270 && (Ry % 360) > 90)
        deltaRy = +2.5; //(270 - (Ry % 360)) / NUMBER_INITIALIZATION_FRAMES;

    }

    //-------------------------------------------------------------------------------------------
    if (lookRadius > GAME_CAMERA_POSITION[3]){
        deltaLookRadius = (GAME_CAMERA_POSITION[2] - lookRadius) / NUMBER_INITIALIZATION_FRAMES;
    }
    else{
        deltaLookRadius = -(GAME_CAMERA_POSITION[2] - lookRadius) / NUMBER_INITIALIZATION_FRAMES;
    }
    
    if (camera_elevation < 0){
        deltaCameraElevation = 0.5; //-camera_angle / NUMBER_INITIALIZATION_FRAMES;
    }
    else{
        deltaCameraElevation = -0.5; //-camera_angle / NUMBER_INITIALIZATION_FRAMES;
    }
    if (camera_angle < 0){
        deltaCameraAngle = 0.5; //-camera_angle / NUMBER_INITIALIZATION_FRAMES;
    }
    else{
        deltaCameraAngle = -0.5; //-camera_angle / NUMBER_INITIALIZATION_FRAMES;
    }
    
}


function animateGameInitialization(){

    NUMBER_INITIALIZATION_FRAMES -= 1;

    if (Z != GAME_XWING_POSITION[2]){
        Z += deltaZ;
    }
    
    if (Y != GAME_XWING_POSITION[1]){
        Y += deltaY;
    }

    if ((Ry % 360) != 270){

        if ((Ry % 360) + deltaRy < 0){
            Ry = 360 + (Ry % 360) + deltaRy;
        }
        else if (((Ry % 360) > 270 && (Ry % 360) + deltaRy < 270) || ((Ry % 360) < 270 && (Ry % 360) + deltaRy > 270)){ // fai una cosa simile per gli altri
            Ry = 270;
        }
        else{
            Ry = (Ry % 360) + deltaRy;
        }
        
    }

    var deltaMatrix = utils.MakeWorld(0, Y, Z, 0, Ry, 0, S);
    objects[0].updateWorldMatrix(deltaMatrix);

/*    
    if (Math.abs(lookRadius - GAME_CAMERA_POSITION[2]) > 0.5){
        lookRadius = lookRadius + deltaLookRadius;
    }
    else{
        lookRadius = GAME_CAMERA_POSITION[2];
    }

    if (camera_elevation != GAME_CAMERA_POSITION[3]){
        camera_elevation = camera_elevation + deltaCameraElevation;
    }

    if (camera_angle != GAME_CAMERA_POSITION[4]){
        camera_angle = camera_angle + deltaCameraAngle;
    }

    camera_z = lookRadius * Math.cos(utils.degToRad(-camera_angle)) * Math.cos(utils.degToRad(-camera_elevation));
    camera_x = lookRadius * Math.sin(utils.degToRad(-camera_angle)) * Math.cos(utils.degToRad(-camera_elevation));
    camera_y = lookRadius * Math.sin(utils.degToRad(-camera_elevation));

    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
    viewMatrix = utils.MakeView(camera_x, camera_y, camera_z, camera_elevation, -camera_angle);
*/    
}



function drawGameInitializationScene(){
    // rotate camera until it reaches the point along a circumference
    // render xwing and move 
    animateGameInitialization();

    clearBits();

    drawSkybox();

    for (var i = 0; i < objects.length; i++){
        drawObject(objects[i]);
    }

    if (NUMBER_INITIALIZATION_FRAMES == 0){ // mettere come condizione: if tutte le variabili hanno raggiunto il loro obbiettivo
        
        NUMBER_INITIALIZATION_FRAMES = 100;
        Z = 0;
        Y = 0;
        window.cancelAnimationFrame(requestAnimationId);
        //drawGameScene();
    }
    else{ 
        requestAnimationId = window.requestAnimationFrame(drawGameInitializationScene);
    }
    
}

function drawGameScene() {    

    setGameMatrices();
    
    //updateWorldMatrix(); // to update rings world matrices

    clearBits();
    
    drawSkybox();

    for (var i = 0; i < objects.length; i++){
        drawObject(objects[i]);
    }
    
    requestAnimationId = window.requestAnimationFrame(drawGameScene);
}

function setGameMatrices(){

    // Compute the camera matrix
    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
    viewMatrix = utils.MakeView(0, 0, 50.0, 0, 0);
}

//start the game!!
function startGame(){

    console.log("Cancelling animation: " + requestAnimationId);
    window.cancelAnimationFrame(requestAnimationId);

    //if(gameOn){ //if you press tab while playing game ends and rings disappear
    //matricesArrays[0] = [];
    //}

    HideShowElement(lightController);
    HideShowElement(moveController);
    HideShowElement(objDiv);
    
    gameOn = !gameOn;
  
    initializeGameSceneGraph();

    computeDeltaGameInitializationMovements();

    drawGameInitializationScene();

    //drawGameScene();

    //game(); // then is called once the initialization is finisced
}

function game(){

}


function makeNewRing(){

    ringsArrays = matricesArrays[0];
    let Tx = Math.random() * MAX_X - MIN_X;  // x in [-5,5]
    let Ty = Math.random() * MAX_Y - MIN_Y;  // y in [-1,3]
    ringsArrays.push(utils.MakeWorld(Tx, Ty, Tz, 90.0, Ry, Rz+90, S));
    lastNewRingTime = Date.now();
}

function move(){
    ringsArrays = matricesArrays[0];
    for(var i = 0; i < ringsArrays.length; i++){
        let oldMatrix = ringsArrays[i];
        ringsArrays[i] = utils.multiplyMatrices(oldMatrix,utils.MakeTranslateMatrix(0,SPEED,0.0));
    }
}

//game over
function gameOver(){

    //createPopup("gameover"); 
    //textScore.nodeValue = "0"; //reset current score

    // shows controllers 
    HideShowElement(lightController);  
    HideShowElement(moveController);
    HideShowElement(objDiv);

    gameOn = !gameOn; 

    createShowcaseSceneGraph();
    changeRender();
}


function HideShowElement(x){ // takes an element and hides/shows it
    if (x.style.display === "none") {
        x.style.display = "block";
    }
    else{
        x.style.display = "none";
    }
}

// initializes scores to zero
function createScore(){
    textScore = document.createTextNode(0);
    maxScore = 0;
    score.appendChild(textScore); 
}

//creates a score popup
function createScorePopup(){
    var scorePopup = document.createElement('div'); 
    var textScorePopup = document.createTextNode('Game Over!!');
    scorePopup.appendChild(textScorePopup);  
    var currentScore=textScore.nodeValue;
    var textScorePopup = document.createTextNode('Your score is: ' +  currentScore);
    scorePopup.appendChild(textScorePopup);  

    if(currentScore > maxScore){
        var textScorePopup = document.createTextNode('New best score!!');
        scorePopup.appendChild(textScorePopup); 
        maxScore = currentScore;
    }

    return scorePopup;
}

//creates a generic popup
function createPopup(action){

    var popup = document.getElementById(POPUP_ID);
    if (popup !== null)
      return;
  
    var popup = document.createElement('div');    
    popup.setAttribute('id', POPUP_ID);
    
    var content = document.createElement('div');    
    content.setAttribute('id',POPUP_CONTENT_ID);
    
    content.appendChild(createCloseButtonPopup());
    if (action=='gameover'){
      content.appendChild(createScorePopup());
    }
    else {
      console.log("Quit not yet implemented");
      //content.appendChild(createQuitText());  
      //content.appendChild(createQuitButtonPopup(action));
    }
    
    popup.appendChild(content);
    
    document.body.appendChild(popup);
}

//close popup
function closePopup(){
    var popup = document.getElementById(POPUP_ID);
    if (popup === null)
      return;
    
    document.body.removeChild(popup);
}

//creates a close button popup
function createCloseButtonPopup(){   
    var closeButtonPopup = document.createElement("a");
    closeButtonPopup.setAttribute('class',CLOSE_BUTTON_ID);
    closeButtonPopup.setAttribute('onClick', 'closePopup()');
    return closeButtonPopup;
}