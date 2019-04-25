import React from "react";
import BaseJsonForm from "./BaseJsonForm";

const makeSchema = (itemName, itemId) => {
  return {
    title: `Delete ${itemName} #${itemId}?`,
    type: "object",
    required: [],
    properties: {}
  };
};

const RemoveItemForm = ({
  itemName,
  itemId,
  buttonText = "Delete",
  onSubmit,
  ...rest
}) => (
  <BaseJsonForm
    {...rest}
    schema={makeSchema(itemName, itemId)}
    onSubmit={onSubmit}
    buttonText={buttonText}
  />
);
export default RemoveItemForm;
