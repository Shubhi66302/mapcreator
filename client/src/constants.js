// PIXI constants
export var TILE_WIDTH = 180;
export var TILE_HEIGHT = 220;
// tile sprite dimensions used to calculate actual hitbox for registering clicks
export var TILE_SPRITE_WIDTH = 150;
export var TILE_SPRITE_HEIGHT = 150;

// Distance tile and number related constants
export var DISTANCE_TILE_WIDTH = 120;
export var DISTANCE_TILE_HEIGHT =  300;
// scale 2 if distance is 200 and 3 if distance is 1500
// for other distances use linear interpolation
export var DISTANCE_NUMBER_SCALE_MAP = {min: [200, 2], max: [1500, 3]};

// Gap between barcode tile sprite
export var DEFAULT_DISTANCE_BW_BARCODES = 1500;
export var BARCODE_SPRITE_GAP = 500;
export var SCALE = 4;
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
// TODO: figure out how to display zones with limited number of colors?
// eg. continental has 16 zones.
// right now just using 1 color? actually zone view is not implemented.
export var ZONE_BASE = "not_implemented.png";
export var ODS_EXCLUDED = "normal.png";
export var EMERGENCY_EXIT = "emergency-exit.png";
export var ELEVATOR = "elevator.png";
// graph edge sprites
export var EDGE_SPRITES = ["0.png", "1.png", "2.png", "3.png"];

// Constants for map charger_location
export var CHARGER_DISTANCE = 205;

// Viewport
export var VIEWPORT_MAX_SIZE_PADDING_RATIO = 2;
export var DEFAULT_BOT_WITH_RACK_THRESHOLD = 750;