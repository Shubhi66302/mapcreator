require("dotenv").config({ path: ".env.test" });
import request from "supertest";
import app from "server/src/app";
import { Map, sequelize } from "server/models/index";
import _ from "lodash";

var dummyGoodMap = {
  elevators: [],
  zones: [],
  queueDatas: [],
  floors: [
    {
      floor_id: 1,
      map_values: [],
      chargers: [],
      ppses: [],
      odses: [],
      fireEmergencies: [],
      dockPoints: []
    }
  ]
};

describe("/api/createMap", () => {
  test("create good map", async () => {
    var response = await request(app)
      .post("/api/createMap")
      .send({ map: dummyGoodMap, name: "dummy" });
    expect(response.statusCode).toBe(200);
    const responseMap = response.body;
    expect(responseMap.id).toBeTruthy();
    var dbMap = await Map.findById(responseMap.id);
    // response has dates encoded as strings, convert them first
    expect(dbMap.dataValues).toMatchObject({
      ...responseMap,
      createdAt: new Date(responseMap.createdAt),
      updatedAt: new Date(responseMap.updatedAt)
    });
    const { id, createdAt, updatedAt, map: mapObj } = dbMap.dataValues;
    expect(id).toBeTruthy();
    expect(createdAt).toBeTruthy();
    expect(updatedAt).toBeTruthy();
    expect(mapObj).toMatchObject(dummyGoodMap);
    // cleanup
    await dbMap.destroy();
  });

  test("create map with invalid object", async () => {
    var badMap = {};
    await request(app)
      .post("/api/createMap")
      .send({ map: badMap, name: "badmap" })
      .expect(500);
  });

  test("create map without name", async () => {
    await request(app)
      .post("/api/createMap")
      .send({ map: dummyGoodMap })
      .expect(500);
  });
});

describe("/api/map", () => {
  test("valid map id", async () => {
    const {
      body: { id }
    } = await request(app)
      .post("/api/createMap")
      .send({ map: dummyGoodMap, name: "dummy" });
    var response = await request(app)
      .get(`/api/map/${id}`)
      .expect(200);
    var mapRow = response.body;
    expect(mapRow).toBeTruthy();
    expect(mapRow.id).toEqual(id);
    expect(mapRow.map).toMatchObject(dummyGoodMap);
  });

  test("invalid map id", async () => {
    var response = await request(app)
      .get("/api/map/0")
      .expect(500);
    expect(response.error.text).toEqual(`could not find map for id ${0}`);
  });

  test("no map id", async () => {
    // since no id is provided it gives 404
    var response = await request(app)
      .get("/api/map")
      .expect(404);
  });
});

describe("/api/maps", () => {
  beforeEach(async () => {
    // clear maps
    await Map.destroy({ where: {}, truncate: true });
  });

  test("get all maps", async () => {
    // add two maps
    var map1 = await Map.create({ map: dummyGoodMap, name: "map1" });
    var map2 = await Map.create({ map: dummyGoodMap, name: "map2" });
    // delete the map attrs since they are not present, also convert date to strings
    var expectedMaps = [map1, map2]
      .map(map => map.toJSON())
      .map(({ map, ...rest }) => ({
        ...rest,
        createdAt: rest.createdAt.toISOString(),
        updatedAt: rest.updatedAt.toISOString()
      }));

    // test
    var response = await request(app)
      .get("/api/maps")
      .expect(200);
    var maps = response.body;
    expect(maps).toHaveLength(2);
    expect(_.sortBy(maps, ["id"])).toEqual(expectedMaps);
  });

  test("get empty array of maps", async () => {
    var response = await request(app)
      .get("/api/maps")
      .expect(200);
    var maps = response.body;
    expect(maps).toHaveLength(0);
  });
});

afterAll(async () => {
  // drop all maps
  await Map.destroy({ where: {}, truncate: true });
  await sequelize.close();
});
