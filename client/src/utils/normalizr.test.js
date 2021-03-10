import { normalizeMap, denormalizeMap } from "./normalizr";
import sampleMap from "test-data/test-maps/3x3-with-pps-charger-fireemergencies.json";

var lenKeys = obj => Object.keys(obj).length;

describe("normalizeMap", () => {
  test("test 3x3 map normalize", () => {
    var normalizedMap = normalizeMap(sampleMap);
    var { entities } = normalizedMap;
    expect(lenKeys(entities.map)).toBe(1);
    expect(lenKeys(entities.floor)).toBe(1);
    expect(entities).not.toHaveProperty("elevator");
    expect(entities).not.toHaveProperty("zone");
    expect(entities).not.toHaveProperty("queueData");
    expect(entities).not.toHaveProperty("sectorBarcodeMapping");
    expect(lenKeys(entities.barcode)).toBe(9);
    expect(lenKeys(entities.charger)).toBe(1);
    expect(lenKeys(entities.pps)).toBe(2);
    expect(entities).not.toHaveProperty("ods");
    expect(entities).not.toHaveProperty("dockPoint");
    expect(lenKeys(entities.fireEmergency)).toBe(2);
  });
});

describe("denormalizeMap", () => {
  test("test 3x3 map only that was tested in normalize", () => {
    var normalizedMap = normalizeMap(sampleMap);
    var denormalized = denormalizeMap(normalizedMap);
    expect(denormalized).toMatchObject(sampleMap);
  });
});
