import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import logger from 'redux-logger';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import Main from './components/Main';
import Login from './components/Login';

import appsReducer from './reducers/apps';
import authReducer from './reducers/auth';
import jobsReducer from './reducers/jobs';

const store = createStore(
  combineReducers({ jobs: jobsReducer, auth: authReducer, apps: appsReducer }),
  applyMiddleware(logger),
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <div>
        <Route exact path="/" component={Main} />
        <Route path="/login" component={Login} />
      </div>
    </Router>
  </Provider>,
  document.getElementById('app'),
);
