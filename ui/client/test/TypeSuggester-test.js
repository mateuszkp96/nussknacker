import TypeSuggester from '../components/graph/TypeSuggester'

const typesInformation = [
  {
    "clazzName": {"refClazzName": "org.A"},
  },
  {
    "clazzName": {"refClazzName": "org.AA"},
  },
  {
    "clazzName": {"refClazzName": "org.Util"},
  },
  {
    "clazzName": {"refClazzName": "org.Ab"},
  },
  {
    "clazzName": {"refClazzName": "org.Ac"},
  },
  {
    "clazzName": {"refClazzName": "java.math.BigDecimal"},
  },
  {
    "clazzName": {"refClazzName": "java.lang.Byte"},
  },
  {
    "clazzName": {"refClazzName": "scala.runtime.BoxedUnit"},
  },
  {
    "clazzName": {"refClazzName": "java.lang.Boolean"},
  },
  {
    "clazzName": {"refClazzName": "scala.Boolean"},
  },
];

const suggestionsFor = (inputValue) => {
  return new TypeSuggester(typesInformation).suggestionsFor(inputValue)
}

const matchesFor = (inputValue) => {
  return new TypeSuggester(typesInformation).matchesFor(inputValue)
}


describe("type suggester", () => {

  it("should not suggest anything for empty input", () => {
    expect( suggestionsFor("")).toEqual([])
  })

  it("should not suggest anything for wrong input", () => {
    expect( suggestionsFor("wrongType")).toEqual([])
  })

  it("should suggest sorted types for input", () => {
    expect( suggestionsFor("a")).toEqual([
      { clazzName: { refClazzName: 'org.A' } },
      { clazzName: { refClazzName: 'org.AA' } },
      { clazzName: { refClazzName: 'org.Ab' } },
      { clazzName: { refClazzName: 'org.Ac' } },
    ])
  })

  it("should suggest sorted new types for input with duplicate humanReadableType", () => {
    expect(suggestionsFor("b")).toEqual([
      { clazzName: { refClazzName: 'java.math.BigDecimal' } },
      { clazzName: { refClazzName: 'java.lang.Boolean' } },
      { clazzName: { refClazzName: 'scala.Boolean' } },
      { clazzName: { refClazzName: 'scala.runtime.BoxedUnit' } },
      { clazzName: { refClazzName: 'java.lang.Byte' } },
    ])
  })

  it("should return one type for input case insensitive", () => {
    expect(matchesFor("BigDecimal")).toEqual([
      { clazzName: { refClazzName: 'java.math.BigDecimal' } }
    ])
  })

  it("should return one type for input case sensitive", () => {
    expect(matchesFor("bigdecimal")).toEqual([
      { clazzName: { refClazzName: 'java.math.BigDecimal' } }
    ])
  })
})