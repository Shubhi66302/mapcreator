import request from "supertest";
import app from "server/src/app";
import { Map, sequelize } from "server/models/index";
import { map as dummyGoodMap } from "../../client/src/test-data/test-maps/3x3-vanilla.json";
import _ from "lodash";

describe("/api/createMap", () => {
  test("create good map", async () => {
    var response = await request(app)
      .post("/api/createMap")
      .send({ map: dummyGoodMap, name: "dummy" });
    expect(response.error).not.toBeTruthy();
    expect(response.statusCode).toBe(200);
    const responseId = response.body;
    expect(responseId).toBeTruthy();
    var dbMap = await Map.findById(responseId);
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
    const { body: id } = await request(app)
      .post("/api/createMap")
      .send({ map: dummyGoodMap, name: "dummy-get-map" });
    expect(id).toBeTruthy();
    expect(typeof id).toBe("number");
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

  test("get all maps in descending order of insertion", async () => {
    // add two maps
    var map1 = await Map.create({ map: dummyGoodMap, name: "map1" });
    var map2 = await Map.create({ map: dummyGoodMap, name: "map2" });
    // delete the map attrs since they are not present, also convert date to strings
    // reverse order since sorted in descending order of updatedAt
    var expectedMaps = [map2, map1]
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
    expect(maps).toEqual(expectedMaps);
  });

  test("get all maps when older map is touched in correct order", async () => {
    // add three maps
    var map1 = await Map.create({ map: dummyGoodMap, name: "map1" });
    var map2 = await Map.create({ map: dummyGoodMap, name: "map2" });
    var map3 = await Map.create({ map: dummyGoodMap, name: "map3" });
    // touch the first map
    await map1.update({ name: "i-changed-the-name" });
    var expectedMaps = [map1, map3, map2]
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
    expect(maps).toHaveLength(3);
    expect(maps).toEqual(expectedMaps);
  });

  test("get empty array of maps", async () => {
    var response = await request(app)
      .get("/api/maps")
      .expect(200);
    var maps = response.body;
    expect(maps).toHaveLength(0);
  });
});

// TODO: add tests for POST '/api/map/:'
describe("/api/map:id (save map)", () => {
  beforeEach(async () => {
    // clear maps
    await Map.destroy({ where: {}, truncate: true });
  });
  test("update an existing map", async () => {
    // add a map
    var map1 = await Map.create({ map: dummyGoodMap, name: "map1" });
    var map1JSON = map1.toJSON();
    var response = await request(app)
      .post(`/api/map/${map1JSON.id}`)
      .send({ map: map1JSON.map });
    expect(response.body.map).toMatchObject(map1JSON.map);
    expect(response.body.name).toBe(map1JSON.name);
    expect(response.body.id).toBe(map1JSON.id);
  });
  test("should throw when trying to update non-existing map", async () => {
    var response = await request(app)
      .post("/api/map/221")
      .send({ map: dummyGoodMap })
      .expect(500);
    expect(response.error.text).toMatch(/could not find map for id/);
  });
  test("should throw when trying to update with invalid map", async () => {
    var map1 = await Map.create({ map: dummyGoodMap, name: "map1" });
    var response = await request(app)
      .post(`/api/map/${map1.toJSON().id}`)
      .send({ map: {} })
      .expect(500);
    expect(response.error.text).toMatch(/should have required property/);
  });
});

afterAll(async () => {
  // drop all maps
  await Map.destroy({ where: {}, truncate: true });
  await sequelize.close();
});
