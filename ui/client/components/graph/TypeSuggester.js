import _ from 'lodash';
import ProcessUtils from "../../common/ProcessUtils";

export default class TypeSuggester {

  constructor(typesInformation){
    this.typesInformation = typesInformation;
  }

  suggestionsFor = (inputValue) => {
    if (_.isEmpty(inputValue)){
      return []
    }
    const filteredSuggestions = this.filterSuggestionsForInput(inputValue);
    return _.orderBy(filteredSuggestions, (item) => [ProcessUtils.humanReadableType(item.clazzName.refClazzName), item.clazzName.refClazzName]
    ,["asc"]);
  }

  filterSuggestionsForInput = (inputValue) => {
    return _.filter(this.typesInformation, (item) => {
      const humanReadableType = ProcessUtils.humanReadableType(item.clazzName.refClazzName).toLowerCase()
      return _.startsWith(humanReadableType, inputValue.toLowerCase(), 0);
    })
  }

  matchesFor = (inputValue) => {
    return  _.filter(this.typesInformation, (item) => {
      const humanReadableType = ProcessUtils.humanReadableType(item.clazzName.refClazzName).toLowerCase()
      return _.isEqual(inputValue.toLowerCase(), humanReadableType)
    })
  }
}