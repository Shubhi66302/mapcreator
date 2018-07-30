import express from "express";
import getLoadedAjv from "server/src/utils/get-loaded-ajv";
import { Map } from "server/models/index";
import wrap from "express-async-handler";

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/api/test", (req, res) => res.json("test api response"));

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
    // send
    res.json(created);
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
    res.json(maps.map(map => map.toJSON()));
  })
);

// error handler should be last middleware?
app.use((err, req, res, next) => {
  // console.log(err.message);
  res.status(500).send(err.message);
});

export default app;
