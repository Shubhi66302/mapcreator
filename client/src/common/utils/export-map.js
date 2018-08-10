// exports mapcreator's represention of map (map.json schema) to multiple output
// json files (map.json, pps.json, fire_emergency.json etc.)

export default map => {
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
  ret.queue_data = map.queueDatas;
  // convert coordinates to strings first!
  ret.map = map.floors.map(({ floor_id, map_values }) => ({
    floor_id,
    map_values: map_values.map(({ coordinate, ...rest }) => ({
      ...rest,
      coordinate: `[${coordinate}]`
    }))
  }));
  // merge things from all floors into respective files
  // don't forget dock_point.json and queue_data.json even though not used
  // charger and pps need to have id attached
  [
    ["charger", "chargers", e => e, null],
    ["pps", "ppses", e => e, null],
    ["fire_emergency", "fireEmergencies", e => e, "fire_emergency_id"],
    ["ods_excluded", "odses", e => ({ ods_excluded_list: e }), "ods_id"],
    ["dock_point", "dockPoints", e => e, "dock_field"]
  ].forEach(([outKey, floorKey, convert, idFieldNotRequired]) => {
    // start with empty list
    var list = [];
    var curId = 1;
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
      list = [...list, ...things];
    });
    ret[outKey] = convert(list);
  });
  return ret;
};
