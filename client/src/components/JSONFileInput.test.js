import React from "react";
import { shallow } from "enzyme";
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

  // TODO: remove this if not going to write tests
  // test("onChange called on file change event", () => {
  //   const onChange = jest.fn();
  //   wrapper = shallow(<JSONFileInput onRead={() => {}} onChange=/>)
  // })
});
