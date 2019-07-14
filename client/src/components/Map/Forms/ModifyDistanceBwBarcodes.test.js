import { configureStore } from "store";
import { makeState as makeStateApp, singleFloorVanilla} from "utils/test-helper";
import { clickOnDistanceTile } from "actions/actions";
import {getUpdatedSchema} from "./ModifyDistanceBwBarcodes";

describe("getUpdatedSchema", () => {
  test("should return disabled value as true when no distance tile is selected", async () => {
    var store = configureStore(
      // arguments are mapJson, currentFloor
      makeStateApp(singleFloorVanilla, 1)
    );
    const state = store.getState();
    const updatedSchema = getUpdatedSchema(state);
    expect(updatedSchema.disabled).toBeTruthy();
  });
  test("should return disabled value as false when column distance tile is selected", async () => {
    var store = configureStore(
      makeStateApp(singleFloorVanilla, 1)
    );
    await store.dispatch(clickOnDistanceTile("c-0"));
    const state = store.getState();
    const updatedSchema = getUpdatedSchema(state);
    // test for button enabled test
    expect(updatedSchema.disabled).toBeFalsy();
    // test for correct direction added in drop down
    expect(updatedSchema.direction.enum).toEqual([1, 3]);
  });
  test("should return disabled value as false when row distance tile is selected", async () => {
    var store = configureStore(
      // arguments are mapJson, currentFloor
      makeStateApp(singleFloorVanilla, 1)
    );
    await store.dispatch(clickOnDistanceTile("r-0"));
    const state = store.getState();
    const updatedSchema = getUpdatedSchema(state);
    // test for button enabled test
    expect(updatedSchema.disabled).toBeFalsy();
    // test for correct direction added in drop down
    expect(updatedSchema.direction.enum).toEqual([0, 2]);
  });
  test("should return disabled value as false multiple row distance tiles are selected", async () => {
    var store = configureStore(
      // arguments are mapJson, currentFloor
      makeStateApp(singleFloorVanilla, 1)
    );
    await store.dispatch(clickOnDistanceTile("r-0"));
    await store.dispatch(clickOnDistanceTile("r-1"));
    const state = store.getState();
    const updatedSchema = getUpdatedSchema(state);
    // test for button enabled test
    expect(updatedSchema.disabled).toBeFalsy();
    // test for correct direction added in drop down
    expect(updatedSchema.direction.enum).toEqual([0, 2]);
  });
  test("should return disabled value as true when both row and column distance tiles are selected", async () => {
    var store = configureStore(
      // arguments are mapJson, currentFloor
      makeStateApp(singleFloorVanilla, 1)
    );
    await store.dispatch(clickOnDistanceTile("r-0"));
    await store.dispatch(clickOnDistanceTile("c-0"));
    const state = store.getState();
    const updatedSchema = getUpdatedSchema(state);
    // test for button enabled test
    expect(updatedSchema.disabled).toBeTruthy();
  });
});
