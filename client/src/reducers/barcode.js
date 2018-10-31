
import { getNeighbourTiles,getDirection,getNeighbouringBarcodes } from "utils/util";
import _ from "lodash";
export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-QUEUE-BARCODES-TO-PPS":
       {    console.log(state);
            const tileIds = action.value.coordinates;
            var newState = _.cloneDeep(state);
            for( var i =0;i < tileIds.length; i++) {
                var tileId = tileIds[i];
                
                
                if(newState[tileId].neighbours)
                {   var QueueDirection;
                    if (i == tileIds.length-1)
                    {   
                        QueueDirection = 5; 
                    }
                    else
                    {
                        QueueDirection = getDirection(tileId,tileIds[i+1]);
                    } 
                    var neighbouringTileIds = _.filter(getNeighbouringBarcodes(tileId,state),function (tile) {return tile!=null && !_.includes(tileIds,tile.coordinate);});
                    console.log("tile ID is "+ tileId);
                    console.log("neighbours not in list are");
                    console.log(neighbouringTileIds); 
                    if ( i!=0){
                    
                    if (QueueDirection != 5){
                        newState[tileId].neighbours[QueueDirection][1] = 1;
                        newState[tileId].neighbours[QueueDirection][2] = 1;
                        var Remaining = _.difference([0,1,2,3],[QueueDirection]);
                    
                    for (var j = 0; j < Remaining.length; j++) {
                        newState[tileId].neighbours[Remaining[j]][1] = 0;
                        newState[tileId].neighbours[Remaining[j]][2] = 0;
                        }
                    
                    neighbouringTileIds.forEach((neighbouringTileIdobject, idx) => {
                        var neighbouringTileId = neighbouringTileIdobject.coordinate;
                        var current_neighbour_dir =  getDirection(tileId,neighbouringTileId);
                        var prevQueDir = getDirection(tileIds[i-1],tileId);
                        var neighbour_current_dir = (current_neighbour_dir + 2) % 4
                        newState[neighbouringTileId].neighbours[neighbour_current_dir][1] = 0;
                        newState[neighbouringTileId].neighbours[neighbour_current_dir][2] = 0;
                        });
                }
                else {
                    console.log("neighbouring tileids are");
                    console.log(neighbouringTileIds);
                    var endQueuedir = getDirection(tileIds[i-1],tileId);
                    console.log(endQueuedir);
                    var endoppQuedir = (endQueuedir + 2) % 4;
                    neighbouringTileIds.forEach((neighbouringTileIdobjectend, idx) => {
                        var neighbouringTileIdend = neighbouringTileIdobjectend.coordinate;
                        var endcurrdir = getDirection(tileId,neighbouringTileIdend);
                        var endnbrdir = (endcurrdir + 2) %4 ;
                        if (endcurrdir != endQueuedir && endcurrdir != endoppQuedir)
                            {
                                console.log("final neighbour is   " + neighbouringTileIdend);
                                newState[neighbouringTileIdend].neighbours[endnbrdir][1] = 0;
                                newState[neighbouringTileIdend].neighbours[endnbrdir][2] = 0;
                            }
                    });
                }
                }
                }
            }
            console.log(newState);
            return {...state, ...newState}
        }
    case "ASSIGN-STORABLE":
      const selectedMapTiles = action.value;
      var newState = {};
      for (let tileId of Object.keys(selectedMapTiles)) {
        newState[tileId] = { ...state[tileId], store_status: 1 };
        if (newState[tileId].neighbours) {
          var neighbouringTileIds = getNeighbourTiles(tileId);
          neighbouringTileIds.forEach((neighbouringTileId, idx) => {
            // only get neighbours that have already been added to new state. this
            // reduces redundant updates
            if (newState[neighbouringTileId]) {
              // cannot traverse rack to rack
              newState[neighbouringTileId].neighbours[(idx + 2) % 4][2] = 0;
              newState[tileId].neighbours[idx][2] = 0;
            }
          });
        }
      }
      return Object.assign({}, state, newState);
     
  }
  return state;
};


