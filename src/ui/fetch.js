import fetch from 'node-fetch';
import _ from 'underscore';

export const safeParseJSON = res => res.text().then((text) => {
  console.log(`Trying to parse response body: ${text}`);
  try {
    return JSON.parse(text);
  } catch (err) {
    console.log(`Error occured while parsing json: ${text} err: ${err}`);
    return {};
  }
});

export const get = (url, headers = {}, parseResponseBody = true) => {
  const options = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    redirect: 'manual',
  };
  _(options.headers).assign(headers);
  console.log(`Sending request to url: ${url}, options: ${JSON.stringify(options)}`);
  return fetch(url, options)
    .then(res => (parseResponseBody ? safeParseJSON(res) : res));
};

export const post = (url, body, headers = {}, parseResponseBody = true) => {
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(body),
    redirect: 'manual',
  };
  _(options.headers).assign(headers);
  console.log(`Sending request to url: ${url}, options: ${JSON.stringify(options)}`);
  return fetch(url, options)
    .then((res) => {
      const result = (parseResponseBody ? safeParseJSON(res) : res);
      console.log(`Response received from url: ${url}, response: ${result}`);
      return result;
    });
};

export default get;
