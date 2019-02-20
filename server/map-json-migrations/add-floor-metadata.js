import { Map } from "server/models/index";

(async () => {
  var maps = await Map.findAll();
  maps.forEach(async map => {
    const { map: mapObj } = map;
    mapObj.floors = mapObj.floors.map(floor => ({
      ...floor
    }));
    await map.update({ map: mapObj });
  });
})();
