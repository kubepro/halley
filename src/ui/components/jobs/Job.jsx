import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import JobDefinition from './JobDefinition';
import JobRuns from './JobRuns';
import JobTrigger from './JobTrigger';

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
});

class Job extends React.Component {
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
          <Tab label="Runs" />
          <Tab label="Definition" />
          <Tab label="Trigger" />
        </Tabs>
        {currentTab === 0 && <JobRuns />}
        {currentTab === 1 && <JobDefinition />}
        {currentTab === 2 && <JobTrigger />}
      </div>
    );
  }
}

Job.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Job);
