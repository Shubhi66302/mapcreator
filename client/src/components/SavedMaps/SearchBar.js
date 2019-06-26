import React from "react";
import debounce from "lodash.debounce";
import { getMaps } from "utils/api";

const fetchMaps = (query, onResults) =>
  getMaps(query).then(res => onResults(res));

const debouncedFetchMaps = debounce(fetchMaps, 200, {
  leading: false,
  trailing: true
});

export default ({ onResults }) => (
  <input
    type="text"
    className="form-control my-3"
    placeholder="Search"
    onChange={e => debouncedFetchMaps(e.target.value, onResults)}
  />
);
