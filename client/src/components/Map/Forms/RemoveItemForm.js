
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";

const makeSchema =  (itemName, itemId) => {
  return {
    title: `Delete ${itemName} #${itemId}`,
    type: "object",
    required: [],
    properties: {
    }
  };
};

const RemoveItemForm = ({itemName, itemId, onSubmit}) => (
  <BaseJsonForm
    schema={makeSchema(itemName, itemId)}
    onSubmit={onSubmit}
    buttonText={"Delete"}
  />
);
export default RemoveItemForm;
