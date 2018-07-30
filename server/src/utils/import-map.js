// takes uploaded json files and returns a single #map json object which is internal
// represention of the map in mapcreator. schema for this is defined in json-schemas/map.json

import getLoadedAjv from "server/src/utils/get-loaded-ajv";
import { parseCoordinateString, findFloorIndex } from "server/src/utils/util";

export default ({
  mapJson,
  chargerJson = [],
  elevatorJson = [],
  fireEmergencyJson = [],
  odsExcludedJson = { ods_excluded_list: [] },
  ppsJson = [],
  dockPointJson = [],
  queueDataJson = [],
  zoneJson = {
    header: {
      "content-type": "application/json",
      accept: "application/json"
    },
    type: "POST",
    data: [],
    url: "/api/zonerec"
  }
}) => {
  // the resulting map
  var map = {};
  var ajv = getLoadedAjv();
  // map.json is required
  if (!mapJson) throw new Error("map.json is required");
  var singleFloorMapJsonValidate = ajv.getSchema("single_floor_map_json");
  if (singleFloorMapJsonValidate(mapJson)) {
    // it is a single floor map, convert it into multifloor
    mapJson = [
      {
        floor_id: 1,
        map_values: mapJson
      }
    ];
  }
  // check if mapJson is valid and add it to map
  var mapJsonValidate = ajv.getSchema("map_json");
  if (!mapJsonValidate(mapJson)) {
    throw mapJsonValidate.errors;
  }
  // convert coordinate to numbers before adding!
  map["floors"] = mapJson.map(({ floor_id, map_values }) => ({
    floor_id,
    map_values: map_values.map(({ coordinate, ...rest }) => ({
      ...rest,
      coordinate: parseCoordinateString(coordinate)
    })),
    chargers: [],
    fireEmergencies: [],
    odses: [],
    ppses: [],
    dockPoints: [],
    queueDatas: []
  }));

  // check elevator and zone jsons and add
  [
    [elevatorJson, "elevator_json", "elevators", e => e],
    [zoneJson, "zone_json", "zones", e => e.data.map(({ zonerec }) => zonerec)],
    [queueDataJson, "queue_data_json", "queueDatas", e => e]
  ].forEach(([jsonFile, schemaName, key, convert]) => {
    var validate = ajv.getSchema(schemaName);
    if (!validate(jsonFile)) {
      throw validate.errors;
    }
    map[key] = convert(jsonFile);
  });

  // map the rest of the jsons (charger, pps, ods_excluded, fire_emergency, dock_points) with
  // correct floor and then add to map
  [
    [chargerJson, "charger_json", "chargers", e => e, "charger_location"],
    [
      fireEmergencyJson,
      "fire_emergency_json",
      "fireEmergencies",
      e => e,
      "barcode"
    ],
    [
      odsExcludedJson,
      "ods_excluded_json",
      "odses",
      e => e.ods_excluded_list,
      "barcode"
    ],
    [ppsJson, "pps_json", "ppses", e => e, "location"],
    // TODO: not tested queue_data and dock_point jsons, should probably do that
    [dockPointJson, "dock_point_json", "dockPoints", e => e, "position"]
  ].forEach(([jsonFile, schemaName, key, convert, barcodeStringField]) => {
    var validate = ajv.getSchema(schemaName);
    if (!validate(jsonFile)) {
      throw validate.errors;
    }
    // go through list of things and find correct floor for them, and then add
    // to that floor
    var listOfThings = convert(jsonFile);
    listOfThings.forEach(thing => {
      var floorIdx = findFloorIndex(map.floors, thing[barcodeStringField]);
      if (floorIdx == -1)
        throw new Error(
          `Could not find floor for barcode ${
            listOfThings[barcodeStringField]
          } referenced in ${schemaName}`
        );
      map.floors[floorIdx][key].push(thing);
    });
  });
  return map;
};
