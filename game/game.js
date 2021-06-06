//start the game!!
function game(){

  //hides controllers
  HideShowElement(lightController);
  HideShowElement(moveController);
 
  //gameOver();

}

//game over
function gameOver(){

  createPopup("gameover"); 
  textScore.nodeValue = "0"; //reset current score

  // shows controllers 
  HideShowElement(lightController);  
  HideShowElement(moveController);

}

function HideShowElement(x){ // takes an element and hides/shows it
  console.log("FUNCTION");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
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