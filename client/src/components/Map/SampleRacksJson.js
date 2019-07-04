import React, { Component } from "react";
import { connect } from "react-redux";
import { getMapId } from "utils/selectors";
import { getSampleRacksJson } from "utils/api";
import { saveAs } from "file-saver/FileSaver";

class SampleRacksJson extends Component {
  render() {
    const { mapId } = this.props;
    return (
      <button
        className="btn btn-outline-secondary mr-1"
        type="button"
        onClick={() =>
          getSampleRacksJson(mapId)
            .then(res => res.json())
            .then(racksJson => {
              var blob = new Blob([JSON.stringify(racksJson)], {
                type: "text/plain;charset=utf-8"
              });
              saveAs(blob, "racks.json");
            })
        }
      >
        Download Sample racks.json
      </button>
    );
  }
}

// add both redux and react-router decorators
export default connect(state => ({
  mapId: getMapId(state)
}))(SampleRacksJson);
