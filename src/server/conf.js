import path from 'path';

const conf = {
  port: process.env.HALLEY_PORT || 3000,
  url: process.env.HALLEY_URL || 'http://localhost:3000',
  jobsFile: process.env.HALLEY_JOBS_FILE || path.resolve(process.cwd(), 'jobs.yaml'),
  jobsFileReadInterval: parseInt(process.env.HALLEY_JOBS_FILE_READ_INTERVAL, 10) || 0,
  appsFile: process.env.HALLEY_APPS_FILE || path.resolve(process.cwd(), 'apps.yaml'),
  appsFileReadInterval: parseInt(process.env.HALLEY_APPS_FILE_READ_INTERVAL, 10) || 0,
  token: process.env.HALLEY_WEBHOOK_TOKEN || '',
  workspace: process.env.HALLEY_WORKSPACE || path.resolve(process.cwd(), 'workspace'),
  adminUsername: process.env.HALLEY_ADMIN_USERNAME || 'admin',
  adminPassword: process.env.HALLEY_ADMIN_PASSWORD || 'admin',
  cleanupArtifactsNumber: parseInt(process.env.HALLEY_CLEANUP_ARTIFACTS_NUMBER, 10) || 20,
  cleanupArtifactsInterval: parseInt(process.env.HALLEY_CLEANUP_ARTIFACTS_INTERVAL, 10) || 0,
};

if (conf.jobsFileReadInterval > 0 && conf.jobsFileReadInterval < 60000) {
  console.warn(`Jobs read interval is too small ${conf.jobsFileReadInterval}. Setting it to 60000.`);
  conf.jobsFileReadInterval = 60000;
}

export default conf;
