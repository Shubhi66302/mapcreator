var env = process.env.NODE_ENV || "development";
var config = require(__dirname + "/../config/config.js")[env];
const BASENAME = config.verifier_url;

const requestValidation = payload =>
  fetch(`${BASENAME}/validate_this_map`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
});

export {
  requestValidation
};