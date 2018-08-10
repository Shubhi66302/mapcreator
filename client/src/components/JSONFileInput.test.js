import React from "react";
import { shallow, mount, render } from "enzyme";
import JSONFileInput from "./JSONFileInput";

describe("JSONFileInput Component", () => {
  test("renders correctly", () => {
    expect(
      shallow(
        <JSONFileInput
          onRead={() => {}}
          onError={() => {}}
          idField="dummy-field"
          label="dummy-label"
        />
      )
        .find("div.form-group")
        .exists()
    ).toBe(true);
  });
});
