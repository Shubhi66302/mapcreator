// using reselect for memoization
import { createSelector } from "reselect";
import createCachedSelector from "re-reselect";
import {
  getBarcodeSize,
  getCurrentFloorBarcodeIds,
  getBarcode,
  getBarcodes
} from "./barcode-selectors";
import {
  coordinateKeyToTupleOfIntegers,
  tupleOfIntegersToCoordinateKey,
  getNeighbouringBarcodes,
  intersectRect
} from "../util";
import {
  getTileIdToWorldCoordMap,
  tileToWorldCoordinate
} from "./world-coordinate-utils-selectors";
import _ from "lodash";
import * as constants from "../../constants";

export {
  getCurrentFloorBarcodeIds, getBarcodes,
  getBarcode, getCurrentFloorBarcodes
} from "./barcode-selectors";

export {
  getTileSpriteScale, tileRenderCoordinateSelector,
  spriteRenderCoordinateSelector
} from "./map-render-selectors";

export {
  getTileIdToWorldCoordMapFunc, getTileIdToWorldCoordMap,
  tileToWorldCoordinate, worldToTileCoordinate
} from "./world-coordinate-utils-selectors";

// just a map of tileIds instead of array. useful to key if tileId is good or not
export const tileIdsMapSelector = createSelector(
  getCurrentFloorBarcodeIds,
  tileIds => {
    var ret = {};
    for (var tileId of tileIds) {
      ret[tileId] = true;
    }
    return ret;
  }
);

// since barcodes =/= coordinate sometimes
export const coordinateKeyToBarcodeSelector = createSelector(
  getBarcode,
  barcode => barcode.barcode
);



// assumed that there is one-to-one relationship b/w barcode string and coordinate on a floor
export const currentFloorBarcodeToCoordinateMap = createSelector(
  getCurrentFloorBarcodeIds,
  getBarcodes,
  (tileIds, barcodes) => {
    var ret = {};
    for (var tileId of tileIds) {
      const barcodeString = barcodes[tileId].barcode;
      if (ret[barcodeString]) {
        throw Error(
          `duplicate barcodes on current floor: ${barcodeString}, tile ids ${
            ret[barcodeString]
          }, ${tileId}`
        );
      }
      ret[barcodeString] = tileId;
    }
    return ret;
  }
);

export const barcodeToCoordinateKeySelector = createSelector(
  currentFloorBarcodeToCoordinateMap,
  (_state, { barcode }) => barcode,
  (barcodeCoordinateMap, barcode) => barcodeCoordinateMap[barcode]
);

// max coordinate including special points. used to generate the new special point.
export const getCurrentFloorMaxCoordinate = createSelector(
  getCurrentFloorBarcodeIds,
  tileIds => {
    var coordinates = tileIds.map(tileId =>
      coordinateKeyToTupleOfIntegers(tileId)
    );
    // just take max in x and y independently...
    var [xs, ys] = _.unzip(coordinates);
    return [_.max(xs), _.max(ys)];
  }
);

export const tileNameWithoutEntityDataSelector = createSelector(
  getBarcode,
  barcode => {
    var tileSprite = constants.NORMAL;
    if (barcode.store_status) tileSprite = constants.STORABLE;
    return tileSprite;
  }
);

export const tileSpriteNamesWithoutEntityData = createSelector(
  getBarcode,
  tileNameWithoutEntityDataSelector,
  (barcode, tileName) => {
    // last sprite (dot) is for showing center point of barcode. 
    // TODO:should replace it with a 'x' sprite
    var spriteNames = barcode.barcode
      .split("")
      .map(char => (char !== "." ? `${char}.png` : "dot.png"));
    return [tileName, ...spriteNames, "dot.png"];
  }
);

export const getParticularEntity = (state, { entityName }) =>
  state.normalizedMap.entities[entityName] || {};
const getQueueData = state => state.normalizedMap.entities.queueData || {};

export const entitySelectorHelperData = {
  pps: ["pps", constants.PPS],
  charger: ["charger", constants.CHARGER],
  dockPoint: ["dockPoint", constants.DOCK_POINT],
  ods: ["ods", constants.ODS_EXCLUDED],
  fireEmergency: ["fireEmergency", constants.EMERGENCY_EXIT],
  // 3rd argument is how to get coordinate(s) from an entity.
  // in case of elevator, there are multiple coordinates per elevator
  elevator: [
    "elevator",
    constants.ELEVATOR,
    e =>
      e.coordinate_list.map(({ coordinate }) =>
        tupleOfIntegersToCoordinateKey(coordinate)
      )
  ]
};

// all entities except elevator have one coordinate per entity
const defaultGetCoordinatesFromEntity = e => [e.coordinate];

export const getParticularEntityMap = createCachedSelector(
  getParticularEntity,
  (state_, { entityName }) => entityName,
  (particularEntities, entityName) => {
    var ret = {};
    const [
      ,
      entitySprite,
      getCoordinatesFromEntity = defaultGetCoordinatesFromEntity
    ] = entitySelectorHelperData[entityName];
    var list = Object.entries(particularEntities).map(([, val]) => val);
    var coordinateKeys = _.flatten(list.map(e => getCoordinatesFromEntity(e)));
    coordinateKeys.forEach(key => (ret[key] = entitySprite));
    return ret;
  }
)((state, { entityName }) => entityName);

export const getQueueMap = createSelector(
  getQueueData,
  queueData => {
    var ret = {};
    var queueCoordinates = [].concat(
      ...Object.entries(queueData).map(([, { coordinates }]) => coordinates)
    );
    // make unique
    var queueCoordinatesWithoutDuplicates = new Set(queueCoordinates);
    queueCoordinatesWithoutDuplicates.forEach(
      v1 => (ret[v1] = constants.QUEUE)
    );
    return ret;
  }
);

export const getChargerEntryMap = state => {
  var chargerEntities = getParticularEntity(state, { entityName: "charger" });
  var barcodesDict = getBarcodes(state);
  var ret = {};
  Object.entries(chargerEntities).forEach(
    ([, { charger_direction, coordinate }]) => {
      var nb = getNeighbouringBarcodes(coordinate, barcodesDict)[
        charger_direction
      ];
      if (nb) {
        // charger -> special barcode -> charger entry barcode
        var eb = getNeighbouringBarcodes(nb.coordinate, barcodesDict)[
          charger_direction
        ];
        if (eb) ret[eb.coordinate] = constants.CHARGER_ENTRY;
      }
    }
  );
  return ret;
};

export const getPpsQueueMap = state => {
  var PpsEntities = getParticularEntity(state, { entityName: "pps" });

  var ret = {};

  Object.entries(PpsEntities).forEach(([, { coordinate, queue_barcodes }]) => {
    _.forEach(queue_barcodes, function(queue_barcode) {
      var qb_coordinate = barcodeToCoordinateKeySelector(state, {
        barcode: queue_barcode
      });

      if (qb_coordinate != coordinate) {
        ret[qb_coordinate] = constants.QUEUE;
      }
    });
  });
  return ret;
};

// creates map of tileId -> spriteName for all special tiles i.e. tile which
// have some entity (charger, pps, queue etc.)
export const tileEntitySpritesMapSelector = state => {
  var ret = {};
  Object.keys(entitySelectorHelperData).forEach(key => {
    ret = { ...ret, ...getParticularEntityMap(state, { entityName: key }) };
  });
  // queue also
  // charger entry points also
  ret = { ...ret, ...getChargerEntryMap(state) };
  // selected also
  ret = { ...ret, ...getQueueMap(state) };
  ret = { ...ret, ...getPpsQueueMap(state) };
  return ret;
};

export const specialTileSpritesMapSelector = createSelector(
  tileEntitySpritesMapSelector,
  state => state.selection.mapTiles,
  (entitySpritesMap, selectedMapTiles) => {
    var ret = {};
    Object.keys(selectedMapTiles).forEach(
      key => (ret[key] = constants.SELECTED)
    );
    return { ...entitySpritesMap, ...ret };
  }
);

export const getDistinctXAndYDistances =  createSelector(
  getTileIdToWorldCoordMap,
  (tileIdToWorldCoordinateMap) => {
    const xAndYDistancePairList = Object.values(tileIdToWorldCoordinateMap);
    const xDistanceSet = new Set();
    const yDistanceSet = new Set();
    xAndYDistancePairList.forEach(xAndYDistancePair => {
      xDistanceSet.add(xAndYDistancePair.x);
      yDistanceSet.add(xAndYDistancePair.y);
    });
    const xDistances = [...xDistanceSet].sort(function (a, b) {return b - a;});
    const yDistances = [...yDistanceSet].sort(function (a, b) {return a - b;});
    const xAndYDistances = {x: xDistances, y: yDistances};
    return xAndYDistances;
  }
);


export const distanceTileSpritesSelector = createSelector(
  getDistinctXAndYDistances,
  (xAndYDistances) => {
    const xDistances = xAndYDistances.x;
    const yDistances = xAndYDistances.y;
    var ret = [];
    // ************** For X Distance tile **************  //
    for (var i = 0; i < xDistances.length; i++){
      const currentXCoordinateInPixel = xDistances[i];
      var sizeInLeft = 1500;
      var sizeInRight = 1500;
      if(i != 0){sizeInRight = xDistances[i-1] - xDistances[i];};
      if(i != xDistances.length - 1){sizeInLeft = xDistances[i] - xDistances[i+1];};
      // const size = (sizeInLeft + sizeInRight) / 2;
      const minSize = Math.min(sizeInLeft, sizeInRight);
      const width = (minSize/750) * constants.DISTANCE_TILE_HEIGHT;
      ret.push(
        {
          x: currentXCoordinateInPixel - width/2,
          y: yDistances[0] - 1500,
          width: width,
          height: constants.DISTANCE_TILE_HEIGHT,
          key: `c-${i}`
        }
      );
    };
    // ************** For Y Distance tile **************  //
    for (var j = 0; j < yDistances.length; j++) {
      const currentYCoordinateInPixel = yDistances[j];
      var sizeInDown = 1500;
      var sizeInTop = 1500;
      if(j != 0){sizeInTop = yDistances[j] - yDistances[j-1];};
      if(j != yDistances.length - 1){sizeInDown = yDistances[j+1] - yDistances[j];};
      const minSize = Math.min(sizeInTop, sizeInDown);
      const height = (minSize/750) * constants.DISTANCE_TILE_HEIGHT;
      ret.push({
        x: xDistances[xDistances.length - 1] - 1500,
        y: currentYCoordinateInPixel - height/2,
        width: constants.DISTANCE_TILE_HEIGHT,
        height: height,
        key: `r-${j}`
      });
    };
    return ret;
  }
);

export const getRowColumnInBetweenDistancesAndCoordinates = createSelector(
  getDistinctXAndYDistances,
  (xAndYDistances) => {
    const xDistances = xAndYDistances.x;
    const yDistances = xAndYDistances.y;
    var distance = 0;
    var x;
    var y;
    var ret = [];
    // columns
    for (var i = 0; i < xDistances.length - 1; i++){
      distance = xDistances[i] - xDistances[i+1];
      x = xDistances[i+1] + distance/2;
      y = yDistances[0] -2000;
      ret.push(
        {
          x: x,
          y: y,
          distance: distance
        }
      );
    };
    // rows
    for (var j = 0; j < yDistances.length - 1; j++){
      distance = yDistances[j+1] - yDistances[j];
      x = xDistances[xDistances.length - 1] - 2000;
      y = yDistances[j] + distance/2;
      ret.push(
        {
          x: x,
          y: y,
          distance: distance
        }
      );
    };
    return ret;
  }
);

export const getAllColumnTileIdTuples = createSelector(
  getTileIdToWorldCoordMap,
  getDistinctXAndYDistances,
  (_state, distanceTileKey) => distanceTileKey,
  (tileIdToWorldCoordinateMap, xAndYDistances, distanceTileKey) => {
    const selectedColumnIndex = parseInt(distanceTileKey.match(/c-(.*)/)[1]);
    const columnDistances = xAndYDistances.x;
    const xCoordinate = columnDistances[selectedColumnIndex];
    const AllColumnTileIdTuples = [];
    for (const tileId in tileIdToWorldCoordinateMap) {
      if (tileIdToWorldCoordinateMap.hasOwnProperty(tileId)) {
        if (tileIdToWorldCoordinateMap[tileId].x == xCoordinate) {
          AllColumnTileIdTuples.push(tileId);
        }
      }
    };
    return AllColumnTileIdTuples;
  }
);

export const getAllRowTileIdTuples = createSelector(
  getTileIdToWorldCoordMap,
  getDistinctXAndYDistances,
  (_state, distanceTileKey) => distanceTileKey,
  (tileIdToWorldCoordinateMap, xAndYDistances, distanceTileKey) => {
    const selectedRowIndex = parseInt(distanceTileKey.match(/r-(.*)/)[1]);
    const rowDistances = xAndYDistances.y;
    const yCoordinate = rowDistances[selectedRowIndex];
    const AllRowTileIdTuples = [];
    for (const tileId in tileIdToWorldCoordinateMap) {
      if (tileIdToWorldCoordinateMap.hasOwnProperty(tileId)) {
        if (tileIdToWorldCoordinateMap[tileId].y == yCoordinate) {
          AllRowTileIdTuples.push(tileId);
        }
      }
    };
    return AllRowTileIdTuples;
  }
);

export const getTileIdsForDistanceTiles = (distanceTiles, state, direction) => {
  var tileIds = [];
  for (let distanceTileKey in distanceTiles) {
    if (/c-.*/.test(distanceTileKey) && (direction == 1 || direction == 3)) {
      // column
      tileIds = tileIds.concat(getAllColumnTileIdTuples(state, distanceTileKey));
    } else {
      // row
      tileIds = tileIds.concat(getAllRowTileIdTuples(state, distanceTileKey));
    };
  };
  return tileIds;
};

export const getFitToSizeViewportRect = createSelector(
  getDistinctXAndYDistances,
  (distinctXAndYDistances) => {
    const distinctXDistances = distinctXAndYDistances.x;
    const distinctYDistances = distinctXAndYDistances.y;
    const left = distinctXDistances[distinctXDistances.length - 1];
    const right = distinctXDistances[0];
    const bottom = distinctYDistances[distinctYDistances.length - 1];
    const top = distinctYDistances[0];
    var xPadding = (right - left) * constants.VIEWPORT_MAX_SIZE_PADDING_RATIO;
    var yPadding = (bottom - top) * constants.VIEWPORT_MAX_SIZE_PADDING_RATIO;
    return {
      top: top - yPadding,
      bottom: bottom + yPadding,
      left: left - xPadding,
      right: right + xPadding
    };
  }
);

export const getIdsForNewEntities = createSelector(
  getParticularEntity,
  (_state, { newEntities, uniqueKey = "coordinate" }) => [newEntities, uniqueKey],
  (entitiesObj, [newEntities, uniqueKey]) => {
    var nextId =
      Object.keys(entitiesObj).reduce((prev, key) => Math.max(prev, key), 0) +
      1;
    // entity already exists if coordinate is same as of an existing entity. so return old id only
    return newEntities.map(
      entity =>
        parseInt(_.findKey(entitiesObj, { [uniqueKey]: entity[uniqueKey] })) ||
        nextId++
    );
  }
);

export const getRectFromDiagonalPoints = ({ startPoint, endPoint }) => ({
  left: Math.min(startPoint.x, endPoint.x),
  right: Math.max(startPoint.x, endPoint.x),
  top: Math.min(startPoint.y, endPoint.y),
  bottom: Math.max(startPoint.y, endPoint.y)
});

export const getDragSelectedTiles = createSelector(
  getCurrentFloorBarcodeIds,
  getTileIdToWorldCoordMap,
  distanceTileSpritesSelector,
  state => state.selectedArea,
  state => state,
  (tileIds, tileIdToWorldCoordinateMap, distanceTileRects, selectedArea, state) => {
    if (!selectedArea) return [];
    const selectionRect = getRectFromDiagonalPoints(selectedArea);
    const selectedMapTiles = tileIds.filter(tileId => {
      const worldXCoordinate = tileToWorldCoordinate(tileId, tileIdToWorldCoordinateMap);
      const barcodeSizeInfo = getBarcodeSize(state, {tileId});
      const defDistance = constants.DEFAULT_DISTANCE_BW_BARCODES;
      const topLeftPointX = worldXCoordinate.x - barcodeSizeInfo[3] * (defDistance - constants.BARCODE_SPRITE_GAP) / defDistance;
      const topRightPointX = worldXCoordinate.x + barcodeSizeInfo[1] * (defDistance - constants.BARCODE_SPRITE_GAP) / defDistance;
      const topLeftPointY = worldXCoordinate.y - barcodeSizeInfo[0] * (defDistance - constants.BARCODE_SPRITE_GAP) / defDistance;
      const bottomLeftPointY = worldXCoordinate.y + barcodeSizeInfo[2] * (defDistance - constants.BARCODE_SPRITE_GAP) / defDistance;
      var rect = {
        left: topLeftPointX,
        right: topRightPointX,
        top: topLeftPointY,
        bottom: bottomLeftPointY
      };
      return intersectRect(selectionRect, rect);
    });
    const selectedDistanceTiles = distanceTileRects
      .filter(({ x, y, width, height }) =>
        intersectRect(selectionRect, {
          left: x,
          right: x + width,
          top: y,
          bottom: y + height
        })
      )
      .map(({ key }) => key);
    return {
      mapTilesArr: selectedMapTiles,
      distanceTilesArr: selectedDistanceTiles
    };
  }
);

// all floors considered
export const specialBarcodesCoordinateSelector = createSelector(
  getBarcodes,
  barcodes =>
    Object.keys(barcodes).filter(coordinate => barcodes[coordinate].special)
);

export const specialBarcodesSelector = createSelector(
  specialBarcodesCoordinateSelector,
  getBarcodes,
  (specialBarcodesCoordinates, barcodes) =>
    specialBarcodesCoordinates.map(coordinate => barcodes[coordinate])
);

// initializes with 500,500 for first special barcode
export const getNewSpecialCoordinates = createSelector(
  specialBarcodesCoordinateSelector,
  (_state, { n }) => n,
  (coordinateKeys, n) => {
    const existingSet = new Set(coordinateKeys);
    // iterate starting from 500,500 and just see if it already exists, otherwise add to result
    var ret = [];
    // start from 500,500
    var currentX = 500;
    while (ret.length < n) {
      var candidate = `${currentX},${currentX}`;
      if (!existingSet.has(candidate)) {
        ret.push(candidate);
      }
      currentX += 1;
    }
    // hopefully won't get stuck in above loop...
    return ret;
  }
);


export const getStorableCoordinates = state => 
{ 
  const storables = _.filter(state.normalizedMap.entities.barcode,(b) => 
  {
    return b.store_status === 1;
  }
  );
  return storables;
};



export const getStorableCoordinatesCount = createSelector(
  getBarcodes,
  (barcodesDict) => Object.values(barcodesDict).filter(({store_status}) => store_status).length
);



export const getElevatorIds = state =>
  state.normalizedMap.entities.map.dummy.elevators;

export const getMapId = state =>
  Object.values(state.normalizedMap.entities.mapObj)[0].id;

export const getMapName = state =>
  Object.values(state.normalizedMap.entities.mapObj)[0].name;
