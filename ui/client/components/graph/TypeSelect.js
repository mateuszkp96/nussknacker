import React from 'react'
import PropTypes from "prop-types";
import _ from "lodash";
import ProcessUtils from "../../common/ProcessUtils";
import ActionsUtils from "../../actions/ActionsUtils";
import {connect} from 'react-redux'

import 'brace/mode/jsx';

import 'brace/ext/searchbox';
import '../../brace/mode/spel'
import '../../brace/mode/sql'
import '../../brace/theme/nussknacker'
import ValidationLabels from "../modals/ValidationLabels";
import {allValid} from "../../common/Validators";
import {v4 as uuid4} from "uuid";
import Select from "react-select"

class TypeSelect extends React.Component {

  static propTypes = {
    onValueChange: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    refClazzName: PropTypes.string.isRequired,
    validators: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      uid: uuid4(),
    };
    this.options = this.getOptions(props.typesInformation)
    this.defaultOption = _.head(this.options)
  }

  getOptions = (values) => {
    const mappedValues = _.map(values,(value) => ({
      value: value.clazzName.refClazzName,
      label: ProcessUtils.humanReadableType(value.clazzName.refClazzName)
    }))

    return _.orderBy(mappedValues, (item) => [item.label, item.value], ["asc"]);
  };

  currentOption = (refClazzName) => {
    return this.options.find((option) => option.value === refClazzName) || this.defaultOption
  };

  handleChange = (newValue) => {
    const refClazzName = _.get(newValue, 'value')

    // TODO we shouldn't set refClazzName but only humanReadableType such String, this should be moved to BE (class TypingUtils)
    this.props.onValueChange({typ: {refClazzName: refClazzName}})
  };

  render() {
    const {dataResolved, readOnly, refClazzName, validators} = this.props
    const option = this.currentOption(refClazzName)
    if (dataResolved) {
      return (
        <div>
          <div className={(allValid(validators, option.value) ? "" : "node-input-with-error ")}>
            <Select
              className="node-value node-value-select"
              classNamePrefix="node-value-select"
              onChange={this.handleChange}
              options={this.options}
              value={option}
              disabled={readOnly}
            />
          </div>
          <ValidationLabels validators={validators} values={[option.value]}/>
        </div>
      )
    }
  }
}

function mapState(state, props) {
  const processDefinitionData = !_.isEmpty(state.settings.processDefinitionData) ? state.settings.processDefinitionData : {processDefinition: { typesInformation: []}}
  const dataResolved = !_.isEmpty(state.settings.processDefinitionData)
  const typesInformation = processDefinitionData.processDefinition.typesInformation
  const variablesForNode = state.graphReducer.nodeToDisplay.id || _.get(state.graphReducer, ".edgeToDisplay.to") || null
  const variables = ProcessUtils.findAvailableVariables(variablesForNode, state.graphReducer.processToDisplay, processDefinitionData.processDefinition, props.fieldName)

  return {
    typesInformation: typesInformation,
    dataResolved: dataResolved,
    variables: variables
  };
}
export default connect(mapState, ActionsUtils.mapDispatchWithEspActions)(TypeSelect);