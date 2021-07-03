function computeDeltaGameInitializationMovements(){
    
    deltaZ = GAME_XWING_POSITION[2] / NUMBER_INITIALIZATION_FRAMES;
    deltaY = GAME_XWING_POSITION[1] / NUMBER_INITIALIZATION_FRAMES;

    if ((Ry % 360) >= 270 || (Ry % 360) <= 90){
        deltaRy = -2.5; //((Ry % 360) - 270) / NUMBER_INITIALIZATION_FRAMES;
    }
    else{ // if ((Ry % 360) < 270 && (Ry % 360) > 90)
        deltaRy = +2.5; //(270 - (Ry % 360)) / NUMBER_INITIALIZATION_FRAMES;

    }

    deltaLookRadius = (GAME_CAMERA_POSITION[2] - lookRadius) / NUMBER_INITIALIZATION_FRAMES;
    
    /*
    if (camera_x > 0 && camera_y > 0 && camera_z > 0){
        deltaCameraElevation = -0.5;
        deltaCameraAngle = -0.5;
    }
    else if (camera_x < 0 && camera_y > 0 && camera_z >0){
        deltaCameraElevation = -0.5;
        deltaCameraAngle = 0.5;
    }
    */

    if (camera_elevation != 0 || camera_angle != 0){
        isCameraMoved = true;
    }
    camera_elevation = 0;
    camera_angle = 0;
    
}

function animateGameInitialization(){

    elapsedInitializationFrames -= 1;

    if (Z != GAME_XWING_POSITION[2]){
        Z += deltaZ;
    }
    
    if (Y != GAME_XWING_POSITION[1]){
        Y += deltaY;
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
    
    var deltaMatrix = utils.MakeWorld(0, Y, Z, 0, Ry, 0, S);
    xwingNode.updateWorldMatrix(deltaMatrix); //world = world * delta

    if (Math.abs(lookRadius - GAME_CAMERA_POSITION[2]) > 0.5){
        lookRadius = lookRadius + deltaLookRadius;
    }
    else{
        lookRadius = GAME_CAMERA_POSITION[2];
    }
/*
    if (camera_elevation != GAME_CAMERA_POSITION[3]){
        camera_elevation = camera_elevation + p;
    }

    if (camera_angle != GAME_CAMERA_POSITION[4]){
        camera_angle = camera_angle + deltaCameraAngle;
    }
*/
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

    if (elapsedInitializationFrames == 0){ // mettere come condizione: if tutte le variabili hanno raggiunto il loro obbiettivo
        elapsedInitializationFrames = 100;
        Z = 0;
        Y = 0;
        window.cancelAnimationFrame(requestAnimationId);
        
        window.addEventListener("keydown", keyDownFunction, false);
        window.addEventListener("keyup", keyUpFunction, false);

        xwingNode.localMatrix = utils.MakeWorld(GAME_XWING_POSITION[0], GAME_XWING_POSITION[1], GAME_XWING_POSITION[2], 0 , 270, 0, 1);
        
        lastNewRingTime = Date.now();
        createFreeNodes();
        drawGameScene(); // when animation is finished starts spawning

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

    for (var i = 0; i < xwingNode.children.length; i++){ // update children local matrices
        let child = xwingNode.children[i];
        let matrix = utils.MakeTranslateMatrix(0,0,-SPEED);
        if(child.drawInfo["type"] == ASTEROID_INDEX){ //if asteroid
            matrix = utils.multiplyMatrices(matrix,child.localMatrix);
            let rot = utils.MakeWorld(0,0,0,ANGULARSPEED_X,ANGULARSPEED_Y,ANGULARSPEED_Z,1);
            child.localMatrix = utils.multiplyMatrices(matrix,rot);
        }
        else{ // if ring
            child.localMatrix = utils.multiplyMatrices(matrix,child.localMatrix);
        }

    }
    
    xwingNode.updateWorldMatrix(); // update children world matrices

}


function animateGame(){

    if ( Date.now() - lastNewRingTime > SPAWNTIME ) {
        spawnNewObject();
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

    let objects = xwingNode.children;
    for (var i = 0; i < objects.length; i++){
        drawObject(objects[i]);
        detectCollision(i);
    }

    if(isGameOver()) {
        createPopup("gameover");
        gameOver();
        window.cancelAnimationFrame(drawGameScene);
    }
    else{
    requestAnimationId = window.requestAnimationFrame(drawGameScene);
    }
}

function detectCollision(i){

   let object = xwingNode.children[i];
   let tx = object.localMatrix[3];
   let ty = object.localMatrix[7];
   let tz = object.localMatrix[11];
   let distance = Math.sqrt(Math.pow(tx,2) + Math.pow(ty,2) + Math.pow(tz,2));
   let type = object.drawInfo["type"];

   switch(type){
   case 1:
   if(distance < COLLISION_RADIUS_RING && i!=collision_index){
        collision_index = i;
        addScore();
   }
   break;
 
   case 2:
   if(distance < COLLISION_RADIUS_ASTEROID && i!=collision_index){
    collision_index = i;
    takeDamage(ASTEROID_DAMAGE);
   }
   break;
    }
}

function handleObjects(){ 

    let objects = xwingNode.children;   
    for (var i = 0; i < objects.length; i++){


        if(objects[i].worldMatrix[11] > 60 ){ //out of bounds
               xwingNode.removeFirstChild();
               if(i==collision_index) collision_index = -1; 
        }

        //detectCollision(i);

    }

    


}

//start the game!!
function startGame(){

    //console.log("Cancelling animation: " + requestAnimationId);
    window.cancelAnimationFrame(requestAnimationId);

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

    textScore.nodeValue = "0"; //reset current score
    restoreMaxLife();

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
    var scorePopup = document.createElement('div'); 
    var textScorePopup = document.createTextNode('Game Over!!');
    scorePopup.appendChild(textScorePopup);  
    var currentScore=parseInt(textScore.nodeValue);
    var textScorePopup = document.createTextNode('Your score is: ' +  currentScore);
    scorePopup.appendChild(textScorePopup);  

    if(currentScore > maxScore){
        var textScorePopup = document.createTextNode('New best score!!');
        scorePopup.appendChild(textScorePopup); 
        maxScore = currentScore;
        bestScore.nodeValue = maxScore;
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