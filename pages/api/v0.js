const jq = require('node-jq');

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
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

async function handler(req, res) {
  const { url, jq: filter, debug } = req.query;

  const missingParams = [];

  if (!url) {
    missingParams.push('url');
  }

  if (!filter) {
    missingParams.push('jq');
  }

  if (missingParams.length > 0) {
    return res.status(500).json({
      error: `Missing query parameters: [${missingParams.join(', ')}]`,
    });
  }

  const fetched = await fetch(url);
  const rawJSON = await fetched.json();

  let filteredJSON = {};

  try {
    filteredJSON = await jq.run(filter, rawJSON, {
      input: 'json',
      output: 'json',
    });
  } catch (error) {
    res.status(500).json({
      query: { url, jq: filter },
      error: 'jq failed: check that the filter expression is well-formed.',
    });
  }

  const payload =
    debug === 'true'
      ? { query: { url, jq: filter }, output: filteredJSON }
      : filteredJSON;

  res.status(200).json(payload);
}

module.exports = allowCors(handler);
