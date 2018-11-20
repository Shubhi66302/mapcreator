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
