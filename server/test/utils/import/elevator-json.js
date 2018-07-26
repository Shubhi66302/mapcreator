require("dotenv").config({ path: ".env.test" });

import mongoose from "mongoose";
var connection = mongoose.connect(process.env.MONGODB_URI);

// use js promise
mongoose.Promise = global.Promise;

import Elevator from "server/src/models/elevator";
import Map from "server/src/models/map";
import importElevatorJson from "server/src/utils/import/elevator-json";
import importMapJson from "server/src/utils/import/map-json";
import elevatorsJson from "./test-jsons/elevator.json";
import mapJson from "./test-jsons/map.json";
import _ from "lodash";

// clear database
beforeEach(async () => {
  await mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => await mongoose.connection.db.dropDatabase());
});

test("import elevator.json into db", async () => {
  /// Setup
  // import map.json first
  const mapId = await importMapJson(
    mapJson,
    "test-map",
    new Date(),
    new Date()
  );
  const elevatorIds = await importElevatorJson(elevatorsJson, mapId);

  /// Test
  // map should have elevator refs in it
  const map = await Map.findById(mapId);
  expect(map.elevators.sort()).toEqual(elevatorIds.sort());

  // need to remove duplicates from elevatorJson
  var dedupedElevatorsJson = elevatorsJson.map(
    ({
      entry_barcodes,
      coordinate_list,
      reinit_barcodes,
      exit_barcodes,
      ...rest
    }) => ({
      ...rest,
      entry_barcodes: _.uniqBy(entry_barcodes, "barcode"),
      coordinate_list: _.uniqBy(coordinate_list, JSON.stringify),
      reinit_barcodes: _.uniqBy(reinit_barcodes, "floor_id"),
      exit_barcodes: _.uniqBy(exit_barcodes, "barcode")
    })
  );
  // elevators should match json
  var elevators = await Elevator.find({ _id: { $in: elevatorIds } });
  expect(_.sortBy(elevators.map(e => e.toJSON()), ["elevator_id"])).toEqual(
    _.sortBy(dedupedElevatorsJson, ["elevator_id"])
  );
});
// describe("Array", function() {
//   describe("#indexOf()", function() {
//     it("should return -1 when the value is not present", function() {
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });
//
// describe(".env.test config", () => {
//   it("should be test db", () => {
//     assert.equal(
//       "mongodb://localhost/mapcreator-test",
//       process.env.MONGODB_URI
//     );
//   });
// });
//
// describe("Import elevator.json into DB", () => {
//   beforeEach(async () => await Elevator.remove({}));
//
//   describe("elevator.json", () => {
//     it("should exist", () => {
//       assert.exists(elevatorsJson);
//     });
//   });
//
//   describe("add to collection", () => {
//     it("should return correct number of elevator ids", async () => {
//       var elevatorIds = await importElevatorJson(elevatorsJson);
//       // make sure same number of elements
//       assert.equal(elevatorIds.length, elevatorsJson.length);
//     });
//   });
//
//   it("should import elevator.json into elevators collection", async () => {
//     var elevatorIds = await importElevatorJson(elevatorsJson);
//     await Promise.all(
//       _.zip(elevatorIds, elevatorsJson).map(
//         async ([elevatorId, elevatorsJsonObj]) => {
//           var dbElevator = await Elevator.findOne({ _id: elevatorId });
//           assert.exists(dbElevator);
//           // check fields are correct
//           assert.includeDeepMembers(dbElevator.toObject(), elevatorsJsonObj);
//         }
//       )
//     );
//   });
// });
// // describe("Elevator");
