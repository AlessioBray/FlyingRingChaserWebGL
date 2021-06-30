var Node = function() {
    this.children = [];
    this.localMatrix = utils.identityMatrix();
    this.worldMatrix = utils.identityMatrix();
};

// NEW
Node.prototype.removeFirstChild = function(){
    //remove first child from father
    this.children.shift();
}
//
  
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
        //this.localMatrix = this.worldMatrix;
    } else {
        // no matrix was passed in so just copy.
        //utils.copy(this.localMatrix, this.worldMatrix); // little bug
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
                materialColor: [1.0, 1.0, 1.0],
                programInfo: programs[XWING_INDEX],
                bufferLength: allMeshes[XWING_INDEX].indices.length,
                vertexArray: vaos[XWING_INDEX],
            };
            
            break;

        case RING_INDEX:
            showcaseNode.drawInfo = {
                type: RING_INDEX,
                materialColor: [1.0, 1.0, 1.0],
                programInfo: programs[RING_INDEX],
                bufferLength: allMeshes[RING_INDEX].indices.length,
                vertexArray: vaos[RING_INDEX],
            };
            showcaseNode.localMatrix = utils.MakeRotateXMatrix(-90);
            break;

        case ASTEROID_INDEX:
            showcaseNode.drawInfo = {
                type: ASTEROID_INDEX,
                materialColor: [1.0, 1.0, 1.0],
                programInfo: programs[ASTEROID_INDEX],
                bufferLength: allMeshes[ASTEROID_INDEX].indices.length,
                vertexArray: vaos[ASTEROID_INDEX],
            };
            break;
    }

    objects = [showcaseNode];
    
}


function createGameSceneGraph(){   // objects array not used in game

    xwingNode = new Node();
    xwingNode.localMatrix = utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 270.0, 0.0, S); 
    xwingNode.drawInfo = {
        type: XWING_INDEX,
        materialColor: [1.0, 1.0, 1.0],
        programInfo: programs[XWING_INDEX],
        bufferLength: allMeshes[XWING_INDEX].indices.length,
        vertexArray: vaos[XWING_INDEX],
    };
    xwingNode.updateWorldMatrix();
    
}


function spawnNewObject(){

   // randomizations
   let indexes = [RING_INDEX,ASTEROID_INDEX];
   let index = indexes[0];
   let tx = Math.random() * MAX_X - MIN_X;  // x in [-5,5]
   let ty = Math.random() * MAX_Y - MIN_Y;  // y in [-1,3]
   
   if(Math.random() <= ASTEROIDSPAWNRATE) index = indexes[1];

   let objectNode = getFreeNode();
   objectNode.localMatrix = utils.MakeWorld(tx, ty, Tz+60, 90.0, Ry, Rz + 90, S*(3-index));
   objectNode.drawInfo = {
        type: index,
        materialColor: [1.0, 1.0, 1.0],
        programInfo: programs[index],
        bufferLength: allMeshes[index].indices.length,
        vertexArray: vaos[index],
   };
   objectNode.setParent(xwingNode);
   
   lastNewRingTime = Date.now();

}

//implements a sort of object pooling 
function createFreeNodes(){
    for ( var i = 0; i< NUM_OBJECTS_IN_SCENE; i++)
        nodes.push(new Node());
}

function getFreeNode(){
    let node = nodes[freeslot];
    freeslot = (freeslot + 1)%nodes.length;
    return node;
}


