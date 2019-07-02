"use strict";

import { Map } from "../models/index";

module.exports = {
  up: () => {
    return Map.findAll().then(maps => {
      /// DONT DO Promise.all! it gives OOM in docker container when theres ~700 maps
      return maps.reduce((previousPromise, map) => {
        return previousPromise.then(() => {
          const { map: mapObj } = map;
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
        });
      }, Promise.resolve());
    });
  },

  down: () => {
    return Promise.resolve();
  }
};
