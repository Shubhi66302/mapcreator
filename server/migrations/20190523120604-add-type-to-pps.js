"use strict";

import { Map } from "../models/index";

module.exports = {
  up: () => {
    return Map.findAll().then(maps => {
      return Promise.all(
        maps.map(map => {
          const { map: mapObj } = map;
          mapObj.floors = mapObj.floors.map(floor => {
            floor.ppses = floor.ppses.map(pps => {
              // Add type only if does not already exist
              if (pps.type === undefined)
                return {
                  ...pps,
                  type: "manual"
                };
              else
                return pps;
            });
            return floor;
          });
          return map.update({ map: mapObj });
        })
      );
    });
  },

  down: () => {
    return Promise.resolve();
  }
};
