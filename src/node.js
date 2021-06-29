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
        //this.localMatrix = this.worldMatrix;
    } else {
        // no matrix was passed in so just copy.
        utils.copy(this.localMatrix, this.worldMatrix);
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


function createGameSceneGraph(){ //scene graph show case

    objects = [];

    xwingNode = new Node();
    xwingNode.localMatrix = utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 270.0, 0.0, S); //(0.0, -1.5, 40.0, 0, -90, 0, S) // for initialization moverment should be all to 0 expcept S=1
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


function addRingNode(tx,ty){

    ringNode = new Node();
    ringNode.localMatrix = utils.identityMatrix();
    ringNode.worldMatrix = utils.MakeWorld(tx, ty, Tz, 90.0, Ry, Rz + 90, S);
    ringNode.drawInfo = {
        type: RING_INDEX,
        materialColor: [1.0, 1.0, 1.0],
        programInfo: programs[RING_INDEX],
        bufferLength: allMeshes[RING_INDEX].indices.length,
        vertexArray: vaos[RING_INDEX],
    };

    ringNode.setParent(xwingNode);
    objects.push(ringNode);

}


function addAsteroidNode(tx,ty){

    asteroidNode = new Node();
    asteroidNode.localMatrix = utils.MakeWorld(0,0,0,ANGULARSPEED_X,ANGULARSPEED_Y,ANGULARSPEED_Z,1);
    asteroidNode.worldMatrix = utils.MakeWorld(tx, ty, Tz, 90.0, Ry, Rz + 90, S);
    asteroidNode.drawInfo = {
        type: ASTEROID_INDEX,
        materialColor: [1.0, 1.0, 1.0],
        programInfo: programs[ASTEROID_INDEX],
        bufferLength: allMeshes[ASTEROID_INDEX].indices.length,
        vertexArray: vaos[ASTEROID_INDEX],
    };

    asteroidNode.setParent(xwingNode);
    objects.push(asteroidNode);

}


function spawnNewObject(){

   // randomizations
   let spawnables = ["ring","asteroid"];
   let spawn = spawnables[0];
   let tx = Math.random() * MAX_X - MIN_X;  // x in [-5,5]
   let ty = Math.random() * MAX_Y - MIN_Y;  // y in [-1,3]

   if(Math.random() <= ASTEROIDSPAWNRATE) spawn = spawnables[1]

   switch(spawn){
       case 'ring' : addRingNode(tx,ty); break;
       case 'asteroid' : addAsteroidNode(tx,ty); break;
   }

   lastNewRingTime = Date.now();

}
