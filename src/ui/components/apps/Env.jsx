import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import GitDiff from './GitDiff';
import LiveDiff from './LiveDiff';
import Parameters from './Parameters';

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
});

class Env extends React.Component {
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
          <Tab label="Parameters" />
          <Tab label="GitDiff" />
          <Tab label="LiveDiff" />
        </Tabs>
        {currentTab === 0 && <Parameters />}
        {currentTab === 1 && <GitDiff />}
        {currentTab === 2 && <LiveDiff />}
      </div>
    );
  }
}

Env.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Env);
