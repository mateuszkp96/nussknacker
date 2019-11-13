import _ from 'lodash';

export default class TypeSuggester {

  constructor(typesInformation){
    this._typesInformation = typesInformation;
    console.log("Types info" + typesInformation)
  }

  suggestionsFor = (inputValue, caretPosition2d) => {
    return this._filterSuggestionsForInput(this._typesInformation, inputValue)
  }

  _filterSuggestionsForInput = (types, inputValue) => {
    return _.filter(types, (type) => {
      // console.log("FILTER")
      // console.log("type:" + type.clazzName.refClazzName.toLowerCase())
      // console.log("input:" + inputValue.toLowerCase())
      return type.clazzName.refClazzName.toLowerCase().includes(inputValue.toLowerCase())
      // return _.includes(type.clazzName.refClazzName.toLowerCase(), inputValue.toLowerCase())
    })
  }
}