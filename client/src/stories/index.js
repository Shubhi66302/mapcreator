import React from "react";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { linkTo } from "@storybook/addon-links";

import { Button, Welcome } from "@storybook/react/demo";
import JSONFileInput from "components/JSONFileInput";
import InlineTextInput from "components/InlineTextInput";
import TestReactPixiWithViewport from "components/TestReactPixiWithViewport";

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

storiesOf("TestReactPixiWithViewport", module).add("default", () => (
  <TestReactPixiWithViewport />
));
