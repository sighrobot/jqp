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
  const fail = (error) => {
    res.status(500).json({ error, query: req.query });
  };

  const { url, jq: filter, debug } = req.query;

  const missingParams = [];
  if (!url) {
    missingParams.push('url');
  }
  if (missingParams.length > 0) {
    return fail(`missing query parameters: [${missingParams.join(', ')}]`);
  }

  let text;
  try {
    const fetched = await fetch(url);
    text = await fetched.text();
  } catch {
    return fail('fetch failed: check that URL is valid and properly encoded.');
  }

  let json;
  try {
    json = maybeParse(text);
  } catch {
    return fail(
      'parse failed: check that original response is valid JSON or CSV.',
    );
  }

  if (filter) {
    try {
      json = await jq.run(filter, json, {
        input: 'json',
        output: 'json',
      });
    } catch {
      return fail(
        'node-jq failed: check that filter expression is valid and properly encoded.',
      );
    }
  }

  return res
    .status(200)
    .json(
      debug === 'true' ? { version, query: req.query, output: json } : json,
    );
}

module.exports = allowCors(handler);
