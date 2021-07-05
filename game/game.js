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
        ////
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

    moveObjects('ahead');
    //moveStarship('right');

}

function moveObjects(action){

    let matrix = [];

    let deltaMove = 40 * SPEED * Math.tan(utils.degToRad(deltaRot)); // how to relate with deltaRot ? It seems not to work

    switch(action){
       case 'ahead': matrix = utils.MakeTranslateMatrix(0,0,SPEED); break;
       case 'up' : matrix = utils.MakeTranslateMatrix(0,deltaMove,0);
       console.log(deltaMove);
       break;
       case 'down' : matrix = utils.MakeTranslateMatrix(0,-deltaMove,0); break;
       case 'right' : matrix = utils.MakeTranslateMatrix(deltaMove,0,0); break;
       case 'left' : matrix = utils.MakeTranslateMatrix(-deltaMove,0,0); break;
    }

    for (var i = 0; i < objects.length; i++){
        let object = objects[i];
        let newWorldMatrix = utils.multiplyMatrices(matrix,object.worldMatrix);
        object.updateWorldMatrix(newWorldMatrix);
    }  

}

function  moveStarship(action){

    let matrix = [];

    switch(action){
        case 'up': 
        if((Rx - deltaRot) < - MAX_ROTATION_X_STARSHIP){
            Rx = -MAX_ROTATION_X_STARSHIP;
            matrix = utils.identityMatrix();
        }
        else{
        Rx = Rx - deltaRot;
        matrix = utils.MakeRotateXMatrix(-deltaRot); 
        }
        moveObjects('down');
        //console.log(Rx);
        break;
        case 'down' : 
        if((Rx + deltaRot) > MAX_ROTATION_X_STARSHIP){
            Rx = MAX_ROTATION_X_STARSHIP;
            matrix = utils.identityMatrix();
        }
        else{
        Rx = Rx + deltaRot;
        matrix =  matrix = utils.MakeRotateXMatrix(deltaRot); 
        }
        moveObjects('up');
        //console.log(Rx);
        break;
        case 'right' : 
        //console.log(Rz);
        if((Rz - deltaRot) < -MAX_ROTATION_Z_STARSHIP){
            Rz = -MAX_ROTATION_Z_STARSHIP;
            matrix = utils.identityMatrix();
        }
        else{
        Rz = Rz - deltaRot;
        matrix = utils.MakeRotateZMatrix(-deltaRot); 
        }
        moveObjects('left');
        console.log(Rz);
        break;
        case 'left' : 
        if((Rz + deltaRot) > MAX_ROTATION_Z_STARSHIP){
            Rz = MAX_ROTATION_Z_STARSHIP;
            matrix = utils.identityMatrix();
        }
        else{
        Rz = Rz + deltaRot;
        matrix = utils.MakeRotateZMatrix(deltaRot); 
        }
        moveObjects('right');
        //console.log(Rz);
        break;
    }

    let newWorldMatrix = utils.multiplyMatrices(xwingNode.worldMatrix,matrix);

    xwingNode.updateWorldMatrix(newWorldMatrix);
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

   let object = objects[i];
   let tx = object.worldMatrix[3] - GAME_XWING_POSITION[0];
   let ty = object.worldMatrix[7] - GAME_XWING_POSITION[1];
   let tz = object.worldMatrix[11] - GAME_XWING_POSITION[2];
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

    for (var i = 0; i < objects.length; i++){


        if(objects[i].worldMatrix[11] > 60 ){ //out of bounds
               objects.shift(); //removes first object spawned in scene
               if(i==collision_index) collision_index = -1; 
        }

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
    starshipY = 0;
    starshipZ = 0;
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