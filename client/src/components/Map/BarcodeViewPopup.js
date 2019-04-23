import React, { Component } from "react";
import _ from "lodash";
// import Form from "react-jsonschema-form";
import FormModal from "./Forms/Util/FormModal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const neighbourSchema = Yup.object().shape({
  neighbours: Yup.string().matches(
    /^[01],[01],[01]$/,
    "should be like 0,0,1 etc."
  ),
  sizeInfo: Yup.number()
    .positive()
    .integer("should be a positive integer")
});

const combinedSchema = Yup.object().shape({
  top: neighbourSchema,
  right: neighbourSchema,
  bottom: neighbourSchema,
  left: neighbourSchema
});

const CustomError = props => (
  <ErrorMessage {...props}>
    {msg => <small className="text-danger">{msg}</small>}
  </ErrorMessage>
);

const NeighbourInput = ({ title, fieldKey }) => (
  <div className="form-group">
    <label htmlFor={fieldKey}>{title}</label>
    <Field
      name={`${fieldKey}.neighbours`}
      className="form-control"
      placeholder="Neighbour structure"
    />
    <CustomError name={`${fieldKey}.neighbours`} />
    <Field
      name={`${fieldKey}.sizeInfo`}
      className="form-control"
      placeholder="Size info"
    />
    <CustomError name={`${fieldKey}.sizeInfo`} />
  </div>
);

class BarcodeViewPopup extends Component {
  state = {
    showMore: false
  };
  render() {
    const { show, toggle, barcode, onSubmit } = this.props;
    if (!barcode) return "";
    var initialValuesArr = _.zip(barcode.neighbours, barcode.size_info).map(
      ([nbArr, sizeInfo]) => ({
        neighbours: `${nbArr}`,
        sizeInfo
      })
    );
    var initialValues = _.fromPairs(
      _.zip(["top", "right", "bottom", "left"], initialValuesArr)
    );
    return (
      <div key={1} className="modal fade" tabIndex="-1" role="dialog">
        <FormModal show={show} toggle={toggle} size="lg">
          <Formik
            initialValues={initialValues}
            onSubmit={values => {
              onSubmit(values);
              toggle(false);
            }}
            validationSchema={combinedSchema}
          >
            <Form>
              <h3 className="display-5">Barcode View</h3>
              <div className="container">
                <div className="row">
                  <div className="col col-6 mx-auto">
                    <NeighbourInput title="Top" fieldKey="top" />
                  </div>
                </div>
                <div className="row">
                  <div className="col mx-auto my-auto">
                    <NeighbourInput title="Left" fieldKey="left" />
                  </div>
                  <div className="col pr-0 pl-4">
                    <svg width="200" height="200">
                      <rect
                        width="200"
                        height="200"
                        stroke="black"
                        fill="grey"
                      />
                      <text
                        x="50%"
                        y="50%"
                        alignmentBaseline="middle"
                        textAnchor="middle"
                        fontSize={32}
                      >
                        {barcode.barcode}
                      </text>
                    </svg>
                  </div>
                  <div className="col mx-auto my-auto">
                    <NeighbourInput title="Right" fieldKey="right" />
                  </div>
                </div>
                <div className="row">
                  <div className="col col-6 mx-auto">
                    <NeighbourInput title="Bottom" fieldKey="bottom" />
                  </div>
                </div>
              </div>
              <button
                className="btn btn-primary mx-2"
                type="button"
                onClick={() =>
                  this.setState({ showMore: !this.state.showMore })
                }
              >
                {this.state.showMore ? "Show Less" : "Show More"}
              </button>
              <pre hidden={!this.state.showMore} style={{ paddingTop: "10px" }}>
                {JSON.stringify(barcode, undefined, 2)}
              </pre>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </Form>
          </Formik>
        </FormModal>
      </div>
    );
  }
}

export default BarcodeViewPopup;
