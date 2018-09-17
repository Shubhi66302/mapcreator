export const directionSchema = {
  type: "number",
  title: "Direction",
  default: 0,
  enum: [0, 1, 2, 3],
  enumNames: ["Top", "Right", "Bottom", "Left"]
};

export const barcodeStringSchema = {
  type: "string",
  title: "Barcode",
  pattern: "^\\d\\d\\d\\.\\d\\d\\d$"
};
