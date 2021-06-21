function initializeGameSceneGraph(){

    objects = [];

    xwingNode = new Node();
    xwingNode.localMatrix = utils.MakeWorld(0.0, 0.0, 0.0, 0, Ry, Rz, S);
    xwingNode.drawInfo = {
        type: XWING_INDEX,
        materialColor: [1.0, 1.0, 1.0],
        programInfo: programs[XWING_INDEX],
        bufferLength: allMeshes[XWING_INDEX].indices.length,
        vertexArray: vaos[XWING_INDEX],
    };

    xwingNode.updateWorldMatrix();

    objects = [xwingNode];

    drawGameScene();
    
}

function drawGameScene() {    

    //updateWorldMatrix(); // to update rings world matrices

    setGameMatrices();

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

    game();
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
    for(var i=0;i<ringsArrays.length;i++){
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