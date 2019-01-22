import { spawn } from 'child_process';
import stream from 'string-to-stream';
import strftime from 'strftime';
import uuid from 'uuid/v4';
import fs from 'fs-extra';
import path from 'path';
import _ from 'underscore';
import semaphore from 'semaphore';

import conf from './conf';

const jobsSemaphore = {};

const JOB_DEFAULTS = {
  concurrency: 1,
  timeout: 3600,
  script: '#!/bin/bash\nexit 0\n',
};

export const jobRefDir = jobName => path.resolve(conf.workspace, 'refs', jobName);

export const spawnScript = (script, timeout, stdout, stderr, options = {}) => (
  new Promise((resolve, reject) => {
    const p = spawn('/bin/bash', ['-'], options);
    const expectedCodes = options.expectedCodes || [0];

    const to = setTimeout(() => {
      stderr.write('Script timed out. Killing.\n');
      p.kill();
      reject();
    }, timeout * 1000);

    stream(script).pipe(p.stdin);

    p.stdout.on('data', (data) => {
      stdout.write(data.toString());
    });

    p.stderr.on('data', (data) => {
      stderr.write(data.toString());
    });

    p.on('exit', (code, signal) => {
      stderr.write(`Child process exited with code ${code} and signal ${signal}\n`);
      clearTimeout(to);
      if (_.isEmpty(expectedCodes) || _.any(expectedCodes, expectedCode => code === expectedCode)) {
        resolve();
      }
      reject();
    });

    p.on('error', (err) => {
      stderr.write(`Failed to start process. Error: ${err}\n`);
      clearTimeout(to);
      reject(err);
    });
  })
);


export const spawnJob = (job, eventData) => new Promise((resolve, reject) => {
  const instance = {
    ...JOB_DEFAULTS,
    ...job,
    uuid: uuid(),
    timestamp: strftime('%Y-%m-%d-%H-%M-%S'),
  };

  if (!jobsSemaphore[instance.name]) {
    jobsSemaphore[instance.name] = semaphore(instance.concurrency);
  }
  const instanceBaseName = path.resolve(conf.workspace, instance.uuid);
  let cwd = instanceBaseName;
  if (instance.cwd) {
    cwd = path.resolve(conf.workspace, instance.cwd);
  }
  const logFile = `${instanceBaseName}.log`;
  const statusFile = `${instanceBaseName}.status`;
  const eventFile = `${instanceBaseName}.event`;
  const envFile = `${instanceBaseName}.env`;
  const scriptFile = `${instanceBaseName}.sh`;

  const ref = path.resolve(jobRefDir(instance.name), instance.timestamp);

  const imprint = _.map(
    _.pairs(_.pick(instance, 'name', 'uuid', 'timestamp')),
    pair => `${pair[0]}: ${pair[1]}`,
  ).join('\n');

  const envFromProcess = _.reduce(_.pairs(process.env), (memo, pair) => {
    if (pair[0].match(/^HALLEY_JOB_INSTANCE_/)) {
      return {
        ...memo,
        [pair[0]]: pair[1],
      };
    }
    return memo;
  }, {});

  const env = {
    ..._.pick(process.env, 'HOME', 'HOSTNAME', 'PATH', 'PWD'),
    ...envFromProcess,
    HALLEY_JOB_INSTANCE_UUID: instance.uuid,
    HALLEY_JOB_INSTANCE_TIMESTAMP: instance.timestamp,
    HALLEY_JOB_INSTANCE_NAME: instance.name,
    HALLEY_JOB_INSTANCE_STATUS_FILE: statusFile,
    HALLEY_JOB_INSTANCE_EVENT_FILE: eventFile,
    HALLEY_JOB_INSTANCE_LOG_FILE: logFile,
    HALLEY_JOB_INSTANCE_ENV_FILE: envFile,
    HALLEY_JOB_INSTANCE_SCRIPT_FILE: scriptFile,
    HALLEY_JOB_INSTANCE_RAW_LOG_URL: `${conf.url}/raw/jobrunlog/${instance.uuid}`,
    HALLEY_JOB_INSTANCE_RAW_ENV_URL: `${conf.url}/raw/jobrunenv/${instance.uuid}`,
    HALLEY_JOB_INSTANCE_RAW_EVENT_URL: `${conf.url}/raw/jobrunevent/${instance.uuid}`,
    HALLEY_JOB_INSTANCE_RAW_SCRIPT_URL: `${conf.url}/raw/jobrunscript/${instance.uuid}`,
  };
  const serializedEnv = _.map(_.pairs(env), pair => `${pair[0]}='${pair[1]}'`).sort().join('\n');

  const logStream = fs.createWriteStream(logFile, { mode: 0o644 });
  logStream.write2 = (msg) => {
    console.log(msg.trim());
    logStream.write(`${msg}\n`);
  };

  fs.ensureDir(cwd);
  fs.outputFileSync(ref, instance.uuid);
  fs.outputFileSync(statusFile, 'PENDING');
  fs.outputFileSync(eventFile, JSON.stringify(eventData, null, '  '));
  fs.outputFileSync(scriptFile, instance.script);
  fs.outputFileSync(envFile, serializedEnv);

  logStream.write2(`Spawning job instance:\n${imprint}\n`);

  jobsSemaphore[instance.name].take(() => {
    fs.outputFileSync(statusFile, 'STARTED');
    spawnScript(
      instance.script,
      instance.timeout,
      logStream,
      logStream,
      { cwd, env },
    )
      .then(() => {
        logStream.write2(`SUCCESS:\n${imprint}\n`);
        fs.outputFileSync(statusFile, 'SUCCEEDED');
        jobsSemaphore[instance.name].leave();
        resolve();
      })
      .catch(() => {
        logStream.write2(`FAIL:\n${imprint}\n`);
        fs.outputFileSync(statusFile, 'FAILED');
        jobsSemaphore[instance.name].leave();
        reject();
      });
  });
});
