require("dotenv").config();
import app from "server/src/app";

app.listen(process.env.PORT, () =>
  console.log(`Listening on ${process.env.PORT}`)
);
