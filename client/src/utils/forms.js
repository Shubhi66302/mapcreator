import { number, object, string, array } from "yup";
import _ from "lodash";

const directions = [0, 1, 2, 3];
const directionNames = ["Top", "Right", "Bottom", "Left"];
export const directionsAndNames = _.zip(directions, directionNames);

export const directionSchema = {
  type: "number",
  title: "Direction",
  default: 0,
  enum: directions,
  enumNames: directionNames
};

export const listOfBarcodesSchema = {
  type: "string",
  title: "Barcodes",
  pattern: "^\\d\\d\\d\\.\\d\\d\\d( *, *\\d\\d\\d\\.\\d\\d\\d)* *$"
};

export const barcodeStringSchema = {
  type: "string",
  title: "Barcode",
  pattern: "^\\d\\d\\d\\.\\d\\d\\d$"
};

export const neighboursSchema = {
  type: "object",
  required: ["neighbours", "size_info"],
  properties: {
    neighbours: {
      type: "string",
      title: "Neighbour Structure",
      pattern: "^[01], *[01], *[01]$"
    },
    size_info: {
      type: "number",
      title: "Size Info",
      minimum: 0
    }
  },
  title: "Neighbours"
};

// yup schemas

export const yupPosIntSchema = number()
  .required("Required")
  .integer("Should be integer")
  .min(1, "Should be positive integer");

export const yupNonNegIntSchema = number()
  .required("Required")
  .integer("Should be integer")
  .min(0, "Should be non-negative integer");

export const yupBarcodeStringSchema = string()
  .required("Required")
  .matches(/^\d\d\d\.\d\d\d$/, "Should match barcode pattern (eg. 000.001)");

export const yupEntryExitBarcodesSchema = array().of(
  object().shape({
    barcode: yupBarcodeStringSchema,
    boom_barrier_id: yupPosIntSchema,
    floor_id: yupPosIntSchema
  })
);

export const yupCoordinateStringSchema = string()
  .required("Required")
  .matches(/^\d+,\d+$/, "Should match coordinate pattern (eg. 5,6)");

export const yupDirectionSchema = number()
  .required("Required")
  .oneOf([0, 1, 2, 3]);

export const yupCoordinateListSchema = array()
  .of(
    object().shape({
      coordinate: yupCoordinateStringSchema,
      direction: yupDirectionSchema
    })
  )
  .min(1, "Atleast one coordinate required");
