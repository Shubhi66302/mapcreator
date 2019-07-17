import { createSelector } from "reselect";
import createCachedSelector from "re-reselect";
import _ from "lodash";
import {
  getBarcode,
  getBarcodes,
  currentFloorBarcodeToCoordinateKeySelector
} from "./barcode-selectors";
import * as constants from "../../constants";
import {
  tupleOfIntegersToCoordinateKey,
  getNeighbouringBarcodes,
  zoneToColorMapper
} from "../util";

export const tileNameWithoutEntityDataSelector = createSelector(
  getBarcode,
  state => state.selection.zoneViewMode,
  (barcode, zoneViewMode) => {
    var tileSprite = constants.NORMAL;
    // don't show storables in zone view mode; otherwise their darker color messes with the tint
    if (barcode.store_status && !zoneViewMode) tileSprite = constants.STORABLE;
    return tileSprite;
  }
);

export const tileSpriteNamesWithoutEntityData = createSelector(
  getBarcode,
  tileNameWithoutEntityDataSelector,
  (barcode, tileName) => {
    // last sprite (dot) is for showing center point of barcode.
    // TODO: should replace it with a 'x' sprite
    var spriteNames = barcode.barcode
      .split("")
      .map(char => (char !== "." ? `${char}.png` : "dot.png"));
    return [tileName, ...spriteNames, "dot.png"];
  }
);

export const getParticularEntity = (state, { entityName }) =>
  state.normalizedMap.entities[entityName] || {};

const getQueueData = state => state.normalizedMap.entities.queueData || {};

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

const entitySelectorHelperData = {
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
      var qb_coordinate = currentFloorBarcodeToCoordinateKeySelector(state, {
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
  state => state.selection.zoneViewMode,
  (entitySpritesMap, selectedMapTiles, zoneViewMode) => {
    var ret = {};
    Object.keys(selectedMapTiles).forEach(
      key => (ret[key] = constants.SELECTED)
    );
    // if in zone view, don't render any entities, just selections; otherwise they mess with the tint
    if (zoneViewMode) return ret;
    return { ...entitySpritesMap, ...ret };
  }
);

export const getZones = state => state.normalizedMap.entities.zone || {};
export const getZoneToColorMap = createSelector(
  getZones,
  zones => {
    const newZoneMap = zoneToColorMapper(zones);
    return newZoneMap;
  }
);

export function strToHex(s) {
  return parseInt(s.substr(1), 16);
}

export const tileTintSelector = createSelector(
  getZoneToColorMap,
  getBarcode,
  state => state.selection.zoneViewMode,
  (zoneToColorMap, barcode, zoneViewMode) =>
    zoneViewMode
      ? strToHex(zoneToColorMap[barcode.zone] || "#ffffff")
      : 0xffffff
);
