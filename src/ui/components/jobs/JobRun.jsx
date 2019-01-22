import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import JobRunLog from './JobRunLog';
import JobRunEvent from './JobRunEvent';
import JobRunEnv from './JobRunEnv';
import JobRunScript from './JobRunScript';

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
});

class JobRun extends React.Component {
  state = {
    currentTab: 0,
  };

  switchTab = (event, tab) => {
    this.setState({ currentTab: tab });
  };

  render() {
    const { classes } = this.props;
    const { currentTab } = this.state;

    return (
      <div className={classes.root}>
        <Tabs value={currentTab} onChange={this.switchTab}>
          <Tab label="Log" />
          <Tab label="Event" />
          <Tab label="Env" />
          <Tab label="Script" />
        </Tabs>
        {currentTab === 0 && <JobRunLog />}
        {currentTab === 1 && <JobRunEvent />}
        {currentTab === 2 && <JobRunEnv />}
        {currentTab === 3 && <JobRunScript />}
      </div>
    );
  }
}

JobRun.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(JobRun);
