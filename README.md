# jqp ![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/sighrobot/jqp?color=royalblue&style=flat-square) [![Mentioned in Awesome jq](https://awesome.re/mentioned-badge.svg)](https://github.com/fiatjaf/awesome-jq)

[**jqp** is a free serverless proxy](https://jqp.vercel.app/api/v0) that lets you request data from remote sources, filter it using [jq-web](https://github.com/fiatjaf/jq-web), and receive the filtered response.

## How to use

| Query param | Description                                                                                                                                                                       | Required |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| `url`       | a [URL-encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) URL (🤯) for a publicly accessible JSON endpoint or CSV file |    ✔️    |
| `jq`        | a URL-encoded filter expression supported by jq-web                                                                                                                               |          |
| `debug`     | `true` returns a nested response object that includes the values of the passed params above                                                                                       |

jqp will first assume that the response body is JSON. If parsing fails, it will assume that the response body is CSV and attempt to parse it into JSON.

> Note: _Each row of CSV data will be parsed into an object of values keyed by field name._

> Note: _To fetch multiple files, the `url` parameter can be used more than once. The responses are made available to jq-web as an array, and can be referenced in the same order as their respective `url` parameters, e.g. `.[0]`, `.[1]`, etc._

## Examples

### Transform JSON response

| Query param | Unencoded value                                                            |
| ----------- | :------------------------------------------------------------------------- |
| `url`       | https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json |
| `jq`        | `[.[] \| {name: .name.english, hp: .base.HP}]`                             |

API request URL: https://jqp.vercel.app/api/v0?url=https%3A%2F%2Fraw.githubusercontent.com%2Ffanzeyi%2Fpokemon.json%2Fmaster%2Fpokedex.json&jq=%5B.%5B%5D%20%7C%20%7Bname%3A%20.name.english%2C%20hp%3A%20.base.HP%7D%5D

### Convert CSV response to JSON

| Query param | Unencoded value                                                                                                                        |
| ----------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `url`       | https://gist.githubusercontent.com/armgilles/194bcff35001e7eb53a2a8b441e8b2c6/raw/92200bc0a673d5ce2110aaad4544ed6c4010f687/pokemon.csv |

API request URL: https://jqp.vercel.app/api/v0?url=https%3A%2F%2Fgist.githubusercontent.com%2Farmgilles%2F194bcff35001e7eb53a2a8b441e8b2c6%2Fraw%2F92200bc0a673d5ce2110aaad4544ed6c4010f687%2Fpokemon.csv
