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

    // Render xwing and move 
    animateGameInitialization();

    clearBits();

    drawSkybox();

    drawObject(xwingNode); 

    if (elapsedInitializationFrames == 0){

        elapsedInitializationFrames = 100;
        window.cancelAnimationFrame(requestAnimationId);
        
        window.addEventListener("keydown", keyDownFunction, false);
        window.addEventListener("keyup", keyUpFunction, false);
        
        lastSpawnTime = Date.now();
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

    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
    viewMatrix = utils.MakeView(GAME_CAMERA_POSITION[0], GAME_CAMERA_POSITION[1], GAME_CAMERA_POSITION[2], camera_elevation, camera_angle);

}

function updateGameMatrices(){ 

    // Update starship world matrix
    let newWorldMatrix = utils.MakeWorld(GAME_XWING_POSITION[0],
                                         GAME_XWING_POSITION[1],
                                         GAME_XWING_POSITION[2],
                                         Rx,
                                         Ry+270,
                                         Rz,
                                         S);

    xwingNode.updateWorldMatrix(newWorldMatrix);

    // Update objects world matrices
    moveObjects();

}

function moveObjects(){

    let matrix = [];

    let boostMitigation = 0.3;
    let boost = (speed - INITIAL_SPEED) * boostMitigation;  //deltaMoveY 30 , deltaMoveX 20
    let deltaMoveY = 39 * (INITIAL_SPEED + boost) * Math.tan(utils.degToRad(deltaRotRx)); // deltaMoveY : deltaMove Z = 3:2
    let deltaMoveX = 26 * (INITIAL_SPEED + boost) * Math.tan(utils.degToRad(deltaRotRz)); 

    switch(state){
       case STATE_MOVING_DOWN : matrix = utils.MakeTranslateMatrix(0,deltaMoveY,speed); break;
       case STATE_MOVING_UP : matrix = utils.MakeTranslateMatrix(0,-deltaMoveY,speed); break;  
       case STATE_MOVING_LEFT : matrix = utils.MakeTranslateMatrix(deltaMoveX,0,speed); break;
       case STATE_MOVING_RIGHT : matrix = utils.MakeTranslateMatrix(-deltaMoveX,0,speed); break;

        case STATE_MOVING_LEFT_UP: matrix = utils.MakeTranslateMatrix(deltaMoveX, -deltaMoveY, speed); break;
        case STATE_MOVING_RIGHT_UP: matrix = utils.MakeTranslateMatrix(-deltaMoveX, -deltaMoveY, speed); break;
        case STATE_MOVING_LEFT_DOWN: matrix = utils.MakeTranslateMatrix(deltaMoveX, deltaMoveY, speed); break;
        case STATE_MOVING_RIGHT_DOWN: matrix = utils.MakeTranslateMatrix(-deltaMoveX, deltaMoveY, speed); break;

       default: matrix = utils.MakeTranslateMatrix(0, 0, speed); break;
    }

    // Update scene objects world matrices
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
        camera_elevation += 0.025;
    }
}

function moveStarshipDown(){
    if((Rx + deltaRotRx) > MAX_ROTATION_X_STARSHIP){
        Rx = MAX_ROTATION_X_STARSHIP;
    }
    else{
        Rx = Rx + deltaRotRx;
        camera_elevation -= 0.025;
    }
}

function moveStarshipRight(){
    if((Rz - deltaRotRz) < -MAX_ROTATION_Z_STARSHIP){
        Rz = -MAX_ROTATION_Z_STARSHIP;
    }
    else{
        Rz = Rz - deltaRotRz;
        camera_angle += 0.025;
    }   
}

function moveStarshipLeft(){
    if((Rz + deltaRotRz) > MAX_ROTATION_Z_STARSHIP){
        Rz = MAX_ROTATION_Z_STARSHIP;
    }
    else{
        Rz = Rz + deltaRotRz;
        camera_angle -= 0.025;
    }
}


function animateGame(){

    // Spawn objects
    if (Date.now() - lastSpawnTime > spawnTime) {
        spawnNewObject();
    }

    // animate according to current state
    switch(state){
        case STATE_STABLE: stabilizeStarship(); break;
        case STATE_MOVING_UP: moveStarshipUp(); stabilizeStarship(); break;
        case STATE_MOVING_DOWN: moveStarshipDown(); stabilizeStarship(); break;
        case STATE_MOVING_RIGHT: moveStarshipRight(); stabilizeStarship(); break;
        case STATE_MOVING_LEFT: moveStarshipLeft(); stabilizeStarship(); break;

        case STATE_MOVING_LEFT_UP: moveStarshipLeft(); moveStarshipUp(); stabilizeStarship(); break;
        case STATE_MOVING_RIGHT_UP: moveStarshipRight(); moveStarshipUp(); stabilizeStarship(); break;
        case STATE_MOVING_LEFT_DOWN: matrix = moveStarshipLeft(); moveStarshipDown(); stabilizeStarship(); break;
        case STATE_MOVING_RIGHT_DOWN: matrix = moveStarshipRight(); moveStarshipDown(); stabilizeStarship(); break;

        case STATE_COLLISSION_1: collisionAnimation1(); break;
        case STATE_COLLISSION_2: collisionAnimation2(); break;
        case STATE_COLLISSION_3: collisionAnimation3(); break;
    }

    
    
}

// Collision Animation
// -------------------

function collisionAnimation1(){
    xwingNode.drawInfo.isCollided = true;
    if(Math.abs(maxRz - delta) < Rz ){
        changeState(STATE_COLLISSION_2);
   }
   else{
       Rz = Rz+ delta;
   }
}

function collisionAnimation2(){
    xwingNode.drawInfo.isCollided = true;
    xwingNode.drawInfo.isAsteroidCollision = true;
    if((minRz+ delta) > Rz){
        changeState(STATE_COLLISSION_3);
    }
    else{
        Rz = Rz - delta;
    }
}

function collisionAnimation3(){
    xwingNode.drawInfo.isCollided = true;
    xwingNode.drawInfo.isAsteroidCollision = true;
    if(Math.abs(Rz) < delta){
        Rz = 0;
        keys = new Array();
        window.addEventListener("keydown", keyDownFunction, false);
        window.addEventListener("keyup", keyUpFunction, false);
        xwingNode.drawInfo.isCollided = false;
        xwingNode.drawInfo.isAsteroidCollision = false;
        changeState(STATE_STABLE);
   }
   else{
       Rz = Rz + delta;
   }
}

// -------------------

function stabilizeStarship(){

    if (stabilization != 0){

        let deltaRz = 1*deltaRotRz;
        let deltaRx = 1*deltaRotRx;
        
        if (stabilization == STABILIZE_Z || stabilization == STABILIZE_X_Z){ // Stabilize along Z

            if(Math.abs(Rz) < deltaRz){
                Rz = 0; // if close to stability put stable
                camera_angle = 0;
            }
            else{
                if(Rz > 0){
                    Rz = Rz - deltaRz;
                    camera_angle += 0.025;
                }
                else{ //Rz < 0 
                    Rz = Rz + deltaRz;
                    camera_angle -= 0.025;
                }
        
            }
        }

        if (stabilization == STABILIZE_X || stabilization == STABILIZE_X_Z){

            if(Math.abs(Rx)< deltaRx){
                Rx = 0; // if close to stability put stable
                camera_elevation = 0;
            }
            else{
                if(Rx > 0){
                    Rx = Rx - deltaRx;
                    camera_elevation += 0.025;
                }
                else{ //Rz < 0 
                    Rx = Rx + deltaRx;
                    camera_elevation -= 0.025;
                }
            }
        }

        if (Rz == 0){
            switch (stabilization){
                case STABILIZE_Z:
                    stabilization = 0;
                    break;
                case STABILIZE_X_Z:
                    stabilization = STABILIZE_X;
                    break;
            }
        }

        if (Rx == 0){
            switch (stabilization){
                case STABILIZE_X:
                    stabilization = 0;
                    break;
                case STABILIZE_X_Z:
                    stabilization = STABILIZE_Z;
                    break;
            }
        }
        
    }
}


function drawGameScene() {    

    animateGame();

    setGameMatrices();
    
    updateGameMatrices(); // to update scene objects world matrices

    handleObjects(); // eliminates objects out of bounds

    clearBits();
    
    drawSkybox();

    drawObject(xwingNode);

    for (var i = 0; i < objects.length; i++){
        drawObject(objects[i]);
        detectCollision(i);
    }

    if(isGameOver()) {
        gameOver("gameover");  
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
                levelDown();

                if(!xwingNode.drawInfo.isCollided){
                    startingCollisionTime = Date.now();
                    xwingNode.drawInfo.isCollided = true;
                    xwingNode.drawInfo.isAsteroidCollision = true;
                    window.removeEventListener("keydown", keyDownFunction, false);
                    window.removeEventListener("keyup", keyUpFunction, false);
                    maxRz = Rz + deltaImpact;
                    minRz = Rz - deltaImpact;
                    if (state == STATE_STABLE){
                        stabilization = 0;
                    }
                    else if (state == STATE_MOVING_LEFT || state == STATE_MOVING_RIGHT){
                        if (stabilization == 0){
                            stabilization = STABILIZE_Z;
                        }
                        else if (stabilization == STABILIZE_X){
                            stabilization = STABILIZE_X_Z;
                        }
                    }
                    else if (state == STATE_MOVING_UP || state == STATE_MOVING_DOWN){
                        if (stabilization == 0){
                            stabilization = STABILIZE_X;
                        }
                        else if (stabilization == STABILIZE_Z){
                            stabilization = STABILIZE_X_Z;
                        }
                    }
                    else if (state == STATE_MOVING_LEFT_UP || state == STATE_MOVING_RIGHT_UP || state == STATE_MOVING_LEFT_DOWN || state == STATE_MOVING_RIGHT_DOWN){
                        stabilization = STABILIZE_X_Z;
                    }
                    
                    changeState(STATE_COLLISSION_1);
                }
            }
            break;

        case HEALTH_INDEX:
            if(distance < COLLISION_RADIUS_HEALTH && i!=collision_index){
                collision_index = i;
                restoreLife(20);
                xwingNode.drawInfo.isCollided = true;
                xwingNode.drawInfo.isHealthCollision = true;
                setTimeout(function(){ 
                                xwingNode.drawInfo.isCollided = false;
                                xwingNode.drawInfo.isHealthCollision = false; 
                            }, 500);
            }
            
            break;

        case SPEED_INDEX:

            if(distance < COLLISION_RADIUS_SPEED && i!=collision_index && !xwingNode.drawInfo.isCollided){
                collision_index = i;
                levelUp();
                xwingNode.drawInfo.isCollided = true;
                xwingNode.drawInfo.isSpeedCollision = true;
                setTimeout(function(){ 
                                xwingNode.drawInfo.isCollided = false;
                                xwingNode.drawInfo.isSpeedCollision = false; 
                            }, 500);
            }
                
            break;
    }
}

function handleObjects(){ 

    for (var i = 0; i < objects.length; i++){

        if(objects[i].worldMatrix[11] > 60){ //out of bounds
            objects.shift(); //removes first object spawned in scene
            
            if (i == collision_index) {
                collision_index = -1;
            } 
        }

    }

}

// Start the game!!
function startGame(){

    canvas.removeEventListener("mousedown", doMouseDown, false);
    canvas.removeEventListener("mouseup", doMouseUp, false);
    canvas.removeEventListener("mousemove", doMouseMove, false);
    //canvas.removeEventListener("mousewheel", doMouseWheel, false);

    window.removeEventListener("keydown", keyDownFunction, false);
    window.removeEventListener("keyup", keyUpFunction, false);

    window.cancelAnimationFrame(requestAnimationId);

    window.onresize = changeGameRender;

    if(levelNode == null) initLevel();
    HideShowElement(lightController);
    HideShowElement(moveController);
    HideShowElement(objDiv);
    HideShowElement(healthBar);
    HideShowElement(score);
    HideShowElement(levelTab);
    scoretab.id = "gameScoringTab";

    restoreMaxLife();
  
    createGameSceneGraph();

    computeDeltaGameInitializationMovements();

    drawGameInitializationScene();

    gameOn = !gameOn;

}

// Update state machine
function changeState(newState){
    state = newState;
}

function restoreMaxLife(){
    restoreLife(100);
}

function restoreLife(hp){
    let newHealth = healthBar.value + hp;
    if(newHealth > healthBar.max) newHealth = healthBar.max;
    healthBar.value = newHealth;
    if (healthBar.value > 70){
        healthBar.style.setProperty("--c", "rgb(0,255,0)");
    }
    else if (healthBar.value > 15) {
        healthBar.style.setProperty("--c", "rgb(255,255,0)");
    }
    else {
        healthBar.style.setProperty("--c", "rgb(255,0,0)");
    }
}

function addScore(){
    currentScore = parseInt(textScore.nodeValue);
    newScore = currentScore + SCORE_RING*level;
    textScore.nodeValue = newScore;
}

function takeDamage(damage){  
    let newHealth = healthBar.value - damage;
    if(newHealth < healthBar.min) newHealth = healthBar.min;
    healthBar.value = newHealth;
    if (healthBar.value > 70){
        healthBar.style.setProperty("--c", "rgb(0,255,0)");
    }
    else if (healthBar.value > 15) {
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

// Game is Over
function gameOver(){
    
    window.cancelAnimationFrame(drawGameScene);
    window.removeEventListener("keydown", keyDownFunction, false);
    window.removeEventListener("keyup", keyUpFunction, false);
    
    state = STATE_STABLE;
    createPopup();
    textScore.nodeValue = "0"; //reset current score
    level = MIN_LEVEL;
    levelNode.nodeValue = MIN_LEVEL;
    speed = INITIAL_SPEED;
    spawnTime = INITIAL_SPAWN;
    starshipY = 0;
    starshipZ = 0;
    starshipX = 0;
    restoreMaxLife();
    camera_z = 50;
    lookRadius = 50;
    keys = new Array();
    Rz = 0;
    Rx = 0;
    camera_angle = 0;
    camera_elevation = 0;
    stabilization = 0;
    
    // Show showcase controllers 
    HideShowElement(lightController);  
    HideShowElement(moveController);
    HideShowElement(objDiv);
    HideShowElement(healthBar);
    HideShowElement(score);
    HideShowElement(levelTab);
    scoretab.id = "showcaseScoringTab";

    gameOn = !gameOn;
    
    // "Return" to the showcase setup 
    window.onresize = changeRender;
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

function initLevel(){
    level = MIN_LEVEL;
    levelNode = document.createTextNode(MIN_LEVEL);
    levelTab.appendChild(levelNode);
}

function levelUp(){
    if(level<MAX_LEVEL){
        level = level + 1;
        levelNode.nodeValue = level; 
        speed = speed + 0.15;
        spawnTime = spawnTime - 600;
    }
}

function levelDown(){
    if(level>MIN_LEVEL){
        level = level - 1;
        levelNode.nodeValue = level; 
        speed = speed - 0.15;
        spawnTime = spawnTime + 600;
    }
}

// Initializes scores to zero
function createScore(){
    textScore = document.createTextNode(0);
    bestScore = document.createTextNode(0);
    maxScore = 0;
    score.appendChild(textScore); 
    bestscore.appendChild(bestScore);
}

// Creates a score popup
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

// Creates a generic popup
function createPopup(){

    var popup = document.getElementById(POPUP_ID);
    if (popup !== null)
      return;
  
    var popup = document.createElement('div');    
    popup.setAttribute('id', POPUP_ID);
    
    var content = document.createElement('div');    
    content.setAttribute('id', POPUP_CONTENT_ID);
    
    content.appendChild(createCloseButtonPopup());
    
    content.appendChild(createScorePopup());
    
    
    popup.appendChild(content);
    
    document.body.appendChild(popup);
}

// Close popup
function closePopup(){
    var popup = document.getElementById(POPUP_ID);
    if (popup === null)
      return;
    
    document.body.removeChild(popup);
    // Enable key event listener
    window.addEventListener("keydown", keyDownFunction, false);
    window.addEventListener("keyup", keyUpFunction, false);
    // Enable mouse event listener
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    //canvas.addEventListener("mousewheel", doMouseWheel, false);
}

// Creates a close button in the popup
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