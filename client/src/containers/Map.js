// main mapcreator page
import React, { Component } from "react";
import MapViewport from "components/Map/MapViewport";
import { connect } from "react-redux";
import { fetchMap, saveMap, downloadMap } from "actions/actions";
import { modifyNeighbours } from "actions/barcode";
import SweetAlertError from "components/SweetAlertError";
import SweetAlertSuccess from "components/SweetAlertSuccess";
import Sidebar from "components/Sidebar/Sidebar";

import AddPPS from "components/Map/Forms/AddPPS";
import AddCharger from "components/Map/Forms/AddCharger";
import AssignDockPoint from "components/Map/Forms/AssignDockPoint";
import AssignStorable from "components/Map/Forms/AssignStorable";
import AddQueueBarcode from "components/Map/Forms/AddQueueBarcode";
import AssignZone from "components/Map/Forms/AssignZone";
import AssignODSExcluded from "components/Map/Forms/AssignODSExcluded";
import AssignEmergencyBarcode from "components/Map/Forms/AssignEmergencyBarcode";
import AddBarcode from "components/Map/Forms/AddBarcode";
import AddFloor from "components/Map/Forms/AddFloor";
import RemoveBarcode from "components/Map/Forms/RemoveBarcode";
import ModifyDistanceBwBarcodes from "components/Map/Forms/ModifyDistanceBwBarcodes";
import BarcodeViewPopup from "components/Map/BarcodeViewPopup";
import ChangeFloorDropdown from "components/Map/Forms/ChangeFloorDropdown";

const QueueCheckbox = ({ val, onChange }) => (
  <label>
    Queue mode:
    <input name="queuemode" type="checkbox" checked={val} onChange={onChange} />
  </label>
);
class Map extends Component {
  state = {
    error: undefined,
    successMessage: undefined,
    barcodeView: {
      show: false,
      tileId: null
    }
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
      <div className="sidebar-wrapper">
        <Sidebar />
        <div className="container content">
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
              AddQueueBarcode,
              ModifyDistanceBwBarcodes,
              AddFloor
            ].map((Elm, idx) => (
              <div key={idx} className="pr-1 pt-1">
                <Elm onError={e => this.setState({ e })} />
              </div>
            ))}
            <QueueCheckbox
              val={queueMode}
              onChange={() => dispatch({ type: "TOGGLE-QUEUE-MODE" })}
            />
          </div>
          <div className="row py-1">
            <ChangeFloorDropdown />
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
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => {
                  dispatch(downloadMap(true));
                }}
              >
                Download as Single Floor
              </button>
            </div>
          </div>
          <div className="row">
            <MapViewport
              onShiftClickOnMapTile={tileId =>
                this.setState({
                  barcodeView: {
                    tileId,
                    show: true
                  }
                })
              }
            />
          </div>
          <BarcodeViewPopup
            show={this.state.barcodeView.show}
            toggle={() =>
              this.setState({
                barcodeView: {
                  ...this.state.barcodeView,
                  show: !this.state.barcodeView.show
                }
              })
            }
            barcode={
              nMap && this.state.barcodeView.tileId
                ? nMap.entities.barcode[this.state.barcodeView.tileId]
                : undefined
            }
            onSubmit={values =>
              dispatch(modifyNeighbours(this.state.barcodeView.tileId, values))
            }
          />
        </div>
      </div>
    );
  }
}
export default connect(state => ({
  nMap: state.normalizedMap,
  queueMode: state.selection.queueMode
}))(Map);
