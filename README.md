# jqp

_[in development]_

## Summary

`jqp` is a super simple serverless proxy that lets you request JSON data from a third-party source, filter it using [`node-jq`](https://github.com/sanack/node-jq), and receive the filtered response.

## How to use

Base URL: https://jqp.vercel.app/api/v0

| Query param | Description                                                                                                                                                           | Required |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| `url`       | a [URL-encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) URL (🤯) for a publicly accessible JSON endpoint |    ✔️    |
| `jq`        | a URL-encoded filter expression supported by `node-jq`                                                                                                                |    ✔️    |
| `debug`     | `true` returns a nested response object that includes the values of the passed params above                                                                           |

## Example

```
https://jqp.vercel.app/api/v0?url=https%3A%2F%2Fraw.githubusercontent.com%2Ffanzeyi%2Fpokemon.json%2Fmaster%2Fpokedex.json&jq=%5B.%5B%5D%20%7C%20%7Bname%3A%20.name.english%2C%20hp%3A%20.base.HP%7D%5D
```
