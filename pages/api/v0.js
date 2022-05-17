const jq = require('node-jq');
const Papa = require('papaparse');

const { version } = require('../../package.json');

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

function maybeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
  }
}

async function handler(req, res) {
  const fail = (error, code = 500) => {
    res.status(code).json({ error, query: req.query });
  };

  const { url, jq: filter, debug } = req.query;

  const missingParams = [];
  if (!url) {
    missingParams.push('url');
  }
  if (missingParams.length > 0) {
    return fail(`missing query parameters: [${missingParams.join(', ')}]`, 400);
  }

  const urls = Array.isArray(url) ? url : [url];

  let texts;
  try {
    const fetched = await Promise.all(urls.map((u) => fetch(u)));
    texts = await Promise.all(fetched.map((f) => f.text()));
  } catch {
    return fail(
      'fetch failed: check that URL(s) are valid and properly encoded.',
    );
  }

  let inputJsons;
  try {
    inputJsons = texts.map(maybeParse);
  } catch {
    return fail(
      'parse failed: check that original response is valid JSON or CSV.',
    );
  }

  let output;
  try {
    output = await jq.run(
      filter ?? '.',
      inputJsons.length > 1 ? inputJsons : inputJsons[0],
      {
        input: 'json',
        output: 'json',
      },
    );
  } catch {
    return fail(
      'node-jq failed: check that filter expression is valid and properly encoded.',
    );
  }

  return res
    .status(200)
    .json(debug === 'true' ? { version, query: req.query, output } : output);
}

module.exports = allowCors(handler);
