// PIXI constants
export var TILE_WIDTH = 180;
export var TILE_HEIGHT = 220;
// tile sprite dimensions used to calculate actual hitbox for registering clicks
export var TILE_SPRITE_WIDTH = 150;
export var TILE_SPRITE_HEIGHT = 150;

// Distance tile and number related constants
export var DISTANCE_TILE_WIDTH = 120;
export var DISTANCE_TILE_HEIGHT = 300;
// scale 2 if distance is 200 and 3 if distance is 1500
// for other distances use linear interpolation
export var DISTANCE_NUMBER_SCALE_MAP = { min: [200, 2], max: [1500, 3] };

export var DEFAULT_DISTANCE_BW_BARCODES = 1500;
// Gap between barcode tile sprite
export var BARCODE_SPRITE_GAP = 500;
// The rendered barcode does not occupy the full 1500x1500 area (for default size), but a smaller one
// defined by this value. Right now its about 67%
export const BARCODE_CLICKABLE_AREA_RATIO =
  (DEFAULT_DISTANCE_BW_BARCODES - BARCODE_SPRITE_GAP) /
  DEFAULT_DISTANCE_BW_BARCODES;
// Default scale for converting from sprite pixels to world coordinates
// Scale is for stretching out the barcode.png sprite to exactly fit the tile
// bounding box. Hence it is not {1,1} for the default sprite but some other value.
// These values are not dimensionless! They're in world-coordinate/pixels
export const DEFAULT_X_SCALE =
  (BARCODE_CLICKABLE_AREA_RATIO * DEFAULT_DISTANCE_BW_BARCODES) /
  TILE_SPRITE_WIDTH;
export const DEFAULT_Y_SCALE =
  (BARCODE_CLICKABLE_AREA_RATIO * DEFAULT_DISTANCE_BW_BARCODES) /
  TILE_SPRITE_HEIGHT;

export var BARCODE_DIGIT_OFFSET = 5; // in y
export var BARCODE_DIGIT_HEIGHT = 36;
export var BARCODE_DIGIT_WIDTH = 23;
// constants for offsetting barcode string sprites
export var AFTER_DOT_SPRITE_X_OFFSET = -10;
// approx ~320k sprites are created for a map of size 200x200. if more than MAX_SPRITES
// sprites are present, they won't be rendered and mapcreator won't work.
export var MAX_SPRITES = 400000;
const spritesheetName = "sheet";
export var SPRITESHEET_PATH = `${
  process.env.PUBLIC_URL
}/${spritesheetName}.json`;
// define sprite names for all types of tiles
// TODO: fix these strings when final spritesheet is created
// TODO: add distance tile logic also
export var NORMAL = "normal.png";
export var SELECTED = "selected.png";
export var STORABLE = "storable.png";
export var PPS = "pps.png";
export var CHARGER = "charger.png";
export var CHARGER_ENTRY = "charger-entry.png";
export var QUEUE = "queue.png";
export var DOCK_POINT = "normal.png";
export var ODS_EXCLUDED = "normal.png";
export var EMERGENCY_EXIT = "emergency-exit.png";
export var ELEVATOR = "elevator.png";
export var BARCODE_DOT_SPRITE = "dot.png";
export var BARCODE_CENTRE_SPRITE = "dot.png";
// graph directionality edge sprites
export const DIRECTIONALITY_SPRITES_MAP = {
  "1,0,0": "100.png", // not allowed edge
  "1,1,0": "110.png", // only lift down allowed edge
  "1,1,1": "111.png", // all allowed edge
  "0,0,0": "000.png" // won't be drawing any sprite for this case
};

// Constants for map charger_location
export var CHARGER_DISTANCE = 205;
export const OPTION_DEFAULTS = {"key": "Select One", "value": null};
export const MSUDIMENSIONS = [OPTION_DEFAULTS.value, 97.9, 131.8];
export const MSUDIMENSIONSNAMES = [OPTION_DEFAULTS.key, "97.9 * 97.9", "131.8 * 131.8"];
export const BARCODEDISTANCE12X = [OPTION_DEFAULTS.value, 1220];
export const BARCODEDISTANCE12XNAMES = [OPTION_DEFAULTS.key, "1220 mm"];
export const BARCODEDISTANCE15X = [OPTION_DEFAULTS.value, 1500, 1560];
export const BARCODEDISTANCE15XNAMES = [OPTION_DEFAULTS.key, "1500 mm", "1560 mm"];

// Viewport
export var VIEWPORT_MAX_SIZE_PADDING_RATIO = 2;
export var DEFAULT_BOT_WITH_RACK_THRESHOLD = 750;
