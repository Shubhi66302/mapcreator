// main mapcreator page
import React, { Component } from "react";
import MapViewport from "components/Map/MapViewport";
import { connect } from "react-redux";
import { fetchMap, saveMap, downloadMap } from "actions/actions";
import SweetAlertError from "components/SweetAlertError";
import SweetAlertSuccess from "components/SweetAlertSuccess";

import AddPPS from "components/Map/Forms/AddPPS";
import AddCharger from "components/Map/Forms/AddCharger";
import AssignDockPoint from "components/Map/Forms/AssignDockPoint";
import AssignStorable from "components/Map/Forms/AssignStorable";
import AssignZone from "components/Map/Forms/AssignZone";
import AssignODSExcluded from "components/Map/Forms/AssignODSExcluded";
import AssignEmergencyBarcode from "components/Map/Forms/AssignEmergencyBarcode";
import AddBarcode from "components/Map/Forms/AddBarcode";
import RemoveBarcode from "components/Map/Forms/RemoveBarcode";
import ModifyDistanceBwBarcodes from "components/Map/Forms/ModifyDistanceBwBarcodes";

const QueueCheckbox = ({val, onChange}) => (
    <label>
    Queue mode:
    <input
      name="queuemode"
      type="checkbox"
      checked={val}
      onChange={onChange} />
  </label>
)
class Map extends Component {
  state = {
    error: undefined,
    successMessage: undefined
  };
  componentDidMount() {
    const {
      match: {
        params: { id }
      },
      dispatch
    } = this.props;
    dispatch(fetchMap(id));
  }

  render() {
    const { error, successMessage } = this.state;
    const { nMap, queueMode, dispatch } = this.props;
    // mapId may be different from params since it may not have been fetched yet...

    const mapId = nMap ? Object.entries(nMap.entities.mapObj)[0][1].id : 0;
    return (
      <div className="container">
        <SweetAlertError
          error={error}
          onConfirm={() => this.setState({ error: undefined })}
        />
        <SweetAlertSuccess
          message={successMessage}
          onConfirm={() => this.setState({ successMessage: undefined })}
        />
        <div className="row">
          <h3 className="display-5">
            {nMap ? nMap.entities.mapObj[mapId].name : "..."}
          </h3>
        </div>
        <div className="row py-1">
          {[
            AssignStorable,
            AddPPS,
            AddCharger,
            AssignDockPoint,
            AssignZone,
            AssignODSExcluded,
            AssignEmergencyBarcode,
            AddBarcode,
            RemoveBarcode,
            ModifyDistanceBwBarcodes
          ].map((Elm, idx) => (
            <div key={idx} className="pr-1 pt-1">
              <Elm onError={e => this.setState({ e })} />
            </div>
          ))}
        <QueueCheckbox val={queueMode} onChange={() => dispatch({type: 'TOGGLE-QUEUE-MODE'})}/>
        </div>
        <div className="row py-1">
          <div className="btn-group" role="group">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() =>
                dispatch(
                  saveMap(
                    error => this.setState({ error }),
                    () =>
                      this.setState({
                        successMessage: "Successfully saved map."
                      })
                  )
                )
              }
            >
              Save
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                dispatch(downloadMap());
              }}
            >
              Download
            </button>
          </div>
        </div>
        <div className="row">
          <MapViewport />
        </div>
      </div>
    );
  }
}
export default connect(state => ({
  nMap: state.normalizedMap,
  queueMode: state.queueMode
}))(Map);
