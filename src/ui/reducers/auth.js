import { LOG_IN } from '../actions/auth';

/*
state = {
  loggedIn: bool,
}
 */

const initialState = {
  loggedIn: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOG_IN: {
      return {
        ...state,
        loggedIn: true,
      };
    }
    default: {
      return state;
    }
  }
};
