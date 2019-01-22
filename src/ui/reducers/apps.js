import {
  FETCH_APPS_BEGIN,
  FETCH_APPS_SUCCESS,
  FETCH_APPS_ERROR,
  SET_CURRENT_APP,
  SET_CURRENT_APP_ENV,
  FETCH_APP_ENVS_BEGIN,
  FETCH_APP_ENVS_SUCCESS,
  FETCH_APP_ENVS_ERROR,
  FETCH_APP_ENV_PARAMS_BEGIN,
  FETCH_APP_ENV_PARAMS_SUCCESS,
  FETCH_APP_ENV_PARAMS_ERROR,
} from '../actions/apps';

/*
state = {
  apps: {
    loading: bool,
    error: bool,
    errorMessage: string | null,
    data: {},
  },
  envs: {
    loading: bool,
    error: bool,
    errorMessage: string | null,
    data: {},
  },
  params: {
    loading: bool,
    error: bool,
    errorMessage: string | null,
    data: {},
  },
  currentApp: {},
  currentAppEnv: {},
}
 */

const initialState = {
  apps: {
    loading: false,
    error: false,
    errorMessage: null,
    data: {},
  },
  envs: {
    loading: false,
    error: false,
    errorMessage: null,
    data: {},
  },
  params: {
    loading: false,
    error: false,
    errorMessage: null,
    data: {},
  },
  currentApp: {},
  currentAppEnv: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_APPS_BEGIN: {
      return {
        ...state,
        apps: {
          ...state.apps,
          loading: true,
        },
      };
    }
    case FETCH_APPS_SUCCESS: {
      return {
        ...state,
        apps: {
          loading: false,
          error: false,
          errorMessage: null,
          data: action.apps,
        },
      };
    }
    case FETCH_APPS_ERROR: {
      return {
        ...state,
        apps: {
          loading: false,
          error: true,
          errorMessage: action.err,
          data: {},
        },
      };
    }
    case SET_CURRENT_APP: {
      return {
        ...state,
        currentApp: action.currentApp,
      };
    }
    case SET_CURRENT_APP_ENV: {
      return {
        ...state,
        currentAppEnv: action.currentAppEnv,
      };
    }
    case FETCH_APP_ENVS_BEGIN: {
      return {
        ...state,
        envs: {
          ...state.envs,
          loading: true,
        },
      };
    }
    case FETCH_APP_ENVS_SUCCESS: {
      return {
        ...state,
        envs: {
          loading: false,
          error: false,
          errorMessage: null,
          data: action.envs,
        },
      };
    }
    case FETCH_APP_ENVS_ERROR: {
      return {
        ...state,
        envs: {
          loading: false,
          error: true,
          errorMessage: action.err,
          data: {},
        },
      };
    }
    case FETCH_APP_ENV_PARAMS_BEGIN: {
      return {
        ...state,
        params: {
          ...state.params,
          loading: true,
        },
      };
    }
    case FETCH_APP_ENV_PARAMS_SUCCESS: {
      return {
        ...state,
        params: {
          loading: false,
          error: false,
          errorMessage: null,
          data: action.params,
        },
      };
    }
    case FETCH_APP_ENV_PARAMS_ERROR: {
      return {
        ...state,
        params: {
          loading: false,
          error: true,
          errorMessage: action.err,
          data: {},
        },
      };
    }
    default: {
      return state;
    }
  }
};
