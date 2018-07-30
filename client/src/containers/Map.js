// main mapcreator page
import React, { Component } from "react";

// dummy export for now

class Map extends Component {
  state = {
    // mapObj has id, name, createdAt, updatedAt, map
    mapObj: null,
    loading: true
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
      .then(res => res.json())
      .then(mapObj => this.setState({ mapObj, loading: false }))
      .catch(error => console.log(error));
  }

  render() {
    const { mapObj, error } = this.state;
    return (
      <div className="container">
        <h3 className="display-5">
          {mapObj ? `Got map '${mapObj.name}'` : "Loading..."}
        </h3>
      </div>
    );
  }
}

export default Map;
