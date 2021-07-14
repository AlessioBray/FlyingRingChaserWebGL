var Node = function() {
    this.children = [];
    this.localMatrix = utils.identityMatrix();
    this.worldMatrix = utils.identityMatrix();
};

  
Node.prototype.setParent = function(parent) {
    // remove us from our parent
    if (this.parent) {
        var ndx = this.parent.children.indexOf(this);
        if (ndx >= 0) {
            this.parent.children.splice(ndx, 1);
        }
    }

    // Add us to our new parent
    if (parent) {
        parent.children.push(this);
    }
    this.parent = parent;
};

Node.prototype.updateWorldMatrix = function(matrix) {
    if (matrix) {
        // a matrix was passed in so do the math
        this.worldMatrix = utils.multiplyMatrices(matrix, this.localMatrix);
    } else {
        // no matrix was passed in so just copy.
        utils.copy(this.localMatrix, this.worldMatrix); // little bug
    }
  
    // now process all the children
    var worldMatrix = this.worldMatrix;
    this.children.forEach(function(child) {
        child.updateWorldMatrix(worldMatrix);
    });
};

//Define the scene Graph

function createShowcaseSceneGraph(){ //scene graph show case

    showcaseNode = new Node();
    showcaseNode.localMatrix = utils.identityMatrix();

    switch(selectedObjId){

        case XWING_INDEX:
            showcaseNode.drawInfo = {
                type: XWING_INDEX,
                programInfo: programs[XWING_INDEX],
                bufferLength: allMeshes[XWING_INDEX].indices.length,
                vertexArray: vaos[XWING_INDEX],
                isCollided: false,
                collisionTimeElapsed: 0.0, ///////////////////////////////////////////////////////////////
                isAsteroidCollision: false,
                isHealthCollision: false,
                isSpeedCollision: false,
            };
            showcaseNode.localMatrix = utils.multiplyMatrices(utils.MakeRotateYMatrix(270), utils.MakeTranslateMatrix(0,0.5,0));
            break;

        case RING_INDEX:
            showcaseNode.drawInfo = {
                type: RING_INDEX,
                programInfo: programs[RING_INDEX],
                bufferLength: allMeshes[RING_INDEX].indices.length,
                vertexArray: vaos[RING_INDEX],
                isMissed: false,
                changeColor: false,
            };
            showcaseNode.localMatrix = utils.MakeRotateXMatrix(-90);
            break;

        case ASTEROID_INDEX:
            showcaseNode.drawInfo = {
                type: ASTEROID_INDEX,
                programInfo: programs[ASTEROID_INDEX],
                bufferLength: allMeshes[ASTEROID_INDEX].indices.length,
                vertexArray: vaos[ASTEROID_INDEX],
            };
            break;
        
        case HEALTH_INDEX:
            showcaseNode.drawInfo = {
                type: HEALTH_INDEX,
                programInfo: programs[HEALTH_INDEX],
                bufferLength: allMeshes[HEALTH_INDEX].indices.length,
                vertexArray: vaos[HEALTH_INDEX],
            };
            showcaseNode.localMatrix = utils.MakeScaleMatrix(0.2);
            break;
        
        case SPEED_INDEX:
            showcaseNode.drawInfo = {
                type: SPEED_INDEX,
                programInfo: programs[SPEED_INDEX],
                bufferLength: allMeshes[SPEED_INDEX].indices.length,
                vertexArray: vaos[SPEED_INDEX],
            };
            showcaseNode.localMatrix = utils.MakeScaleMatrix(0.3);
            break;
    }

    objects = [showcaseNode];
    
}


function createGameSceneGraph(){  

    objects = [];
    xwingNode = new Node();
    xwingNode.localMatrix = utils.identityMatrix(); 
    xwingNode.drawInfo = {
        type: XWING_INDEX,
        programInfo: programs[XWING_INDEX],
        bufferLength: allMeshes[XWING_INDEX].indices.length,
        vertexArray: vaos[XWING_INDEX],
    };

}

function weighted_random() {
    var i;

    var weights = [];

    for (i = 0; i < spawnRates.length; i++)
        weights[i] = spawnRates[i] + (weights[i - 1] || 0);
    
    var random = Math.random();
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    
    return i+1; // + 1 to account for starship at 0 
}


function spawnNewObject(){

    // randomizations
    let indexes = [RING_INDEX, ASTEROID_INDEX, HEALTH_INDEX, SPEED_INDEX];
    let index = indexes[0];
    //MAX = 2 MIN = 1
    let tx = Math.random() * MAX_X - MIN_X;  // x in [-1,1] (not considering starship pos)
    let ty = Math.random() * MAX_Y - MIN_Y;  // y in [-1,1] 

    index = weighted_random(); 

    let objectNode = getFreeNode();
                                  
    objectNode.drawInfo = {
        type: index,
        programInfo: programs[index],
        bufferLength: allMeshes[index].indices.length,
        vertexArray: vaos[index],
    };
    
    let tz= 200;
    
    switch(index){

        case 1: 
            objectNode.localMatrix = utils.MakeWorld(0,0,0,0,ANGULARSPEED_Y,0, 1);
            objectNode.worldMatrix = utils.MakeWorld(GAME_XWING_POSITION[0] -  tx, 
                GAME_XWING_POSITION[1] - ty,
                GAME_XWING_POSITION[2] - Tz - tz,
                90.0,270, 90, S*2);
            break;
    
        case 2:
            objectNode.localMatrix = utils.MakeWorld(0,0,0,ANGULARSPEED_X,ANGULARSPEED_Y,ANGULARSPEED_Z, 1);
            objectNode.worldMatrix = utils.MakeWorld(GAME_XWING_POSITION[0] -  tx, 
                GAME_XWING_POSITION[1] - ty,
                GAME_XWING_POSITION[2] - Tz - tz,
                90.0,270, 90, S);
            break;

        case 3: 
            objectNode.localMatrix = utils.MakeWorld(0,0,0,0,0,ANGULARSPEED_Z, 1);
            objectNode.worldMatrix = utils.MakeWorld(GAME_XWING_POSITION[0] -  tx, 
                GAME_XWING_POSITION[1] - ty,
                GAME_XWING_POSITION[2] - Tz - tz,
                90.0, 270, 90, S*0.2);
            break;
        
        case 4: 
            objectNode.localMatrix = utils.MakeWorld(0,0,0,0,ANGULARSPEED_Y,0, 1);;//utils.MakeWorld(0,0,0,ANGULARSPEED_Y,0,0, 1);
            objectNode.worldMatrix = utils.MakeWorld(GAME_XWING_POSITION[0] -  tx, 
                GAME_XWING_POSITION[1] - ty,
                GAME_XWING_POSITION[2] - Tz - tz,
                0, 0, 0, S*0.3);
            break;

    }

    objects.push(objectNode);
            
    lastNewRingTime = Date.now();

}

//implements a sort of object pooling 
function createFreeNodes(){
    for (var i = 0; i< NUM_OBJECTS_IN_SCENE ; i++)
        nodes.push(new Node());
}

function getFreeNode(){
    let node = nodes[freeslot];
    freeslot = (freeslot + 1)%nodes.length;
    return node;
}