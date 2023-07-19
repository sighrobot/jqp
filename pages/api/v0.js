const jq = require('jq-web');
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

function makeFetchErrorMsg(isMulti, idx) {
  return `fetch failed: check that ${
    isMulti ? (idx !== undefined ? `url[${idx}]` : 'each url') : 'url'
  } is valid and properly encoded.`;
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
  const isMulti = urls.length > 1;

  let texts;
  try {
    const fetched = await Promise.all(urls.map((u) => fetch(u)));

    fetched.forEach((f, idx) => {
      if (f.status < 200 || f.status >= 400) {
        return fail(makeFetchErrorMsg(isMulti, idx));
      }
    });

    texts = await Promise.all(fetched.map((f) => f.text()));
  } catch {
    return fail(makeFetchErrorMsg(isMulti));
  }

  function maybeParse(text, idx) {
    try {
      try {
        return JSON.parse(text);
      } catch {
        return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
      }
    } catch {
      return fail(
        `parse failed: check that response from ${
          isMulti ? `url[${idx}]` : 'url'
        } is valid JSON or CSV.`,
      );
    }
  }

  let inputJsons;
  inputJsons = texts.map(maybeParse);

  let output;
  try {
    output = await jq.promised.json(
      isMulti ? inputJsons : inputJsons[0],
      filter ?? '.',
    );
  } catch (e) {
    return fail(e.stack.replace(/\n/g, ' '));
  }

  return res
    .status(200)
    .json(debug === 'true' ? { version, query: req.query, output } : output);
}

module.exports = allowCors(handler);
