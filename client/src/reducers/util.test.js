import { createEntityReducer } from "./util";

describe("createEntityReducer", () => {
  var dummyEntityReducer = createEntityReducer("DUMMY", "dummy_id");
  var someEntities = {
    "1": { dummy_id: 1, content: "hello", coordinate: "1,1" },
    "2": { dummy_id: 2, content: "world", coordinate: "2,2" },
    "3": { dummy_id: 3, content: "world2", coordinate: "7,7" }
  };
  describe("ADD-MULTIPLE-X", () => {
    test("adds all entities when list of entities provided", () => {
      var newDummyEntities = [
        { dummy_id: 4, content: "four", coordinate: "3,4" },
        { dummy_id: 5, content: "five", coordinate: "5,6" }
      ];
      expect(
        dummyEntityReducer(someEntities, {
          type: "ADD-MULTIPLE-DUMMY",
          value: newDummyEntities
        })
      ).toMatchObject({
        ...someEntities,
        "4": { ...newDummyEntities[0], dummy_id: 4 },
        "5": { ...newDummyEntities[1], dummy_id: 5 }
      });
    });
    test("updates entities that already existed and also adds new ones", () => {
      var newDummyEntities = [
        { dummy_id: 2, content: "newTwo", coordinate: "2,2" },
        { dummy_id: 3, content: "newThree", coordinate: "7,7" },
        { dummy_id: 4, content: "another", coordinate: "5,6" }
      ];
      expect(
        dummyEntityReducer(someEntities, {
          type: "ADD-MULTIPLE-DUMMY",
          value: newDummyEntities
        })
      ).toMatchObject({
        ...someEntities,
        "2": { ...newDummyEntities[0], dummy_id: 2 },
        "3": { ...newDummyEntities[1], dummy_id: 3 },
        "4": { ...newDummyEntities[3], dummy_id: 4 }
      });
    });
  });
  describe("UPDATE-X-BY-ID", () => {
    test("works correctly when existing entity update is provided", () => {
      var updatedEntity = { dummy_id: 2, content: "hello2" };
      expect(
        dummyEntityReducer(someEntities, {
          type: "UPDATE-DUMMY-BY-ID",
          value: updatedEntity
        })
      ).toMatchObject({ ...someEntities, "2": updatedEntity });
    });
    test("adds an entity if a new one is provided", () => {
      var newEntity = { dummy_id: 3, content: "new" };
      expect(
        dummyEntityReducer(someEntities, {
          type: "UPDATE-DUMMY-BY-ID",
          value: newEntity
        })
      ).toMatchObject({ ...someEntities, "3": newEntity });
    });
  });
  describe("DELETE-X-BY-ID", () => {
    test("works correctly when existing entity id to delete is provided", () => {
      expect(
        dummyEntityReducer(someEntities, {
          type: "DELETE-DUMMY-BY-ID",
          value: 2
        })
      ).toMatchObject({ "1": someEntities["1"] });
    });
    test("doesn't do anything if non existing id is provided", () => {
      expect(
        dummyEntityReducer(someEntities, {
          type: "DELETE-DUMMY-BY-ID",
          value: 3
        })
      ).toMatchObject(someEntities);
    });
  });
});
