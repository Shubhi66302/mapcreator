import React from "react";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { linkTo } from "@storybook/addon-links";

import { Button, Welcome } from "@storybook/react/demo";
import JSONFileInput from "components/JSONFileInput";
import InlineTextInput from "components/InlineTextInput";
import BarcodeViewPopup from "components/Map/BarcodeViewPopup";
import BaseCard from "components/Map/Sidebar/BaseCard";
import Chargers from "components/Map/Sidebar/Chargers";

import { makeState, singleFloor } from "utils/test-helper";
import { Provider } from "react-redux";
import { configureStore } from "../store";
import RemoveItemForm from "components/Map/Forms/Util/RemoveItemForm";
import DeleteMap from "components/Map/Forms/DeleteMap";
import { BrowserRouter as Router } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { BulletList } from "react-content-loader";
import ContentLoader from "components/SavedMaps/ContentLoader";
import CopyJSONsCard from "../components/Map/Sidebar/CopyJSONsCard";

const store = configureStore(makeState(singleFloor));

storiesOf("Welcome", module).add("to Storybook", () => (
  <Welcome showApp={linkTo("Button")} />
));

const BootstrapDecorator = storyFn => (
  <div className="container">{storyFn()}</div>
);

const SidebarWidthDecorator = storyFn => (
  <div style={{ width: "300px" }}>{storyFn()}</div>
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

storiesOf("Sidebar/BaseCard", module).add("default", () => (
  <BaseCard title={"test"}>Hello world</BaseCard>
));
storiesOf("Sidebar/ListOfBaseCards", module).add("default", () =>
  ["1", "2", "3"].map((title, idx) => (
    <BaseCard title={title} key={idx}>
      Hello world
    </BaseCard>
  ))
);
// add chargers
storiesOf("Sidebar/Chargers", module)
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  .add("default", () => <Chargers />);

storiesOf("Sidebar/Summary/CopyJSONsCard", module)
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  .addDecorator(BootstrapDecorator)
  .addDecorator(SidebarWidthDecorator)
  .add("default", () => <CopyJSONsCard />);

storiesOf("RemoveItemForm", module).add("default", () => (
  <RemoveItemForm itemName="Elevator" onSubmit={() => {}} itemId={5} />
));

storiesOf("DeleteMap", module)
  // redux decorator
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  // react-router decorator
  .addDecorator(story => <Router>{story()}</Router>)
  .add("default", () => <DeleteMap />);

storiesOf("ReactPlaceholder", module)
  .add("BulletList", () => <BulletList height={70} />)
  .add("MyContentLoader", () => <ContentLoader />);
