import { Map } from "server/models/index";

(async () => {
  var maps = await Map.findAll();
  maps.forEach(async map => {
    const { map: mapObj } = map;
    mapObj.floors = mapObj.floors.map(floor => ({
      ...floor,
      metadata: floor.metadata || {
        botWithRackThreshold: 750,
        botWithoutRackThreshold: 610
      }
    }));
    await map.update({ map: mapObj });
  });
  console.log("done");
})();
