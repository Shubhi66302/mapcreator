// exports mapcreator's represention of map (map.json schema) to multiple output
// json files (map.json, pps.json, fire_emergency.json etc.)
import { getTileIdToWorldCoordMapFunc } from "utils/selectors";
import { denormalizeMap } from "utils/normalizr";

const addWorldCoordinateAndDenormalize = normalizedMap => {
  var withWorldCoordinate = addWorldCoordinateToMap(normalizedMap);
  // denormalize it
  const mapObj = denormalizeMap(withWorldCoordinate);
  return mapObj.map;
};

export default (normalizedMap, singleFloor = false) => {
  var map = addWorldCoordinateAndDenormalize(normalizedMap);
  var ret = {};
  ret.elevator = map.elevators;
  // Why is this like this?
  ret.zone = {
    header: {
      "content-type": "application/json",
      accept: "application/json"
    },
    type: "POST",
    data: map.zones.map(zone => ({ zonerec: zone })),
    url: "/api/zonerec"
  };
  ret.queue_data = map.queueDatas.map(({ data }) => data);
  // convert coordinates to strings first!
  ret.map = map.floors.map(({ floor_id, map_values }) => ({
    floor_id,
    map_values: map_values.map(({ coordinate, ...rest }) => ({
      ...rest,
      coordinate: `[${coordinate}]`
    }))
  }));
  // make single floor if required
  if (singleFloor && ret.map.length == 1) {
    ret.map = ret.map[0].map_values;
  }
  // merge things from all floors into respective files
  // don't forget dock_point.json and queue_data.json even though not used
  // charger and pps need to have id attached
  [
    ["charger", "chargers", e => e, null],
    ["pps", "ppses", e => e, null],
    ["fire_emergency", "fireEmergencies", e => e, "fire_emergency_id"],
    [
      "ods_excluded",
      "odsExcludeds",
      e => ({ ods_excluded_list: e }),
      "ods_excluded_id"
    ],
    ["dock_point", "dockPoints", e => e, "dock_field"]
  ].forEach(([outKey, floorKey, convert, idFieldNotRequired]) => {
    // start with empty list
    var list = [];
    // destructuring with variable name very cool
    map.floors.forEach(({ [floorKey]: things }) => {
      // add to the list
      // we already have id present for each thing. remove it if it's not supposed
      // to be present in output json files
      if (idFieldNotRequired) {
        things = things.map(thing => {
          delete thing[idFieldNotRequired];
          return thing;
        });
      }
      // remove 'coordinate' field which was just used internally for mapcreator for indexing.
      things = things.map(thing => {
        delete thing.coordinate;
        return thing;
      });
      list = [...list, ...things];
    });
    ret[outKey] = convert(list);
  });
  return ret;
};

// adds the key "world_coordinate" to the normalized map.
// This is a derived value, so by default is not stored. However
// while exporting, it is required to be present explicitly
export const addWorldCoordinateToMap = normalizedMap => {
  var entities = normalizedMap.entities;
  const oldBarcodeDict = entities.barcode;
  const floorInfo = entities.floor;
  var newbarcodeDict = {};
  for (var floorId in floorInfo) {
    var currentFloorBarcodeDict = {};
    const barcodeKeys = floorInfo[floorId].map_values;
    barcodeKeys.forEach(barcodeKey => {
      currentFloorBarcodeDict[barcodeKey] = oldBarcodeDict[barcodeKey];
    });
    const {tileIdToWorldCoordinateMap : tileIdToWorldCoordinateMap,
      neighbourWithValidWorldCoordinate : neighbourWithValidWorldCoordinate} = getTileIdToWorldCoordMapFunc(
      currentFloorBarcodeDict
    );

    for (var barcode in currentFloorBarcodeDict) {
      var barcodeInfo = currentFloorBarcodeDict[barcode];
      const worldCoordinate = tileIdToWorldCoordinateMap[barcode];
      const wcReferenceNeighbour = neighbourWithValidWorldCoordinate[barcode];
      barcodeInfo["world_coordinate"] = `[${worldCoordinate.x},${
        worldCoordinate.y
      }]`;
      barcodeInfo["world_coordinate_reference_neighbour"] = wcReferenceNeighbour;
      currentFloorBarcodeDict[barcode] = barcodeInfo;
    }
    newbarcodeDict = { ...newbarcodeDict, ...currentFloorBarcodeDict };
  }
  entities.barcode = newbarcodeDict;
  normalizedMap.entities = entities;
  return normalizedMap;
};
