export const FETCH_APPS_BEGIN = 'FETCH_APPS_BEGIN';
export const FETCH_APPS_SUCCESS = 'FETCH_APPS_SUCCESS';
export const FETCH_APPS_ERROR = 'FETCH_APPS_ERROR';
export const SET_CURRENT_APP = 'SET_CURRENT_APP';
export const SET_CURRENT_APP_ENV = 'SET_CURRENT_APP_ENV';
export const SET_CURRENT_APP_COMPONENT = 'SET_CURRENT_APP_COMPONENT';
export const FETCH_APP_ENVS_BEGIN = 'FETCH_APP_ENVS_BEGIN';
export const FETCH_APP_ENVS_SUCCESS = 'FETCH_APP_ENVS_SUCCESS';
export const FETCH_APP_ENVS_ERROR = 'FETCH_APP_ENVS_ERROR';
export const FETCH_APP_ENV_PARAMS_BEGIN = 'FETCH_APP_ENV_PARAMS_BEGIN';
export const FETCH_APP_ENV_PARAMS_SUCCESS = 'FETCH_APP_ENV_PARAMS_SUCCESS';
export const FETCH_APP_ENV_PARAMS_ERROR = 'FETCH_APP_ENV_PARAMS_ERROR';

export const fetchAppsBegin = () => ({
  type: FETCH_APPS_BEGIN,
});

export const fetchAppsSuccess = apps => ({
  type: FETCH_APPS_SUCCESS,
  apps,
});

export const fetchAppsError = err => ({
  type: FETCH_APPS_ERROR,
  err,
});

export const setCurrentApp = currentApp => ({
  type: SET_CURRENT_APP,
  currentApp,
});

export const setCurrentAppEnv = currentAppEnv => ({
  type: SET_CURRENT_APP_ENV,
  currentAppEnv,
});

export const fetchAppEnvsBegin = () => ({
  type: FETCH_APP_ENVS_BEGIN,
});

export const fetchAppEnvsSuccess = envs => ({
  type: FETCH_APP_ENVS_SUCCESS,
  envs,
});

export const fetchAppEnvsError = err => ({
  type: FETCH_APP_ENVS_ERROR,
  err,
});

export const fetchAppEnvParamsBegin = () => ({
  type: FETCH_APP_ENV_PARAMS_BEGIN,
});

export const fetchAppEnvParamsSuccess = params => ({
  type: FETCH_APP_ENV_PARAMS_SUCCESS,
  params,
});

export const fetchAppEnvParamsError = err => ({
  type: FETCH_APP_ENV_PARAMS_ERROR,
  err,
});
