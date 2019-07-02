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
            if (floor.odses) {
              floor.odsExcludeds = floor.odses.map(ods => ods);
              delete floor.odses;
            }
            return floor;
          });
          return map.update({ map: mapObj });
        });
      }, Promise.resolve());
    });
  },

  down: () => {
    /// DONT DO Promise.all! it gives OOM in docker container when theres ~700 maps
    return Map.findAll().then(maps => {
      return maps.reduce((previousPromise, map) => {
        return previousPromise.then(() => {
          const { map: mapObj } = map;
          mapObj.floors = mapObj.floors.map(floor => {
            if (floor.odsExcludeds) {
              floor.odses = floor.odsExcludeds.map(ods => ods);
              delete floor.odsExcludeds;
            }
            return floor;
          });
          return map.update({ map: mapObj });
        });
      }, Promise.resolve());
    });
  }
};
