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
        utils.copy(this.localMatrix, this.worldMatrix);
    }
  
    // now process all the children
    var worldMatrix = this.worldMatrix;
    this.children.forEach(function(child) {
        child.updateWorldMatrix(worldMatrix);
    });
};

//Define the scene Graph

var objects = []; //contiene i nodi

var xwingNode = new Node();
var ringNode = new Node();

//xwingNode.localMatrix = utils.MakeWorld
//ringNode.localMatrix = utils.MakeWorld


/*
sunNode.drawInfo = {
    type: "objectname"
    materialColor: [0.6, 0.6, 0.0],
    programInfo: program,
    bufferLength: indexData.length,
    vertexArray: vao,
  };
*/


function createSceneGraph(){ //scene graph show case

    showcaseNode = new Node();
    showcaseNode.localMatrix = utils.identityMatrix();
    showcaseNode.worldMatrix = utils.MakeWorld(0.0, 0.0, 0.0, Rx, Ry, Rz + 90, 0.5);

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


