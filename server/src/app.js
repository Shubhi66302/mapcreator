import express from "express";
import getLoadedAjv from "client/src/common/utils/get-loaded-ajv";
import { Map } from "server/models/index";
import wrap from "express-async-handler";
import getRacksJson from "server/scripts/make-racks-json";
import sequelize, { Op } from "sequelize";
import { requestValidation } from "./verifier-apis";
import moment from "moment";
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
    try {
      const { id } = req.params;
      var map = await Map.findByPk(id);
      console.log("map", map);
      if (!map) throw new Error(`could not find map for id ${id}`);
      return res.json(map.toJSON());
    } catch (e) {
      console.log("e", e);
    }
  })
);

// only fetch id, name, createdOn, updatedOn
app.get(
  "/api/maps",
  wrap(async (req, res) => {
    var str = req.query.str;
    const attributes = ["id", "name", "createdAt", "updatedAt", "sanity", "validationRequested"];
    const order = [["updatedAt", "DESC"]];
    let maps;
    if (str) {
      maps = await Map.findAll({
        where: {
          [Op.or]: [
            {
              name: {
                [Op.iLike]: `%${str}%`
              }
            },
            sequelize.where(
              sequelize.cast(sequelize.col("Map.id"), "varchar"),
              { [Op.iLike]: `%${str}%` }
            )
          ]
        },
        attributes,
        order
      });
    } else {
      maps = await Map.findAll({
        attributes,
        order
      });
    }
    var mapsJson = maps.map(map => map.toJSON());
    res.json(mapsJson);
  })
);

// update map
app.post(
  "/api/map/:id",
  wrap(async (req, res) => {
    const { id } = req.params;
    const { map: reqMap } = req.body;
    var map = await Map.findByPk(id);
    if (!map) throw new Error(`could not find map for id ${id}`);
    // TODO: run validation here?
    var validate = getLoadedAjv().getSchema("map");
    if (!validate(reqMap)) {
      throw new Error(JSON.stringify(validate.errors));
    }
    await map.update({ map: reqMap, validationRequested: false, sanity: false});
    // send back the new map?
    var newMap = await Map.findByPk(id);
    res.json(newMap.toJSON());
  })
);

// delete map
app.post("/api/deleteMap/:id", (req, res) => {
  const { id } = req.params;
  return Map.destroy({
    where: {
      id
    }
  }).then(numDeleted => {
    if (numDeleted !== 1)
      res
        .status(500)
        .send(`was able to delete ${numDeleted} rows instead of 1`);
    else res.send("ok");
  });
});

app.get(
  "/api/racksJson/:id",
  wrap(async (req, res) => {
    const { id } = req.params;
    var map = await Map.findByPk(id);
    if (!map) throw new Error(`could not find map for id ${id}`);
    var racksJson = await getRacksJson(id);
    res.json(racksJson);
  })
);

// Request validation of a Map
app.post(
  "/api/requestValidation",
  wrap(async (req, res) => {
    const { map_creator_id, email } = req.body;
    var map = await Map.findByPk(map_creator_id);

    if (!email) {
      throw new Error("Email ID is required");
    }
    // call verifier API for validation
    requestValidation(req.body)
    .then(response => {
        if (response.status === 202) {
          return response.text();
        } 
        return "Internal server error";
    })
    .then(async (ver_res) => {
      await map.update({ validationRequested: true},{ silent: true });
      res.send(ver_res);
    })
    .catch((error) => {
      console.log(error);
    });
  })
);

// verifier request after validation
app.post(
  "/api/updateSanityStatus",
  wrap(async (req, res) => {
    const { map_id, map_updated_time, sanity_status } = req.body;
    var map = await Map.findByPk(map_id);
    var format = "YYYY-MM-DD HH:mm:ssZ";
    var current_updated_time = moment(map.updatedAt).utc().format(format);

    if (map_updated_time !== current_updated_time) {
      res.send("Map has been changed");
    } else {
      await map.update({ sanity: sanity_status, validationRequested: false});
      res.send("ok");
    }
  })
);

// error handler should be last middleware?
// removing next from here breaks tests??
/* eslint-disable-next-line no-unused-vars */
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

export default app;
