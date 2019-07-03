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
            floor.ppses = floor.ppses.map(pps => {
              // Add type only if does not already exist
              if (pps.type === undefined)
                return {
                  ...pps,
                  type: "manual"
                };
              else return pps;
            });
            return floor;
          });
          return map.update({ map: mapObj });
        })
        .then(() => {
          return cb(null, null);
        });
    });
  },
  down: () => {
    return Promise.resolve();
  }
};
