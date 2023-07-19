import { NextResponse } from 'next/server';
import jq from 'jq-web';
import Papa from 'papaparse';

const { version } = require('../../../package.json');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function makeFetchErrorMsg(isMulti, idx) {
  return `fetch failed: check that ${
    isMulti ? (idx !== undefined ? `url[${idx}]` : 'each url') : 'url'
  } is valid and properly encoded.`;
}

export async function GET(req) {
  const query = Object.fromEntries(req.nextUrl.searchParams);

  const fail = (error, code = 500) =>
    NextResponse.json(
      { error, query },
      { status: code, headers: CORS_HEADERS },
    );

  const { url, jq: filter, debug } = query;

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

  return NextResponse.json(
    debug === 'true' ? { version, query, output } : output,
    { status: 200, headers: CORS_HEADERS },
  );
}
