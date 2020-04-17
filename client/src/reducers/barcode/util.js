import { getNeighbouringCoordinateKeys, getNeighbouringCoordinateKeysIncludingDisconnected } from "utils/util";

export function getDirection(
  sourceCoordinate,
  destinationCoordinate,
  barcodesDict
) {
  var sourceNeighbours = getNeighbouringCoordinateKeys(
    sourceCoordinate,
    barcodesDict
  );
  var idx = sourceNeighbours.findIndex(elm => elm == destinationCoordinate);
  if (idx == -1) return 5;
  return idx;
}

export function getDirectionIncludingDisconnected(
  sourceCoordinate,
  destinationCoordinate,
  barcodesDict
) {
  var sourceNeighbours = getNeighbouringCoordinateKeysIncludingDisconnected(
    sourceCoordinate,
    barcodesDict
  );
  var idx = sourceNeighbours.findIndex(elm => elm == destinationCoordinate);
  if (idx == -1) return 5;
  return idx;
}
