// main mapcreator page
import React, { Component } from "react";
import MapViewport from "components/Map/MapViewport";
import { connect } from "react-redux";
import { fetchMap, saveMap, downloadMap } from "actions/actions";
import { modifyNeighbours } from "actions/barcode";
import {
  setSuccessMessage,
  clearSuccessMessage,
  setErrorMessage,
  clearErrorMessage
} from "actions/message";
import SweetAlertError from "components/SweetAlertError";
import SweetAlertSuccess from "components/SweetAlertSuccess";

import LeftSidebar from "components/Map/Sidebar/LeftSidebar";
import RightSidebar from "components/Map/Sidebar/RightSidebar";
import BarcodeViewPopup from "components/Map/BarcodeViewPopup";
import ChangeFloorDropdown from "components/Map/Forms/ChangeFloorDropdown";
import CopyMap from "components/Map/Forms/CopyMap";
import DeleteMap from "components/Map/Forms/DeleteMap";
import SampleRacksJson from "components/Map/SampleRacksJson";

class Map extends Component {
  state = {
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
    const {
      nMap,
      dispatch,
      errorMessage,
      successMessage,
      queueMode,
      zoneViewMode,
      directionViewMode
    } = this.props;

    // mapId may be different from params since it may not have been fetched yet...

    const mapId = nMap ? Object.entries(nMap.entities.mapObj)[0][1].id : 0;
    return (
      <div>
        <div style={{ float: "left" }}>
          <div className="container content">
            <SweetAlertError
              error={errorMessage}
              onConfirm={() => dispatch(clearErrorMessage())}
            />
            <SweetAlertSuccess
              message={successMessage}
              onConfirm={() => dispatch(clearSuccessMessage())}
            />
            <div className="row justify-content-between">
              <div className="col">
                <h3 className="display-5">
                  {nMap ? nMap.entities.mapObj[mapId].name : "..."}
                </h3>
              </div>
              <div className="col">
                <div className="float-right">
                  <SampleRacksJson />
                  <DeleteMap />
                </div>
              </div>
            </div>
            <LeftSidebar />
            <RightSidebar
              dispatch={dispatch}
              queueMode={queueMode}
              zoneViewMode={zoneViewMode}
              directionViewMode={directionViewMode}
            />
            <div className="row py-1">
              <div className="btn-group col" role="group">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  style={{ textAlign: "-webkit-center", color: "grey" }}
                  onClick={() =>
                    dispatch(
                      saveMap(
                        error => dispatch(setErrorMessage(error)),
                        () =>
                          dispatch(setSuccessMessage("Successfully saved map."))
                      )
                    )
                  }
                >
                  Save
                </button>
                <CopyMap />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  bcolor="orange"
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
              <div className="col float-right">
                <ChangeFloorDropdown />
              </div>
            </div>
          </div>
          <div className="row" id="pixi-canvas-wrapper">
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
  queueMode: state.selection.queueMode,
  successMessage: state.successMessage,
  errorMessage: state.errorMessage,
  zoneViewMode: state.selection.zoneViewMode,
  directionViewMode: state.selection.directionViewMode
}))(Map);
