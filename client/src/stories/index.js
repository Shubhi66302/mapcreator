import React from "react";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { linkTo } from "@storybook/addon-links";

import { Button, Welcome } from "@storybook/react/demo";
import JSONFileInput from "components/JSONFileInput";
import InlineTextInput from "components/InlineTextInput";
import BarcodeViewPopup from "components/Map/BarcodeViewPopup";
import BaseCard from "components/Sidebar/BaseCard";
import Chargers from "components/Sidebar/Chargers";

import { makeState, singleFloor } from "utils/test-helper";
import { Provider } from "react-redux";
import { configureStore } from "../store";
import "bootstrap/dist/css/bootstrap.min.css";

const store = configureStore(makeState(singleFloor));

storiesOf("Welcome", module).add("to Storybook", () => (
  <Welcome showApp={linkTo("Button")} />
));

const BootstrapDecorator = storyFn => (
  <div className="container">{storyFn()}</div>
);

storiesOf("Button", module)
  .add("with text", () => (
    <Button onClick={action("clicked")}>Hello Button</Button>
  ))
  .add("with some emoji", () => (
    <Button onClick={action("clicked")}>
      <span role="img" aria-label="so cool">
        😀 😎 👍 💯
      </span>
    </Button>
  ));

storiesOf("JSONFileInput", module)
  .addDecorator(BootstrapDecorator)
  .add("default", () => (
    <form>
      <JSONFileInput
        onRead={action("read")}
        onError={action("error")}
        idField="myfield"
        label="a label for this input"
      />
    </form>
  ));

storiesOf("InlineTextInput", module)
  .addDecorator(BootstrapDecorator)
  .add("text input without error", () => (
    <form>
      <InlineTextInput
        idField="idfield"
        label="dummy label"
        type="text"
        value="dummy value"
      />
    </form>
  ))
  .add("text input with error", () => (
    <form>
      <InlineTextInput
        idField="idfield"
        label="dummy label"
        type="text"
        value="dummy value"
        errorMessage="some error"
        touched
      />
    </form>
  ));

storiesOf("BarcodeViewPopup", module).add("default", () => (
  <BarcodeViewPopup
    show={true}
    toggle={() => {}}
    barcode={{
      store_status: 0,
      zone: "defzone",
      barcode: "000.000",
      botid: "null",
      neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 1], [1, 1, 1]],
      coordinate: "0,0",
      blocked: false,
      size_info: [750, 750, 750, 750]
    }}
  />
));

storiesOf("Sidebar BaseCard", module).add("default", () => (
  <BaseCard title={"test"}>Hello world</BaseCard>
));
// add chargers
storiesOf("Sidebar > Chargers", module)
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  .add("default", () => <Chargers />);
