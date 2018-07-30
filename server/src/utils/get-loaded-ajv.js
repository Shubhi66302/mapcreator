// Loads all json schemas into a single ajv object

import barcodeWithStringCoordinate from "server/src/json-schemas/barcodeWithStringCoordinate.json";
import barcodeWithNumberCoordinate from "server/src/json-schemas/barcodeWithNumberCoordinate.json";
import charger from "server/src/json-schemas/charger.json";
import pps from "server/src/json-schemas/pps.json";
import ods from "server/src/json-schemas/ods.json";
import queueData from "server/src/json-schemas/queueData.json";
import zone from "server/src/json-schemas/zone.json";
import elevator from "server/src/json-schemas/elevator.json";
import dockPoint from "server/src/json-schemas/dockPoint.json";
import fireEmergencySchema from "server/src/json-schemas/fireEmergency.json";
import definitionsSchema from "server/src/json-schemas/definitions.json";
import jsonFileDefinitions from "server/src/json-schemas/json-file-definitions.json";
import map from "server/src/json-schemas/map.json";

var Ajv = require("ajv");

export default () =>
  new Ajv({
    schemas: [
      barcodeWithStringCoordinate,
      barcodeWithNumberCoordinate,
      charger,
      pps,
      ods,
      queueData,
      zone,
      elevator,
      dockPoint,
      fireEmergencySchema,
      definitionsSchema,
      jsonFileDefinitions,
      map
    ]
  });
