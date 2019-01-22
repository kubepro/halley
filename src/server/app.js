import express from 'express';
import bodyParser from 'body-parser';
import _ from 'underscore';
import l from 'lodash';
import yaml from 'js-yaml';
import fs from 'fs-extra';
import crypto from 'crypto';
import bufferEq from 'buffer-equal-constant-time';
import path from 'path';
import cryptoToken from 'crypto-token';
import streams from 'memory-streams';

import conf from './conf';
import { spawnJob, jobRefDir, spawnScript } from './spawn';

console.log(`Ensuring workspace directory ${conf.workspace}`);
fs.ensureDir(conf.workspace);

let jobsConf = [];
let appsConf = [];

const readJobs = () => {
  console.log(`Reading jobs configuration file: ${conf.jobsFile}`);
  fs.readFile(conf.jobsFile, 'utf8')
    .then(raw => yaml.safeLoad(raw))
    .then((data) => {
      jobsConf = data;
      console.log(`Configured jobs: ${JSON.stringify(jobsConf)}`);
    })
    .catch(err => console.log(`Error while reading jobs config file: ${err}`));
};

readJobs();
if (conf.jobsFileReadInterval) {
  setInterval(readJobs, conf.jobsFileReadInterval);
}

// FIXME Remove duplication code, instead put everything in a single file
const readApps = () => {
  console.log(`Reading apps configuration file: ${conf.appsFile}`);
  fs.readFile(conf.appsFile, 'utf8')
    .then(raw => yaml.safeLoad(raw))
    .then((data) => {
      appsConf = data;
      console.log(`Configured apps: ${JSON.stringify(appsConf)}`);
    })
    .catch(err => console.log(`Error while reading apps config file: ${err}`));
};

readApps();
if (conf.appsFileReadInterval) {
  setInterval(readApps, conf.appsFileReadInterval);
}

const cleanupArtifacts = () => {
  _.each(jobsConf, (jobDef) => {
    console.log(`Cleaning up artifacts for job: ${jobDef.name}`);
    const refDir = jobRefDir(jobDef.name);
    fs.readdir(refDir)
      .then(refs => _.each(refs.sort().reverse().slice(conf.cleanupArtifactsNumber), (ref) => {
        fs.readFile(path.resolve(refDir, ref), 'utf8')
          .then(uuid => Promise.all(_.map(['', '.log', '.event', '.status', '.env', '.sh'], suffix => (
            fs.remove(path.resolve(conf.workspace, uuid + suffix))))))
          .then(() => fs.remove(path.resolve(refDir, ref)));
      }))
      .catch(err => console.log(`Error while reading refs directory: ${refDir}: ${err}`));
  });
};

if (conf.cleanupArtifactsInterval) {
  setInterval(cleanupArtifacts, conf.cleanupArtifactsInterval);
}

const tokenStore = {};

export const checkAuth = (req, res, next) => {
  if (req.url.match(/\/(assets|raw)\/.+/) || req.url === '/auth' || req.url === '/') {
    // permissive
  } else if (req.url.match(/\/webhook.*/)) {
    try {
      const hook = {
        event: req.headers['x-github-event'],
        delivery: req.headers['x-github-delivery'],
        signature: req.headers['x-hub-signature'] || '',
        payload: req.body,
      };
      console.log(`Hook received: ${JSON.stringify(hook)}`);

      const calculatedSignature = `sha1=${crypto.createHmac('sha1', conf.token).update(JSON.stringify(hook.payload)).digest('hex')}`;
      console.log(`Calculated signature: ${calculatedSignature}`);
      console.log(`Hook signature:       ${hook.signature}`);

      if (!bufferEq(Buffer.from(calculatedSignature), Buffer.from(req.headers['x-hub-signature']))) {
        console.log('Wrong webhook signature');
        return res.status(403).send({ status: 403, message: 'Wrong hook token' }).end();
      }
    } catch (err) {
      console.log(`Error while checking webhook signature: ${err}`);
      return res.status(500).send({ status: 500, message: 'Internal error' }).end();
    }
  } else {
    console.log(`Checking request auth token for ${req.url}`);
    const token = req.headers['x-http-auth'];
    if (!token || !tokenStore[token]) {
      console.log(`Wrong token: ${token}`);
      return res.status(403).send({ status: 403, message: 'Permission denied' }).end();
    }
    if (tokenStore[token].expired) {
      console.log(`Token expired: ${token}`);
      return res.status(403).send({ status: 403, message: 'Expired token' }).end();
    }
    console.log(`Valid token: ${token}`);
  }
  next();
};

const app = express();
app.use(bodyParser.json());
app.use(checkAuth);
app.set('views', './src/server/views');
app.set('view engine', 'pug');
app.use(express.static('static'));

const getMatchingJobs = hook => _.compact(_.map(jobsConf, (job) => {
  if (job.triggers &&
    _.any(job.triggers, t => hook.event === t.type && l.isMatch(hook.payload, t.filter))) {
    return job;
  } else if (hook.event === job.type && l.isMatch(hook.payload, job.filter)) {
    return job;
  }
  return null;
}));

app.post('/webhook', (req, res) => {
  const hook = {
    event: req.headers['x-github-event'],
    delivery: req.headers['x-github-delivery'],
    signature: req.headers['x-hub-signature'] || '',
    payload: req.body,
  };
  const matchingJobs = getMatchingJobs(hook);
  console.log(`Matching jobs: ${JSON.stringify(_.map(matchingJobs, job => job.name))}`);
  _.map(matchingJobs, (job) => {
    spawnJob(job, hook).catch(() => null);
  });

  res.status(200).send('OK\n');
});

app.post('/api/jobtrigger/name/:jobName', (req, res) => {
  const hook = {
    event: null,
    delivery: null,
    signature: null,
    payload: req.body,
  };
  console.log(`Job triggered: ${req.params.jobName}`);
  _.map(_.select(jobsConf, job => job.name === req.params.jobName), (job) => {
    spawnJob(job, hook).catch(() => null);
  });

  res.status(200).send({ status: 200, message: 'OK' });
});

app.get('/api/jobs', (req, res) => {
  res.status(200).send({ status: 200, jobs: jobsConf });
});

app.get('/api/jobdefinition/:jobName', (req, res) => {
  res.status(200).send({
    status: 200,
    name: req.params.jobName,
    definition: _.filter(jobsConf, job => job.name === req.params.jobName)[0],
  });
});

app.get('/api/jobrefs/:jobName', (req, res) => {
  const resBody = {
    name: req.params.jobName,
    refs: {},
  };
  const refDir = jobRefDir(req.params.jobName);

  if (!fs.pathExistsSync(refDir)) return res.status(200).send({ status: 200, ...resBody });

  const refs = fs.readdirSync(refDir).sort().reverse().slice(0, 20);

  return Promise.all(_.map(refs, ref => new Promise((resolve) => {
    const refFile = path.resolve(refDir, ref);
    fs.readFile(refFile, 'utf8')
      .then((uuid) => {
        const statusFile = path.resolve(conf.workspace, `${uuid}.status`);
        fs.readFile(statusFile, 'utf8')
          .then(status => resolve({ [ref]: { uuid, status } }))
          .catch((err) => {
            console.log(`Error while reading status file: ${statusFile} err: ${err}`);
            resolve({ [ref]: { uuid, status: 'UNKNOWN' } });
          });
      })
      .catch((err) => {
        console.log(`Error while reading ref file: ${refFile} err: ${err}`);
        resolve();
      });
  })))
    .then(resolvedRefs => _.compact(resolvedRefs).map(rr => _.assign(resBody.refs, rr)))
    .then(() => res.status(200).send({ status: 200, ...resBody }));
});

app.get('/api/jobrunstatus/:jobUuid', (req, res) => {
  fs.readFile(path.resolve(conf.workspace, `${req.params.jobUuid}.status`), 'utf8')
    .then(status => res.status(200).send({ uuid: req.params.jobUuid, status }));
});

app.get('/api/jobrunlog/:jobUuid', (req, res) => {
  fs.readFile(path.resolve(conf.workspace, `${req.params.jobUuid}.log`), 'utf8')
    .then(log => res.status(200).send({ status: 200, uuid: req.params.jobUuid, log }));
});

app.get('/api/jobrunevent/:jobUuid', (req, res) => {
  const eventFile = path.resolve(conf.workspace, `${req.params.jobUuid}.event`);
  fs.readFile(eventFile, 'utf8')
    .then(event => res.status(200).send({ status: 200, uuid: req.params.jobUuid, event }))
    .catch((err) => {
      console.log(`Error while reading file: ${eventFile} error: ${err}`);
      res.status(404).send({ status: 404, message: 'Event not found' });
    });
});

app.get('/api/jobrunenv/:jobUuid', (req, res) => {
  const envFile = path.resolve(conf.workspace, `${req.params.jobUuid}.env`);
  fs.readFile(envFile, 'utf8')
    .then(env => res.status(200).send({ status: 200, uuid: req.params.jobUuid, env }))
    .catch((err) => {
      console.log(`Error while reading file: ${envFile} error: ${err}`);
      res.status(404).send({ status: 404, message: 'Env not found' });
    });
});

app.get('/api/jobrunscript/:jobUuid', (req, res) => {
  const scriptFile = path.resolve(conf.workspace, `${req.params.jobUuid}.sh`);
  fs.readFile(scriptFile, 'utf8')
    .then(script => res.status(200).send({ status: 200, uuid: req.params.jobUuid, script }))
    .catch((err) => {
      console.log(`Error while reading file: ${scriptFile} error: ${err}`);
      res.status(404).send({ status: 404, message: 'Script not found' });
    });
});

app.get('/api/apps', (req, res) => {
  res.status(200).send({ status: 200, apps: appsConf });
});

app.get('/api/appenvs/:appName', (req, res) => {
  const resBody = { app: req.params.appName, envs: {} };
  const appPath = path.resolve(
    conf.workspace, _.where(appsConf, { name: req.params.appName })[0].path);
  if (!fs.pathExistsSync(appPath)) return res.status(200).send({ status: 200, ...resBody });

  const script = 'ks env list -o json';
  const parseKsEnvList =
      envList => _.reduce(envList.data, (memo, item) => ({ ...memo, [item.name]: item }), {});

  const stdout = new streams.WritableStream();
  const stderr = new streams.WritableStream();

  spawnScript(script, 10, stdout, stderr, { cwd: appPath })
    .then(() => parseKsEnvList(JSON.parse(stdout.toString())))
    .then(envs => res.status(200).send({ ...resBody, status: 200, envs }));
});

app.get('/api/appcomponents/:appName', (req, res) => {
  const resBody = { name: req.params.appName, components: {} };
  const appPath = path.resolve(
    conf.workspace, _.where(appsConf, { name: req.params.appName })[0].path);
  if (!fs.pathExistsSync(appPath)) return res.status(200).send({ status: 200, ...resBody });

  const script = 'ks component list -o json';
  const parseKsComponentList =
      componentList => _.reduce(
        componentList.data, (memo, item) => ({ ...memo, [item.component]: {} }), {});

  const stdout = new streams.WritableStream();
  const stderr = new streams.WritableStream();

  spawnScript(script, 10, stdout, stderr, { cwd: appPath })
    .then(() => parseKsComponentList(JSON.parse(stdout.toString())))
    .then(components => res.status(200).send({ ...resBody, status: 200, components }));
});

app.get('/api/appenvparams/:appName/:appEnv', (req, res) => {
  const resBody = {
    app: req.params.appName,
    env: req.params.appEnv,
    params: {},
  };
  const appPath = path.resolve(
    conf.workspace, _.where(appsConf, { name: req.params.appName })[0].path);
  if (!fs.pathExistsSync(appPath)) return res.status(200).send({ status: 200, ...resBody });

  const script = `ks param list --env ${req.params.appEnv} -o json`;
  const parseKsParamList =
    paramList => _.reduce(
      paramList.data, (memo, item) => ({
        ...memo,
        [item.component]: {
          ...memo[item.component],
          [item.param]: item.value.replace(/\'/g, ''),
        },
      }), {});

  const stdout = new streams.WritableStream();
  const stderr = new streams.WritableStream();

  spawnScript(script, 10, stdout, stderr, { cwd: appPath })
    .then(() => res
      .status(200)
      .send({
        ...resBody,
        status: 200,
        params: JSON.stringify(parseKsParamList(JSON.parse(stdout.toString()))),
      }));
});

app.post('/api/appenvparams/:appName/:appEnv', (req, res) => {
  const resBody = {
    app: req.params.appName,
    env: req.params.appEnv,
  };
  const appPath = path.resolve(
    conf.workspace, _.where(appsConf, { name: req.params.appName })[0].path);
  if (!fs.pathExistsSync(appPath)) return res.status(200).send({ status: 200, ...resBody });

  const script = _.reduce(
    _.pairs(req.body),
    (totalUpdateScript, componentPair) => {
      const component = componentPair[0];
      const subscript = _.reduce(
        _.pairs(componentPair[1]),
        (componentUpdateScript, paramPair) => {
          const param = paramPair[0];
          const value = paramPair[1];
          return `${componentUpdateScript}ks param set ${component} ${param} ${value} --env ${req.params.appEnv}\n`;
        },
        '',
      );
      return `${totalUpdateScript}${subscript}`;
    },
    '',
  );

  const stdout = new streams.WritableStream();
  const stderr = new streams.WritableStream();

  spawnScript(script, 10, stdout, stderr, { cwd: appPath })
    .then(() => res
      .status(200)
      .send({
        ...resBody,
        status: 200,
        message: 'Params successfully updated',
      }));
});

app.get('/api/appenvlivediff/:appName/:appEnv', (req, res) => {
  const resBody = {
    app: req.params.appName,
    env: req.params.appEnv,
    diff: null,
  };
  const appPath = path.resolve(
    conf.workspace, _.where(appsConf, { name: req.params.appName })[0].path);
  if (!fs.pathExistsSync(appPath)) return res.status(200).send({ status: 200, ...resBody });

  const script = `set -ex && ks diff ${req.params.appEnv}`;

  const stdout = new streams.WritableStream();
  const stderr = new streams.WritableStream();

  spawnScript(script, 60, stdout, stderr, { cwd: appPath, expectedCodes: [] })
    .then(() => {
      console.log('Live diff script stdout:\n', stdout.toString());
      console.log('Live diff script stderr:\n', stderr.toString());
      res.status(200).send({ ...resBody, status: 200, diff: stdout.toString().trim() });
    })
    .catch(() => {
      console.log('Live diff script stdout:\n', stdout.toString());
      console.log('Live diff script stderr:\n', stderr.toString());
      res.status(500).send({ ...resBody, status: 500, message: stderr.toString() });
    });
});

app.get('/api/appenvdiff/:appName/:appEnv', (req, res) => {
  const resBody = {
    app: req.params.appName,
    env: req.params.appEnv,
    diff: null,
  };
  const appPath = path.resolve(
    conf.workspace, _.where(appsConf, { name: req.params.appName })[0].path);
  if (!fs.pathExistsSync(appPath)) return res.status(200).send({ status: 200, ...resBody });

  const script = `git diff environments/${req.params.appEnv}`;

  const stdout = new streams.WritableStream();
  const stderr = new streams.WritableStream();

  spawnScript(script, 60, stdout, stderr, { cwd: appPath, expectedCodes: [] })
    .then(() => res.status(200).send({ ...resBody, status: 200, diff: stdout.toString() }))
    .catch(() => res.status(500).send({ ...resBody, status: 500, message: stderr.toString() }));
});

app.get('/api/appenvreset/:appName/:appEnv', (req, res) => {
  const resBody = {
    app: req.params.appName,
    env: req.params.appEnv,
  };
  const appPath = path.resolve(
    conf.workspace, _.where(appsConf, { name: req.params.appName })[0].path);
  if (!fs.pathExistsSync(appPath)) return res.status(200).send({ status: 200, ...resBody });

  const script = `git checkout environments/${req.params.appEnv}`;

  const stdout = new streams.WritableStream();
  const stderr = new streams.WritableStream();

  spawnScript(script, 10, stdout, stderr, { cwd: appPath })
    .then(() => res.status(200).send({ ...resBody, status: 200, message: 'Reset succeeded' }))
    .catch(() => res.status(500).send({ ...resBody, status: 500, message: stderr.toString() }));
});

app.get('/api/appenvpush/:appName/:appEnv', (req, res) => {
  const resBody = {
    app: req.params.appName,
    env: req.params.appEnv,
  };
  const appPath = path.resolve(
    conf.workspace, _.where(appsConf, { name: req.params.appName })[0].path);
  if (!fs.pathExistsSync(appPath)) return res.status(200).send({ status: 200, ...resBody });

  // FIXME Use a job to update repo instead of hardcoded commands
  let script = 'set -ex\n';
  script += 'git fetch -p origin\n';
  script += 'MERGE_COMMIT=$(git rev-parse refs/remotes/origin/master)\n';
  script += 'MERGE=$(git diff --exit-code --quiet master origin/master && echo "true" || echo "git merge origin/master -m \"Merge commit: ${MERGE_COMMIT}\"")\n';
  script += 'STASH1=$(git diff-index --exit-code --quiet refs/heads/master -- && echo "true" || echo "git stash")\n';
  script += 'STASH2=$(git diff-index --exit-code --quiet refs/heads/master -- && echo "true" || echo "git stash pop")\n';
  script += '${STASH1} && ${MERGE} && ${STASH2}\n';
  script += `git add environments/${req.params.appEnv}\n`;
  script += `git commit -m "Update ksonnet parameters for app:${req.params.appName} env:${req.params.appEnv}"\n`;
  script += 'git push origin master';

  const stdout = new streams.WritableStream();
  const stderr = new streams.WritableStream();

  spawnScript(script, 60, stdout, stderr, { cwd: appPath })
    .then(() => {
      console.log('Push script stdout:\n', stdout.toString());
      console.log('Push script stderr:\n', stderr.toString());
      res.status(200).send({ ...resBody, status: 200, message: 'Push succeeded' });
    })
    .catch(() => {
      console.log('Push script stdout:\n', stdout.toString());
      console.log('Push script stderr:\n', stderr.toString());
      res.status(500).send({ ...resBody, status: 500, message: 'Push failed', error: stderr.toString() });
    });
});

app.get('/raw/jobrunlog/:jobUuid', (req, res) => {
  fs.readFile(path.resolve(conf.workspace, `${req.params.jobUuid}.log`), 'utf8')
    .then(log => res.render('raw', { text: log }));
});

app.get('/raw/jobrunevent/:jobUuid', (req, res) => {
  fs.readFile(path.resolve(conf.workspace, `${req.params.jobUuid}.event`), 'utf8')
    .then(event => res.render('raw', { text: event }));
});

app.get('/raw/jobrunenv/:jobUuid', (req, res) => {
  fs.readFile(path.resolve(conf.workspace, `${req.params.jobUuid}.env`), 'utf8')
    .then(env => res.render('raw', { text: env }));
});

app.get('/raw/jobrunscript/:jobUuid', (req, res) => {
  fs.readFile(path.resolve(conf.workspace, `${req.params.jobUuid}.sh`), 'utf8')
    .then(script => res.render('raw', { text: script }));
});

app.post('/auth', (req, res) => {
  if (
    req.body.username && req.body.username === conf.adminUsername &&
    req.body.password && req.body.password === conf.adminPassword
  ) {
    const token = cryptoToken(32);
    tokenStore[token] = {
      username: req.body.username,
      expired: false,
    };
    res.status(200).send({ status: 200, message: 'OK', token });
  } else {
    setTimeout(() => res.status(403).send({ status: 403, message: 'Wrong username/password' }), 5000);
  }
});

app.get('/authcheck', (req, res) => {
  res.status(200).send({ status: 200, message: 'OK' });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/*', (req, res) => {
  res.status(404).send({ status: 404, message: 'Url not found' });
});

app.listen(conf.port, () => console.log(`CI/CD server is listening on port ${conf.port}`));
