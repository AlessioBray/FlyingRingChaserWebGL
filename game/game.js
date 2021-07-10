function computeDeltaGameInitializationMovements(){
    
    deltaZ = GAME_XWING_POSITION[2] / NUMBER_INITIALIZATION_FRAMES;
    deltaY = GAME_XWING_POSITION[1] / NUMBER_INITIALIZATION_FRAMES;

    if ((Ry % 360) >= 270 || (Ry % 360) <= 90){
        deltaRy = -2.5;
    }
    else{ // if ((Ry % 360) < 270 && (Ry % 360) > 90)
        deltaRy = +2.5;

    }

    deltaLookRadius = (GAME_CAMERA_POSITION[2] - lookRadius) / NUMBER_INITIALIZATION_FRAMES;

    if (camera_elevation != 0 || camera_angle != 0){
        isCameraMoved = true;
    }
    camera_elevation = 0;
    camera_angle = 0;
    
}

function animateGameInitialization(){

    elapsedInitializationFrames -= 1;

    if (starshipZ != GAME_XWING_POSITION[2]){
        starshipZ += deltaZ;
    }
    
    if (starshipY != GAME_XWING_POSITION[1]){
        starshipY += deltaY;
    }

    if (selectedObjId != XWING_INDEX || isCameraMoved){
        Ry = 270;
    }
    else{
        if ((Ry % 360) != 270){

            if (((Ry % 360) > 270 && (Ry % 360) + deltaRy < 270) || ((Ry % 360) < 270 && (Ry % 360) + deltaRy > 270)){
                Ry = 270;
            }
            else if ((Ry % 360) + deltaRy < 0){
                Ry = 360 + Ry + deltaRy;
            }
            else if ((Ry % 360) + deltaRy > 0){
                Ry = Ry + deltaRy;
            }
    
        }
    }
    
    xwingNode.worldMatrix = utils.MakeWorld(starshipX, starshipY, starshipZ, 0, Ry+270, 0, S);

    if (Math.abs(lookRadius - GAME_CAMERA_POSITION[2]) > 0.5){
        lookRadius = lookRadius + deltaLookRadius;
    }
    else{
        lookRadius = GAME_CAMERA_POSITION[2];
    }

    camera_z = lookRadius * Math.cos(utils.degToRad(-camera_angle)) * Math.cos(utils.degToRad(-camera_elevation));
    camera_x = lookRadius * Math.sin(utils.degToRad(-camera_angle)) * Math.cos(utils.degToRad(-camera_elevation));
    camera_y = lookRadius * Math.sin(utils.degToRad(-camera_elevation));

    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
    viewMatrix = utils.MakeView(camera_x, camera_y, camera_z, camera_elevation, -camera_angle);
    
}

function drawGameInitializationScene(){

    // render xwing and move 
    animateGameInitialization();

    clearBits();

    drawSkybox();

    drawObject(xwingNode); 

    if (elapsedInitializationFrames == 0){

        elapsedInitializationFrames = 100;
        window.cancelAnimationFrame(requestAnimationId);
        
        window.addEventListener("keydown", keyDownFunction, false);
        window.addEventListener("keyup", keyUpFunction, false);
        
        lastNewRingTime = Date.now();
        createFreeNodes();
        drawGameScene(); // when animation is finished starts spawning

        //// used to keep track of rotation of starship
        Rx = 0;
        Rz = 0;
    }
    else{ 
        requestAnimationId = window.requestAnimationFrame(drawGameInitializationScene);
    }
    
}


function setGameMatrices(){

    // Compute the camera matrix
    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
    viewMatrix = utils.MakeView(GAME_CAMERA_POSITION[0], GAME_CAMERA_POSITION[1], GAME_CAMERA_POSITION[2], GAME_CAMERA_POSITION[3], GAME_CAMERA_POSITION[4]);

}

function updateGameMatrices(){ 

    // update starship world matrix
    let newWorldMatrix = utils.MakeWorld(GAME_XWING_POSITION[0],
                                         GAME_XWING_POSITION[1],
                                         GAME_XWING_POSITION[2],
                                         Rx,
                                         Ry+270,
                                         Rz,
                                         S);

    xwingNode.updateWorldMatrix(newWorldMatrix);

    //update objects world matrices
    moveObjects();

}

function moveObjects(){

    let matrix = [];

    let deltaMoveX = 30 * SPEED * Math.tan(utils.degToRad(deltaRotRx)); 
    let deltaMoveZ = 20 * SPEED * Math.tan(utils.degToRad(deltaRotRz)); 

    switch(state){
       case STATE_MOVING_DOWN : matrix = utils.MakeTranslateMatrix(0,deltaMoveX,SPEED); break;
       case STATE_MOVING_UP : matrix = utils.MakeTranslateMatrix(0,-deltaMoveX,SPEED); break;
       case STATE_MOVING_LEFT : matrix = utils.MakeTranslateMatrix(deltaMoveZ,0,SPEED); break;
       case STATE_MOVING_RIGHT : matrix = utils.MakeTranslateMatrix(-deltaMoveZ,0,SPEED); break;
       default: matrix = utils.MakeTranslateMatrix(0,0,SPEED); break;
    }

    for (var i = 0; i < objects.length; i++){  
        let object = objects[i];
        let newWorldMatrix = utils.multiplyMatrices(matrix,object.worldMatrix);
        object.updateWorldMatrix(newWorldMatrix); 
    }  

}

function moveStarshipUp(){
    if((Rx - deltaRotRx) < - MAX_ROTATION_X_STARSHIP){
        Rx = -MAX_ROTATION_X_STARSHIP;

    }
    else{

        Rx = Rx - deltaRotRx;
    }
}

function moveStarshipDown(){
    if((Rx + deltaRotRx) > MAX_ROTATION_X_STARSHIP){
        Rx = MAX_ROTATION_X_STARSHIP;
    }
    else{
        Rx = Rx + deltaRotRx;
    }
}

function moveStarshipRight(){
    if((Rz - deltaRotRz) < -MAX_ROTATION_Z_STARSHIP){
        Rz = -MAX_ROTATION_Z_STARSHIP;
    }
    else{
        Rz = Rz - deltaRotRz;
    }   
}

function moveStarshipLeft(){
    if((Rz + deltaRotRz) > MAX_ROTATION_Z_STARSHIP){
        Rz = MAX_ROTATION_Z_STARSHIP;
    }
    else{
        Rz = Rz + deltaRotRz;
    }
}

function animateGame(){

    // spawn objects
    if (Date.now() - lastNewRingTime > SPAWNTIME) {
        spawnNewObject();
    }

    // animate according to current state
    switch(state){
        case STATE_STABLE: stabilizeStarship(); break;
        case STATE_MOVING_UP: moveStarshipUp(); break;
        case STATE_MOVING_DOWN: moveStarshipDown(); break;
        case STATE_MOVING_RIGHT: moveStarshipRight(); break;
        case STATE_MOVING_LEFT: moveStarshipLeft(); break;
        case STATE_COLLISSION_1: collisionAnimation1(); break;
        case STATE_COLLISSION_2: collisionAnimation2(); break;
        case STATE_COLLISSION_3: collisionAnimation3(); break;
        default: console.log("Error in state machine, state undefined!!");
    }
    
}

//COLLISSION ANIMATION
function collisionAnimation1(){
    if(Math.abs(maxRz - delta) < Rz ){
        changeState(STATE_COLLISSION_2);
   }
   else{
       Rz = Rz+ delta;
   }
}

function collisionAnimation2(){
    if( (minRz+ delta) > Rz  ){
        changeState(STATE_COLLISSION_3);
    }
    else{
        Rz = Rz - delta;
    }
}

function collisionAnimation3(){
    if(Math.abs(Rz) < delta){
        Rz=0;
        window.addEventListener("keydown", keyDownFunction, false);
        window.addEventListener("keyup", keyUpFunction, false);
        changeState(STATE_STABLE);
   }
   else{
       Rz = Rz+ delta;
   }
}


function stabilizeStarship(){
        //stabilize starship
      let deltaRz = 1*deltaRotRz;
      let deltaRx = 1*deltaRotRx;

      if(Math.abs(Rz)< deltaRz)Rz=0; // if close to stability put stable
        else{
            if(Rz > 0){
                Rz = Rz-deltaRz;
            }
            else{ //Rz < 0 
                Rz = Rz + deltaRz;
            }
        }
        if(Math.abs(Rx)< deltaRx) Rx=0; // if close to stability put stable
        else{
            if(Rx > 0){
                Rx = Rx-deltaRx;
            }
            else{ //Rz < 0 
                Rx = Rx + deltaRx;
            }
        }
}

function drawGameScene() {    

    animateGame();

    setGameMatrices();
    
    updateGameMatrices(); // to update rings/asteroids world matrices

    handleObjects(); // eliminates objects out of bounds

    clearBits();
    
    drawSkybox();

    drawObject(xwingNode);

    for (var i = 0; i < objects.length; i++){
        drawObject(objects[i]);
        detectCollision(i);
    }

    if(isGameOver()) {
        gameOver();
        startCollisionAnimation = false; 
        window.cancelAnimationFrame(drawGameScene);
        window.addEventListener("keydown", keyDownFunction, false);
        window.addEventListener("keyup", keyUpFunction, false);
    }
    else{
        requestAnimationId = window.requestAnimationFrame(drawGameScene);
    }
}

function detectCollision(i){

    let object = objects[i];
    let tx = object.worldMatrix[3] - GAME_XWING_POSITION[0];
    let ty = object.worldMatrix[7] - GAME_XWING_POSITION[1];
    let tz = object.worldMatrix[11] - GAME_XWING_POSITION[2];
    let distance = Math.sqrt(Math.pow(tx,2) + Math.pow(ty,2) + Math.pow(tz,2));
    let type = object.drawInfo["type"];

    switch(type){
        case RING_INDEX:
            if (distance < COLLISION_RADIUS_RING && i != collision_index){
                collision_index = i;
                object.drawInfo["isMissed"] = false;
                object.drawInfo["changeColor"] = true;
                addScore();
            }
            else if (distance > COLLISION_RADIUS_RING && tz > -2.4) { // Ring is missed
                object.drawInfo["isMissed"] = true;
                object.drawInfo["changeColor"] = true;
            }

            break;

            
   
        case ASTEROID_INDEX:
            if(distance < COLLISION_RADIUS_ASTEROID && i!=collision_index){
                collision_index = i;
                takeDamage(ASTEROID_DAMAGE);
                maxRz = Rz + deltaImpact;
                minRz = Rz - deltaImpact;
                window.removeEventListener("keydown", keyDownFunction, false);
                window.removeEventListener("keyup", keyUpFunction, false);
                changeState(STATE_COLLISSION_1);
            }

            break;
    }
}

function handleObjects(){ 

    for (var i = 0; i < objects.length; i++){

        if(objects[i].worldMatrix[11] > 60){ //out of bounds
            objects.shift(); //removes first object spawned in scene
            if(i == collision_index) collision_index = -1; 
        }

    }


}

//start the game!!
function startGame(){

    //console.log("Cancelling animation: " + requestAnimationId);
    window.cancelAnimationFrame(requestAnimationId);

    window.onresize = changeGameRender;

    HideShowElement(lightController);
    HideShowElement(moveController);
    HideShowElement(objDiv);
    HideShowElement(healthBar);

    restoreMaxLife();
  
    createGameSceneGraph();

    computeDeltaGameInitializationMovements();

    drawGameInitializationScene();

    gameOn = !gameOn;

}

/////////////////// little state machine
function changeState(newState){

    state = newState;

}

/////////////////////////////////



function game(){ // function called for each frame of time
    //alert("game!!");
    // funzione di gestione del gioco (chiamata iterativamente):
    // chiama le funzioni di creazione di ostacoli
    // chiama la funzione di controllo delle collisioni

    // per evitare che ogni volta che game viene eseguita occorre chiamare la drawGameScene un'unica volta all'inizio
    // poi ci penserà la request animation a fare il lavoro.
    // OPPURE
    // la request animation frame si sposta sulla funzione game che conterrà la chiamata a drawGameScene 
}

function restoreMaxLife(){
    healthBar.value = healthBar.max;
    healthBar.style.setProperty("--c", "rgb(0,255,0)");
}

function addScore(){
    currentScore = parseInt(textScore.nodeValue);
    newScore = currentScore + SCORE_RING;
    textScore.nodeValue = newScore;
}

function takeDamage(damage){  //should be called takeDamage(ASTEROID_DAMAGE)
    let newHealth = healthBar.value - damage;
    if(newHealth < healthBar.min) newHealth = healthBar.min;
    healthBar.value = newHealth;
    if (healthBar.value > 70){
        healthBar.style.setProperty("--c", "rgb(0,255,0)");
    }
    else if (healthBar.value > 30) {
        healthBar.style.setProperty("--c", "rgb(255,255,0)");
    }
    else {
        healthBar.style.setProperty("--c", "rgb(255,0,0)");
    }
}

function isGameOver(){
    let gameOver = false;
    if(healthBar.value == 0){
        gameOver = true;
    }
    return gameOver;
}

//game over
function gameOver(){
    
    createPopup("gameover");

    window.onresize = changeRender;

    textScore.nodeValue = "0"; //reset current score
    starshipY = 0;
    starshipZ = 0;
    restoreMaxLife();
    camera_z = 50;
    lookRadius = 50;

    // enable mouse event listener
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    canvas.addEventListener("mousewheel", doMouseWheel, false);

    // shows controllers 
    HideShowElement(lightController);  
    HideShowElement(moveController);
    HideShowElement(objDiv);
    HideShowElement(healthBar);

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
    bestScore = document.createTextNode(0);
    maxScore = 0;
    score.appendChild(textScore); 
    bestscore.appendChild(bestScore);
}

//creates a score popup
function createScorePopup(){
    var scoreDiv = document.createElement('div');
    var ulElement = document.createElement('ul');
    ulElement.style = 'padding-left: 0px;'
    var liElement;
    
    liElement = document.createElement('li');
    liElement.innerText = "Game Over!!";
    liElement.style = 'padding-bottom: 24px;'
    ulElement.appendChild(liElement);
    
    liElement = document.createElement('li');
    var currentScore = parseInt(textScore.nodeValue);
    liElement.innerText = "Your score is: " +  currentScore;
    liElement.style = 'padding-bottom: 24px;'
    ulElement.appendChild(liElement);

    if(currentScore > maxScore){
        liElement = document.createElement('li');
        liElement.innerText = 'New best score!!';
        ulElement.appendChild(liElement);
        
        maxScore = currentScore;
        bestScore.nodeValue = maxScore;
    }
    
    scoreDiv.appendChild(ulElement);
    
    return scoreDiv;
}

//creates a generic popup
function createPopup(action){

    var popup = document.getElementById(POPUP_ID);
    if (popup !== null)
      return;
  
    var popup = document.createElement('div');    
    popup.setAttribute('id', POPUP_ID);
    
    var content = document.createElement('div');    
    content.setAttribute('id', POPUP_CONTENT_ID);
    
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
    var closeButtonPopup = document.createElement("button");
    closeButtonPopup.setAttribute('class', CLOSE_BUTTON_ID);
    closeButtonPopup.setAttribute('onClick', 'closePopup()');
    closeButtonPopup.innerText = "Return to Showcase";
    return closeButtonPopup;
}

function changeGameRender(){
    window.cancelAnimationFrame(requestAnimationId);
    gameRender();
}

function gameRender(){

    utils.resizeCanvasToDisplaySize(gl.canvas);
    setViewportAndCanvas();

    drawGameScene();
}