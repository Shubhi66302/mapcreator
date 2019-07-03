"use strict";
require("babel-polyfill");

import { Map } from "../models/index";
import asyncLib from "async";

module.exports = {
  up: async () => {
    var mapIdsOnly = await Map.findAll({ attributes: ["id"] });
    await asyncLib.eachLimit(mapIdsOnly, 10, (mapWithJustId, cb) => {
      const { id } = mapWithJustId;
      return Map.findByPk(id)
        .then(map => {
          var mapObj = map.map;
          mapObj.floors = mapObj.floors.map(floor => {
            if (floor.odses) {
              floor.odsExcludeds = floor.odses.map(ods => ods);
              delete floor.odses;
            }
            return floor;
          });
          return map.update({ map: mapObj });
        })
        .then(() => {
          return cb(null, null);
        });
    });
  },

  down: async () => {
    var mapIdsOnly = await Map.findAll({ attributes: ["id"] });
    await asyncLib.eachLimit(mapIdsOnly, 10, (mapWithJustId, cb) => {
      const { id } = mapWithJustId;
      return Map.findByPk(id)
        .then(map => {
          var mapObj = map.map;
          mapObj.floors = mapObj.floors.map(floor => {
            if (floor.odsExcludeds) {
              floor.odses = floor.odsExcludeds.map(ods => ods);
              delete floor.odsExcludeds;
            }
            return floor;
          });
          return map.update({ map: mapObj });
        })
        .then(() => {
          return cb(null, null);
        });
    });
  }
};
