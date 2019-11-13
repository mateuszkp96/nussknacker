import React from 'react'
import PropTypes from "prop-types";
import AceEditor from 'react-ace';
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
import TypeSuggester from "./TypeSuggester";

var inputExprIdCounter = 0;
class TypeSuggest extends React.Component {

  static propTypes = {
    inputProps: PropTypes.object.isRequired,
    fieldName: PropTypes.string,
    validators: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);
    inputExprIdCounter+=1;
    this.state = {
      value: props.inputProps.value,
      id: "inputExpr" + inputExprIdCounter
    };
    this.typeSuggester = this.createTypeSuggester(props)
  }

  createTypeSuggester = (props) => {
    return new TypeSuggester(props.typesInformation);
  }

  onChange = (newValue) => {
    this.setState({
      value: newValue
    })
    this.props.inputProps.onValueChange({typ: {refClazzName: newValue}})
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(_.isEqual(this.state.value, nextState.value))
  }

  componentDidUpdate(prevProps, prevState) {
    this.typeSuggester = this.createTypeSuggester(this.props)

    if (!_.isEqual(this.state.value, prevState.value)) {
      this.props.inputProps.onValueChange({typ: {refClazzName: this.state.value}})
    }
  }

  customAceEditorCompleter = {
    getCompletions: (editor, session, caretPosition2d, prefix, callback) => {
      const suggestions = this.typeSuggester.suggestionsFor(this.state.value, caretPosition2d)
      callback(null, _.map(suggestions, (s) => {
        const returnType = ProcessUtils.humanReadableType(s.clazzName.refClazzName)
        const fieldType = s.clazzName.refClazzName
        return {
          name: returnType,
          value: returnType,
          meta: returnType,
          score: 1
        }

        // return {name: "a", value: returnType, score: 1, meta: s.clazzName.refClazzName, description: "d", parameters: "e", returnType: "f"}
      }))
    }
  }

  render() {
    const {isMarked} = this.props
    if (this.props.dataResolved) {
      return (
        <div>
          <div style={{paddingTop: 10,
                       paddingBottom: 10,
                       paddingLeft: 20 - 4,
                       paddingRight: 20 - 4,
                       backgroundColor: '#333',
                       borderBottom: '1px solid #808080'}}
               className={(allValid(this.props.validators, this.state.value) ? "" : "node-input-with-error ") + (isMarked ? " marked" : "")}>
            <AceEditor
              className="ace-editor-type"
              placeholder="Type"
              width={"100%"}
              minLines={1}
              maxLines={1}
              theme={'nussknacker'}
              onChange={this.onChange}
              value={this.state.value}
              showPrintMargin={false}
              cursorStart={-1} //line start
              showGutter={false}
              highlightActiveLine={false}
              wrapEnabled={true}
              editorProps={{ $blockScrolling: true }}
              setOptions={{
                enableBasicAutocompletion: [this.customAceEditorCompleter],
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: false,
                fontSize: 16,
                fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace", //monospace font seems to be mandatory to make ace cursor work well,
                readOnly: this.props.inputProps.readOnly
              }}
            />
          </div>
          <ValidationLabels validators={this.props.validators} values={[this.state.value]}/>
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


export default connect(mapState, ActionsUtils.mapDispatchWithEspActions)(TypeSuggest);