import express from "express";
import getLoadedAjv from "client/src/common/utils/get-loaded-ajv";
import { Map } from "server/models/index";
import wrap from "express-async-handler";
import getRacksJson from "server/scripts/make-racks-json";
import _ from "lodash";
// HACK: adding cors to fetch data from storybook. should remove this later.
import cors from "cors";
const app = express();
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

app.get("/api/test", (req, res) => res.json("test api response"));

// should only return the id of the map
app.post(
  "/api/createMap",
  wrap(async (req, res) => {
    // expect internal representation json here.
    // should be correct but validating anyway
    var validate = getLoadedAjv().getSchema("map");
    const { map, name } = req.body;
    if (!validate(map)) {
      throw new Error(JSON.stringify(validate.errors));
    }
    if (!name) {
      throw new Error("name is required");
    }
    // store in db
    var created = await Map.create({ map, name });
    // send only id
    res.json(created.id);
  })
);

app.get(
  "/api/map/:id",
  wrap(async (req, res) => {
    const { id } = req.params;
    var map = await Map.findById(id);
    if (!map) throw new Error(`could not find map for id ${id}`);
    res.json(map.toJSON());
  })
);

// only fetch id, name, createdOn, updatedOn
app.get(
  "/api/maps",
  wrap(async (req, res) => {
    var maps = await Map.findAll({
      attributes: ["id", "name", "createdAt", "updatedAt"]
    });
    // sort by descending updatedAt
    var sortedMaps = _.sortBy(maps.map(map => map.toJSON()), [
      o => Date(o.updatedAt)
    ]).reverse();

    res.json(sortedMaps);
  })
);
// update map
app.post(
  "/api/map/:id",
  wrap(async (req, res) => {
    const { id } = req.params;
    const { map: reqMap } = req.body;
    var map = await Map.findById(id);
    if (!map) throw new Error(`could not find map for id ${id}`);
    // TODO: run validation here?
    var validate = getLoadedAjv().getSchema("map");
    if (!validate(reqMap)) {
      throw new Error(JSON.stringify(validate.errors));
    }
    await map.update({ map: reqMap });
    // send back the new map?
    var newMap = await Map.findById(id);
    res.json(newMap.toJSON());
  })
);

app.get(
  "/api/racksJson/:id",
  wrap(async (req, res) => {
    const { id } = req.params;
    var map = await Map.findById(id);
    if (!map) throw new Error(`could not find map for id ${id}`);
    var racksJson = await getRacksJson(id);
    res.json(racksJson);
  })
);

// error handler should be last middleware?
// removing next from here breaks tests??
/* eslint-disable-next-line no-unused-vars */
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

export default app;
