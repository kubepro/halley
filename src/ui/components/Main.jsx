import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { doLogin } from '../actions/auth';
import get from '../fetch';

import Jobs from './jobs/Jobs';
import Apps from './apps/Apps';
import Events from './Events';


const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
});

class Main extends React.Component {
  state = {
    currentTab: 0,
  };

  switchTab = (event, tab) => {
    this.setState({ currentTab: tab });
  };

  authCheck = () => {
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get('/authcheck', auth)
      .then((res) => {
        if (res.status === 200) {
          this.props.dispatch(doLogin());
        }
      });
  };

  render() {
    const { classes, loggedIn } = this.props;
    const { currentTab } = this.state;

    if (!loggedIn) {
      this.authCheck();
      return <Redirect to={{ pathname: '/login' }} />;
    }

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Tabs value={currentTab} onChange={this.switchTab}>
            <Tab label="Jobs" />
            <Tab label="Apps" />
            <Tab label="Events" />
          </Tabs>
        </AppBar>
        {currentTab === 0 && <Jobs />}
        {currentTab === 1 && <Apps />}
        {currentTab === 2 && <Events />}
      </div>
    );
  }
}

Main.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  loggedIn: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  loggedIn: state.auth.loggedIn,
});

export default connect(mapStateToProps)(withStyles(styles)(Main));

