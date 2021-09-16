import React, { Component } from "react";
import ButtonForm from "./ButtonForm";
import Select from "react-select";

class BaseForm extends Component {
  state = {
    show: false,
    formData: {},
    multiSchema: {},
    lastKey: 0
  };
  toggle = () => {
    const {
      schema = {...schema},
    } = this.props;
    
    if(!this.state.show) {
      this.setState({multiSchema: {}});
      this.addNewRow(schema.sectorMxUPreferences);
    }
    this.setState({ show: !this.state.show, formData: {} });
  }
  onSubmitHandler = (onSubmit) => {
    var sectorMxUPreferences = {};
    var error = false;
    var message = "";
    Object.keys(this.state.multiSchema).forEach((key) => {
      if(this.state.multiSchema[key].rack_id.value && this.state.multiSchema[key].sectors.value.length > 0) {
        if(sectorMxUPreferences[this.state.multiSchema[key].rack_id.value] == undefined) {
          var sectors = [];
          this.state.multiSchema[key].sectors.value.forEach((val) => {
            sectors.push(parseInt(val.value));
          });
          sectorMxUPreferences[this.state.multiSchema[key].rack_id.value] = sectors;
        } else {
          error = true;
          message = "Cannot have 2 Racks with same name.";  
        }
      } else {
        error = true;
        message = "All fields are required";
      }
    });
    if(!error) {
      onSubmit(sectorMxUPreferences);
      this.toggle();
    } else {
      alert(message);
    }
  };
  addNewRow = (sectorMxUPreferences) => {
    try {
      var multiSchema = {};
      if(Object.keys(sectorMxUPreferences).length > 0) {
        Object.keys(sectorMxUPreferences).forEach((key) => {
          var sectors = [];
          Object.values(sectorMxUPreferences[key]).forEach((val) => {
            sectors.push({label: val.toString(), value: val.toString()});
          });
          multiSchema[Object.keys(multiSchema).length] = {
            rack_id: { type: "string", title: "Rack Type", value: key },
            sectors: { type: "string", title: "Sectors", value: sectors }
          };
        });
      } else {
        multiSchema = {...this.state.multiSchema};
        multiSchema[Object.keys(multiSchema).length] = {
          rack_id: { type: "string", title: "Rack Type", value: "" },
          sectors: { type: "string", title: "Sectors", value: "" }
        };
      }
      this.reAssignKeys(multiSchema);
    } catch(e) {
      alert("Some issue with MxU Preference. Realoding Map!");
      window.location.reload();
    }
  };
  changeHandler = (key, field, value) => {
    var multiSchema = {...this.state.multiSchema};
    if(field == "rack_id") multiSchema[key].rack_id.value = value;
    if(field == "sectors") {
      multiSchema[key].sectors.value = value;
    }
    this.setState({ multiSchema: multiSchema });
  };
  deleteRow = (key) => {
    var multiSchema = {...this.state.multiSchema};
    delete multiSchema[key];
    this.reAssignKeys(multiSchema);
  };
  reAssignKeys = (multiSchema) => {
    var multiSchemaObj = {};
    Object.keys(multiSchema).forEach((key, index) => {
      multiSchemaObj[index] = multiSchema[key];
    });
    this.setState({ multiSchema: multiSchemaObj });
  }
  render() {
    const {
      schema = {...schema},
      onSubmit,
      ...rest
    } = this.props;
    
    const { multiSchema } = this.state;
    var multiRows = [];
    var _this = this;
    const sectorOptions = [];
    schema.properties.sectors.sectors.forEach((val) => {
      var option = {label: val.toString(), value: val};
      sectorOptions.push(option);
    });
    return (
      <ButtonForm {...rest} show={this.state.show} toggle={this.toggle} >
        <form>
          <div>
            <legend id="root__title">{schema.title}</legend>
            <hr />
            <div className="row">
              <div className="col-lg-11 col-md-11 col-sm-11 col-11">
                <div className="form-group field">
                  <div className="row">
                    <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                      Rack Type
                    </div>
                    <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                      Sectors
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {Object.keys(multiSchema).forEach(function(key, index) {
              multiRows.push(<div key={"rack-" + index}>
                <div className="row">
                  <div className="col-lg-11 col-md-11 col-sm-11 col-11">
                    <div className="form-group field">
                      <div className="row">
                        <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                          <input className="form-control" type="text" key={"rack_id" + index} placeholder={"Enter Rack ID"} onChange={(e) => _this.changeHandler(index, "rack_id", e.target.value)} value={multiSchema[index].rack_id.value} />
                        </div>
                        <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                          <Select isMulti={true} value={multiSchema[index].sectors.value} onChange={(selected) => { _this.changeHandler(index, "sectors", selected); }} options={sectorOptions} key={"sectors" + index} placeholder="Select Sectors" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-1 col-md-1 col-sm-1 col-1">
                    <span onClick={() => _this.deleteRow(index)}>x</span>
                  </div>
                </div>
              </div>);
            })}
            {multiRows}
          </div>
          <div>
            <button type="button" onClick={() => this.addNewRow({})} className="btn btn-outline-secondary mr-1">
              Add More Rows
            </button>
            <button type="button" onClick={() => {
              this.onSubmitHandler(onSubmit);
            }} 
            className="btn btn-outline-primary mr-1">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={this.toggle}
            >
              Cancel
            </button>
          </div>
        </form>
      </ButtonForm>
    );
  }
}

export default BaseForm;
