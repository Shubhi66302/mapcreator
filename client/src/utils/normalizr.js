// normalization and denormalization fns, also schema
import { normalize, schema, denormalize } from "normalizr";

const barcode = new schema.Entity("barcode", {}, { idAttribute: "coordinate" });
const elevator = new schema.Entity(
  "elevator",
  {},
  { idAttribute: "elevator_id" }
);
const zone = new schema.Entity("zone", {}, { idAttribute: "zone_id" });
const queueData = new schema.Entity(
  "queueData",
  {},
  { idAttribute: "queue_data_id" }
);

const charger = new schema.Entity("charger", {}, { idAttribute: "charger_id" });
const pps = new schema.Entity("pps", {}, { idAttribute: "pps_id" });
const odsExcluded = new schema.Entity(
  "odsExcluded",
  {},
  { idAttribute: "ods_excluded_id" }
);
const dockPoint = new schema.Entity(
  "dockPoint",
  {},
  { idAttribute: "dock_point_id" }
);
const fireEmergency = new schema.Entity(
  "fireEmergency",
  {},
  { idAttribute: "fire_emergency_id" }
);

const floor = new schema.Entity(
  "floor",
  {
    map_values: [barcode],
    chargers: [charger],
    ppses: [pps],
    odsExcludeds: [odsExcluded],
    dockPoints: [dockPoint],
    fireEmergencies: [fireEmergency]
  },
  { idAttribute: "floor_id" }
);

const mapSchema = new schema.Entity("map", {
  elevators: [elevator],
  zones: [zone],
  queueDatas: [queueData],
  floors: [floor]
});

// this is the schema on which normalization will be run.
// very important that floors don't have duplicate coordinate barcodes
const mapObjSchema = new schema.Entity("mapObj", {
  map: mapSchema
});

// expects mapObj (with updatedAt etc.)
export var normalizeMap = mapObj => {
  // hack: add dummy id to map field
  // using parseJson(JSON.stringify()) to create deep copy so argument is not mutated
  var newMap = JSON.parse(JSON.stringify(mapObj));
  newMap.map.id = "dummy";
  return normalize(newMap, mapObjSchema);
};

export var denormalizeMap = normalizedMap => {
  var denormalizedMapObj = denormalize(
    normalizedMap.result,
    mapObjSchema,
    normalizedMap.entities
  );
  // remove id from map
  delete denormalizedMapObj.map.id;
  return denormalizedMapObj;
};
