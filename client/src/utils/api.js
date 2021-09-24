const BASENAME = process.env.REACT_APP_BASENAME || "";
// const BASENAME = "https://mapcreator.labs.greyorange.com" || "";
const getMap = (mapId) => fetch(`${BASENAME}/api/map/${mapId}`);
const updateMap = (mapId, map) =>
  fetch(`${BASENAME}/api/map/${mapId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      map,
    }),
  });
const createMap = (denormalizedMap, name) =>
  fetch(`${BASENAME}/api/createMap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      map: denormalizedMap,
      name,
    }),
  });
const deleteMap = (mapId) =>
  fetch(`${BASENAME}/api/deleteMap/${mapId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

const requestValidation = (payload) =>
  fetch(`${BASENAME}/api/requestValidation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

const getMaps = (query) => fetch(`${BASENAME}/api/maps?str=${query}`);
const getAllMaps = () => fetch(`${BASENAME}/api/maps`);

const getSampleRacksJson = (mapId) =>
  fetch(`${BASENAME}/api/racksJson/${mapId}`);

export {
  getMap,
  updateMap,
  createMap,
  deleteMap,
  requestValidation,
  getMaps,
  getAllMaps,
  getSampleRacksJson,
};
