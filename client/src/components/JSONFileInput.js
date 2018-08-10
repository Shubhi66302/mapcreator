// reads a file
import React, { Component } from "react";

class JSONFileInput extends Component {
  state = {
    file: null
  };
  render() {
    const { onRead, onError, onClear = () => {}, idField, label } = this.props;
    const handleFileRead = (content, fileName) => {
      // check if json, if not then call onError
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        onError(`${fileName}: Not a valid JSON file`);
        return;
      }
      onRead(parsed);
    };

    const onChange = event => {
      if (event.target.files.length == 0) {
        // clear the json
        onClear();
        return;
      }
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = e => handleFileRead(e.target.result, file.name);
      reader.readAsText(file);
    };

    return (
      <div className="form-group row justify-content-between">
        <label htmlFor={idField} className="col-form-label col-sm-3">
          {label}
        </label>
        <div className="col-sm-9">
          <input
            type="file"
            className="form-control-file"
            id={idField}
            accept=".json"
            onChange={onChange}
          />
        </div>
      </div>
    );
  }
}

export default JSONFileInput;
