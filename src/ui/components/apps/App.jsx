import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Envs from './Envs';

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
});

class App extends React.Component {
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
          <Tab label="Envs" />
        </Tabs>
        {currentTab === 0 && <Envs />}
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
