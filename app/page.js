'use client';

import React from 'react';
import Link from 'next/link';
import jq from 'jq-web';

import style from './style.module.scss';

const exampleUrl =
  'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json';
const exampleJq = '[.[] | {name: .name.english, hp: .base.HP}]';

const Arrow = <div className={style.arrow}>&darr;</div>;

export default function Page() {
  const [state, setState] = React.useState({
    url: exampleUrl,
    rawJsonString: '',
    jq: exampleJq,
    jqError: '',
    transformedJsonString: '',
    jqpUrl: '',
  });

  const handleChangeInputValue = (e) =>
    setState((s) => ({ ...s, [e.target.name]: e.target.value }));

  const loadRawResponse = async (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams({ url: state.url });
    const fetched = await fetch(`${location.href}api/v0?${searchParams}`);
    const json = await fetched.json();
    setState((s) => ({ ...s, rawJsonString: JSON.stringify(json, null, 2) }));
  };

  const loadTransformedResponse = async (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams({ url: state.url, jq: state.jq });
    const url = `${location.href}api/v0?${searchParams}`;
    let isError = false;
    let text = '';
    try {
      text = await jq.promised.raw(state.rawJsonString, state.jq);
    } catch (e) {
      isError = true;
      text = e.stack;
    }

    setState((s) => ({
      ...s,
      transformedJsonString: isError ? '' : text,
      jqError: isError ? text : '',
      jqpUrl: isError ? '' : url,
    }));
  };

  const handleCopyJqpUrl = () => navigator.clipboard.writeText(state.jqpUrl);

  return (
    <main className={style.main}>
      <header>
        <h1>jqp Playground</h1>
        <div>
          <Link href='https://github.com/sighrobot/jqp' target='_blank'>
            <img src='https://img.shields.io/github/package-json/v/sighrobot/jqp?color=royalblue&style=flat-square' />
          </Link>

          <Link
            href='https://github.com/fiatjaf/awesome-jq#web'
            target='_blank'
          >
            <img
              src='https://awesome.re/mentioned-badge.svg'
              title='Mentioned in Awesome jq'
            />
          </Link>
        </div>
      </header>

      <fieldset style={{ background: '#fef' }}>
        <form className={style.inputButtonLockup} onSubmit={loadRawResponse}>
          <input
            name='url'
            onChange={handleChangeInputValue}
            pattern='https?://.+'
            placeholder='Enter data source URL'
            value={state.url}
          />
          <button disabled={!state.url}>Fetch</button>
        </form>

        <textarea
          disabled={!state.rawJsonString}
          readOnly
          className={style.raw}
          value={state.rawJsonString}
        />

        <legend>Fetch raw data</legend>
      </fieldset>

      {Arrow}

      <fieldset style={{ background: '#eef' }}>
        <form
          className={style.inputButtonLockup}
          onSubmit={loadTransformedResponse}
        >
          <input
            className={style.jq}
            disabled={!state.rawJsonString}
            name='jq'
            onChange={handleChangeInputValue}
            placeholder='Enter jq filter (optional)'
            value={state.jq}
          />
          <button>Transform</button>
        </form>

        <textarea
          className={style.transformed}
          disabled={!state.transformedJsonString}
          readOnly
          value={state.transformedJsonString || state.jqError}
        />

        <legend>
          Transform response with <strong>jq</strong>
        </legend>
      </fieldset>

      {Arrow}

      <fieldset
        disabled={!state.transformedJsonString}
        style={{ background: '#efe' }}
      >
        <div className={style.inputButtonLockup}>
          <input readOnly type='url' value={state.jqpUrl} />
          <button onClick={handleCopyJqpUrl}>Copy</button>
        </div>

        <legend>
          Retrieve your <strong>jqp</strong> API URL
        </legend>
      </fieldset>
    </main>
  );
}
