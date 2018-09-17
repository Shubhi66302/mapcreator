// PIXI constants
// TODO: add sprite width/height for correct click handling
export var TILE_WIDTH = 250;
export var TILE_HEIGHT = 220;
export var SCALE = 4;
// constants for offseting barcode sprites
export var BARCODE_SPRITE_Y_OFFSET = -50;
export var BARCODE_SPRITE_X_OFFSET = 20;
// approx ~320k sprites are created for a map of size 200x200. if more than MAX_SPRITES
// sprites are present, they won't be rendered and mapcreator won't work.
export var MAX_SPRITES = 400000;

// define sprite names for all types of tiles
// TODO: fix these strings when final spritesheet is created
// TODO: add distance tile logic also
export var NORMAL = "0.png";
export var SELECTED = "1.png";
export var STORABLE = "2.png";
export var PPS = "3.png";
export var CHARGER = "4.png";
export var CHARGER_ENTRY = "5.png";
export var QUEUE = "6.png";
export var DOCK_POINT = "7.png";
export var DISTANCE_TILE = "0.png";
// TODO: figure out how to display zones with limited number of colors?
// eg. continental has 16 zones.
// right now just using 1 color? actually zone view is not implemented.
export var ZONE_BASE = "not_implemented.png";
export var ODS_EXCLUDED = "8.png";
export var EMERGENCY_EXIT = "9.png";

// Constants for map charger_location
export var CHARGER_DISTANCE = 205;
