import {
  FETCH_JOBS_BEGIN,
  FETCH_JOBS_SUCCESS,
  FETCH_JOBS_ERROR,
  SET_CURRENT_JOB,
  SET_CURRENT_JOB_RUN,
  FETCH_REFS_BEGIN,
  FETCH_REFS_SUCCESS,
  FETCH_REFS_ERROR,
} from '../actions/jobs';

/*
state = {
  jobs: {
    loading: bool,
    error: bool,
    errorMessage: string | null,
    data: {
      [string]: {
        definition: object,
      },
    },
  },
  refs: {
    loading: bool,
    error: bool,
    errorMessage: string | null,
    data: {
      [string]: {
        uuid: string,
        status: string,
      },
    },
  },
  currentJob: {
    name: string,
    view: 'definition' | 'runs' | 'trigger',
  },
  currentJobRun: {
    uuid: string,
  },
}
 */


const initialState = {
  jobs: {
    loading: false,
    error: false,
    errorMessage: null,
    data: {},
  },
  refs: {
    loading: false,
    error: false,
    errorMessage: null,
    data: {},
  },
  currentJob: {},
  currentJobRun: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_JOBS_BEGIN: {
      return {
        ...state,
        jobs: {
          ...state.jobs,
          loading: true,
        },
      };
    }
    case FETCH_JOBS_SUCCESS: {
      return {
        ...state,
        jobs: {
          loading: false,
          error: false,
          errorMessage: null,
          data: action.jobs,
        },
      };
    }
    case FETCH_JOBS_ERROR: {
      return {
        ...state,
        jobs: {
          loading: false,
          error: true,
          errorMessage: action.err,
          data: {},
        },
      };
    }
    case SET_CURRENT_JOB: {
      return {
        ...state,
        currentJob: action.currentJob,
      };
    }
    case SET_CURRENT_JOB_RUN: {
      return {
        ...state,
        currentJobRun: action.currentJobRun,
      };
    }
    case FETCH_REFS_BEGIN: {
      return {
        ...state,
        refs: {
          ...state.refs,
          loading: true,
        },
      };
    }
    case FETCH_REFS_SUCCESS: {
      return {
        ...state,
        refs: {
          loading: false,
          error: false,
          errorMessage: null,
          data: action.refs,
        },
      };
    }
    case FETCH_REFS_ERROR: {
      return {
        ...state,
        jobs: {
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
