require("dotenv").config({ path: ".env.test" });

import mongoose from "mongoose";
var connection = mongoose.connect(process.env.MONGODB_URI);

// use js promise
mongoose.Promise = global.Promise;

import Map from "server/src/models/map";
import Floor from "server/src/models/floor";
import Barcode from "server/src/models/barcode";

import importMapJson from "server/src/utils/import/map-json";
import mapJson from "./test-jsons/map.json";
import _ from "lodash";
import moment from "moment";

// clear database
beforeEach(async () => {
  await mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => await mongoose.connection.db.dropDatabase());
});

test("imports map.json into db", async () => {
  /// Setup
  var created_on = moment()
    .add(-1, "days")
    .toDate();
  var updated_on = new Date();
  var mapId = await importMapJson(mapJson, "test-map", created_on, updated_on);

  /// Test
  // get map
  var map = await Map.findOne({ _id: mapId }).populate("floors");
  expect(map).toBeTruthy();
  expect(map.toObject()).toMatchObject({
    name: "test-map",
    created_on,
    updated_on
  });
  expect(map.floors.length).toBe(mapJson.length);
  // NOTE: dangerous to use forEach with async, using map instead
  await Promise.all(
    _.zip(
      _.sortBy(map.floors, ["floor_id"]),
      _.sortBy(mapJson, ["floor_id"])
    ).map(async ([floor, floorJson]) => {
      expect(floor.floor_id).toBe(floorJson.floor_id);
      expect(floor._map).toBe(map._id);
      var barcodes = (await Barcode.find({ _floor: floor._id })).map(a =>
        a.toJSON()
      );

      // coordinates in map.json are sometimes space separated, need to ignore that...
      expect(_.sortBy(barcodes, ["coordinate"])).toEqual(
        _.sortBy(floorJson.map_values, ["coordinate"]).map(x => ({
          ...x,
          coordinate: x.coordinate.replace(/ /g, "")
        }))
      );
    })
  );
});
