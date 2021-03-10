import React, { Component } from "react";
import importMap from "common/utils/import-map";
import JSONFileInput from "components/JSONFileInput";
import { handleErrors } from "utils/util";
import { withRouter } from "react-router-dom";
import SweetAlertError from "components/SweetAlertError";
import { createMap } from "utils/api";
import _ from "lodash";

class ImportMap extends Component {
  state = {
    name: "",
    error: undefined
  };

  onRead = stateKey => json => {
    // should do validation here or not? probably not, just do it once submit is pressed
    this.setState({ [stateKey]: json });
  };

  onError = error => this.setState({ error });

  onClear = stateKey => () => {
    this.setState({ [stateKey]: undefined });
  };

  onSubmit = e => {
    e.preventDefault();
    // validate the import by converting everything into the map using import function
    let imported;
    try {
      imported = importMap(_.omit(this.state, ["name", "error"]));
    } catch (error) {
      this.setState({ error: error.message });
      return;
    }
    // save
    const { name } = this.state;
    const { history } = this.props;
    createMap(imported, name)
      .then(handleErrors)
      .then(res => res.json())
      .then(id => history.push(`/map/${id}`))
      .catch(error => this.setState({ error }));
  };

  render() {
    const { error } = this.state;
    return (
      <div className="container">
        {/* sweetalert here*/}
        <SweetAlertError
          error={error}
          onConfirm={() => this.setState({ error: undefined })}
        />
        <h3 className="display-5 pb-4">Specify files to import from</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group row">
            <label htmlFor="name" className="col-form-label col-sm-3">
              Name
            </label>
            <div className="col-sm-9">
              <input
                type="text"
                id="name"
                className="form-control"
                value={this.state.name}
                onChange={e => this.setState({ name: e.target.value })}
              />
            </div>
          </div>
          {[
            ["map", "map.json", "mapJson"],
            ["pps", "pps.json", "ppsJson"],
            ["charger", "charger.json", "chargerJson"],
            ["zone", "zone.json", "zoneJson"],
            ["sector", "sector.json", "sectorJson"],
            ["ods_excluded", "ods_excluded.json", "odsExcludedJson"],
            ["fire_emergency", "fire_emergency.json", "fireEmergencyJson"],
            ["elevator", "elevator.json", "elevatorJson"]
          ].map(([idField, label, stateKey], idx) => (
            <JSONFileInput
              onClear={this.onClear(stateKey)}
              onRead={this.onRead(stateKey)}
              onError={this.onError}
              idField={idField}
              label={label}
              key={idx}
            />
          ))}
          <div className="form-group row">
            <div className="col-sm-10">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(ImportMap);
