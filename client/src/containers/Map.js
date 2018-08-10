// main mapcreator page
import React, { Component } from "react";

// dummy export for now

class Map extends Component {
  state = {
    // mapObj has id, name, createdAt, updatedAt, map
    mapObj: null,
    status: "Loading"
  };
  componentDidMount() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    // fetch the map
    fetch(`/api/map/${id}`)
      .then(res => {
        if (!res.ok) throw Error(res.statusText);
        return res;
      })
      .then(res => {
        this.setState({ status: "Converting..." });
        return res;
      })
      .then(res => res.json())
      .then(mapObj => {
        this.setState({ mapObj, status: "Got map." });
        console.log(JSON.stringify(mapObj));
      })
      .catch(error => console.log(error));
  }

  render() {
    const { mapObj, error, status } = this.state;
    return (
      <div className="container">
        <h3 className="display-5">{status}</h3>
        {mapObj && `Num barcodes: ${mapObj.map.floors[0].map_values.length}`}
        {mapObj && <pre>{}</pre>}
      </div>
    );
  }
}

export default Map;
