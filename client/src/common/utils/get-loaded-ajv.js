// Loads all json schemas into a single ajv object

import barcodeWithStringCoordinate from "common/json-schemas/barcodeWithStringCoordinate.json";
import barcodeWithNumberCoordinate from "common/json-schemas/barcodeWithNumberCoordinate.json";
import charger from "common/json-schemas/charger.json";
import pps from "common/json-schemas/pps.json";
import odsExcluded from "common/json-schemas/odsExcluded.json";
import queueData from "common/json-schemas/queueData.json";
import zone from "common/json-schemas/zone.json";
import sector from "common/json-schemas/sector.json";
import elevator from "common/json-schemas/elevator.json";
import dockPoint from "common/json-schemas/dockPoint.json";
import fireEmergencySchema from "common/json-schemas/fireEmergency.json";
import definitionsSchema from "common/json-schemas/definitions.json";
import jsonFileDefinitions from "common/json-schemas/json-file-definitions.json";
import map from "common/json-schemas/map.json";

var Ajv = require("ajv");

export default () =>
  new Ajv({
    schemas: [
      barcodeWithStringCoordinate,
      barcodeWithNumberCoordinate,
      charger,
      pps,
      odsExcluded,
      queueData,
      zone,
      sector,
      elevator,
      dockPoint,
      fireEmergencySchema,
      definitionsSchema,
      jsonFileDefinitions,
      map
    ]
  });
