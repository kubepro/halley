export const FETCH_JOBS_BEGIN = 'FETCH_JOBS_BEGIN';
export const FETCH_JOBS_SUCCESS = 'FETCH_JOBS_SUCCESS';
export const FETCH_JOBS_ERROR = 'FETCH_JOBS_ERROR';
export const SET_CURRENT_JOB = 'SET_CURRENT_JOB';
export const SET_CURRENT_JOB_RUN = 'SET_CURRENT_JOB_RUN';
export const FETCH_REFS_BEGIN = 'FETCH_REFS_BEGIN';
export const FETCH_REFS_SUCCESS = 'FETCH_REFS_SUCCESS';
export const FETCH_REFS_ERROR = 'FETCH_REFS_ERROR';

export const fetchJobsBegin = () => ({
  type: FETCH_JOBS_BEGIN,
});

export const fetchJobsSuccess = jobs => ({
  type: FETCH_JOBS_SUCCESS,
  jobs,
});

export const fetchJobsError = err => ({
  type: FETCH_JOBS_ERROR,
  err,
});

export const setCurrentJob = currentJob => ({
  type: SET_CURRENT_JOB,
  currentJob,
});

export const setCurrentJobRun = currentJobRun => ({
  type: SET_CURRENT_JOB_RUN,
  currentJobRun,
});

export const fetchRefsBegin = () => ({
  type: FETCH_REFS_BEGIN,
});

export const fetchRefsSuccess = refs => ({
  type: FETCH_REFS_SUCCESS,
  refs,
});

export const fetchRefsError = err => ({
  type: FETCH_REFS_ERROR,
  err,
});

