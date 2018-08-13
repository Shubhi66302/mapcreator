// main mapcreator page
import React, { Component } from "react";
import MapViewport from "components/Map/MapViewport";
import { connect } from "react-redux";
import { fetchMap } from "actions/actions";
import AddPPS from "components/Map/Forms/AddPPS";
import AssignStorable from "components/Map/Forms/AssignStorable";

class Map extends Component {
  componentDidMount() {
    const {
      match: {
        params: { id }
      },
      fetchMap
    } = this.props;
    fetchMap(id);
  }

  render() {
    const { nMap } = this.props;
    // mapId may be different from params since it may not have been fetched yet...

    const mapId = nMap ? Object.entries(nMap.entities.mapObj)[0][1].id : 0;
    return (
      <div className="container">
        <h3 className="display-5">
          {nMap ? nMap.entities.mapObj[mapId].name : "..."}
        </h3>

        <div className="btn-group" role="group">
          <AssignStorable />
          <AddPPS />
        </div>
        <MapViewport />
      </div>
    );
  }
}
export default connect(
  state => ({
    nMap: state.normalizedMap
  }),
  dispatch => ({
    fetchMap: id => dispatch(fetchMap(id))
  })
)(Map);
