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
import {v4 as uuid4} from "uuid";

class TypeSuggest extends React.Component {

  static propTypes = {
    inputProps: PropTypes.object.isRequired,
    fieldName: PropTypes.string,
    validators: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      uid: uuid4(),
      value: ProcessUtils.humanReadableType(props.inputProps.refClazzName),
      refClazzName: props.inputProps.refClazzName
    };
    this.typeSuggester = new TypeSuggester(props.typesInformation);
  }

  onChange = (newValue) => {
    newValue = newValue.replace(/(\r\n|\n|\r)/gm, ""); // remove new line char to disable multiline input
    const newRefClazzName = this.refClazzForValue(newValue)
    this.setState( {
      value: newValue,
      refClazzName: newRefClazzName
    })
    // TODO we shouldn't set refClazzName but only humanReadableType such String, this should be moved to BE (class TypingUtils)
    this.props.inputProps.onValueChange({typ: {refClazzName: newRefClazzName}})
  }

  refClazzForValue = (newValue) => {
    const typesMatchedForValue = this.typeSuggester.matchesFor(newValue);
    return typesMatchedForValue.length === 1 ? typesMatchedForValue.head.clazzName.refClazzName : null
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(_.isEqual(this.state.value, nextState.value) && !_.isEqual(this.state.refClazzName, nextState.refClazzName))
  }

  componentDidUpdate(prevProps, prevState) {
    this.typeSuggester = new TypeSuggester(this.props.typesInformation)

    if (!_.isEqual(this.state.value, prevState.value) && !_.isEqual(this.state.refClazzName, prevState.refClazzName)) {
      this.props.inputProps.onValueChange({typ: {refClazzName: this.state.refClazzName}})
    }
  }

  customAceEditorCompleter = {
    getCompletions: (editor, session, caretPosition2d, prefix, callback) => {
      const suggestions = this.typeSuggester.suggestionsFor(this.state.value, caretPosition2d)
      callback(null, _.map(suggestions, (s) => {
        const refClazzName = s.clazzName.refClazzName
        const fieldType = ProcessUtils.humanReadableType(refClazzName)
        return {
          name: fieldType,
          value: fieldType,
          returnType: refClazzName,
          score: suggestions.length - suggestions.indexOf(s), // suggestions are sorted ascending, those with the highest score are first
        }
      }))
    }
  }

  render() {
    const {isMarked, inputProps, validators} = this.props
    if (this.props.dataResolved) {
      return (
        <div>
          <div className={"row-ace-editor" + (allValid(validators, this.state.value) ? "" : " node-input-with-error ") + (isMarked ? " marked" : "")}>
            <AceEditor
              placeholder="Type"
              width={"100%"}
              maxLines={1}
              theme={'nussknacker'}
              onChange={this.onChange}
              value={this.state.value}
              showPrintMargin={false}
              cursorStart={-1} //line start
              showGutter={false}
              highlightActiveLine={false}
              newLineMode={false}
              editorProps={{
                $blockScrolling: "Infinity"
              }}
              setOptions={{
                indentedSoftWrap: false, //removes weird spaces for multiline strings when wrapEnabled=true
                enableBasicAutocompletion: [this.customAceEditorCompleter],
                enableLiveAutocompletion: true,
                enableSnippets: false,
                showLineNumbers: false,
                fontSize: 16,
                fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace", //monospace font seems to be mandatory to make ace cursor work well,
                readOnly: inputProps.readOnly
              }}
            />
          </div>
          <ValidationLabels validators={validators} values={[this.state.value]}/>
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