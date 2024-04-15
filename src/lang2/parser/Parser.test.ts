import assert from "node:assert"
import { test } from "node:test"
import { createLexer } from "./Lexer.js"
import { choose, loop, type ParserResult, type Token } from "./index.js"

type Sexp = string | Array<Sexp>

function parseSexp(tokens: Array<Token>): ParserResult<Sexp> {
  return choose([parseSymbol, parseList])(tokens)
}

function parseSymbol(tokens: Array<Token>): ParserResult<string> {
  const [token] = tokens
  if (token === undefined) {
    throw new Error("[parseSymbol]")
  }

  if (token.label !== "identifier") {
    throw new Error("[parseSymbol]")
  }

  return [token.value, tokens.slice(1)]
}

function parseOpenParenthesis(tokens: Array<Token>): ParserResult<undefined> {
  const token = tokens[0]
  if (token === undefined) {
    throw new Error("[parseOpenParenthesis] 1")
  }

  if (token.label !== "symbol" || token.value !== "(") {
    throw new Error("[parseOpenParenthesis] 2")
  }

  return [undefined, tokens.slice(1)]
}

function parseEndParenthesis(tokens: Array<Token>): ParserResult<undefined> {
  const token = tokens[0]
  if (token === undefined) {
    throw new Error("[parseEndParenthesis] 1")
  }

  if (token.label !== "symbol" || token.value !== ")") {
    throw new Error("[parseEndParenthesis] 2")
  }

  return [undefined, tokens.slice(1)]
}

function parseList(tokens: Array<Token>): ParserResult<Array<Sexp>> {
  return loop(parseSexp, {
    start: parseOpenParenthesis,
    end: parseEndParenthesis,
  })(tokens)
}

const lexer = createLexer({
  identifier: /^\s*([_\p{Letter}][_\p{Letter}0-9]*)\s*/u,
  string: /^\s*("(\\.|[^"])*")\s*/,
  number: /^\s*(\d+\.\d+|\d+|-\d+\.\d+|-\d+)\s*/,
  symbol: /^\s*([^_\p{Letter}0-9\s])\s*/u,
})

test("Parser", () => {
  {
    const tokens = lexer("a")
    assert.deepStrictEqual(parseSexp(tokens), ["a", []])
  }

  {
    const tokens = lexer("(a)")
    assert.deepStrictEqual(parseSexp(tokens), [["a"], []])
  }

  {
    const tokens = lexer("(a b c)")
    assert.deepStrictEqual(parseSexp(tokens), [["a", "b", "c"], []])
  }

  {
    const tokens = lexer("((a b c) (a b c) (a b c))")
    assert.deepStrictEqual(parseSexp(tokens), [
      [
        ["a", "b", "c"],
        ["a", "b", "c"],
        ["a", "b", "c"],
      ],
      [],
    ])
  }
})