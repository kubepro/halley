import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';

import _ from 'underscore';
import { connect } from 'react-redux';

import get from '../../fetch';
import {
  fetchAppsBegin,
  fetchAppsError,
  fetchAppsSuccess,
  setCurrentApp,
} from '../../actions/apps';

import App from './App';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  gridItem: {},
  gridItemContent: {
    marginTop: 8,
  },
  menuItem: {
    '& $primary, & $icon': {
      color: theme.palette.common.white,
    },
  },
});


class Apps extends React.Component {
  componentDidMount() {
    this.props.dispatch(fetchAppsBegin());
    const stateApps = {};
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get('/api/apps', auth)
      .then((res) => {
        if (res.status === 200) {
          return res.apps;
        }
        const err = res.message || 'Unknown error';
        this.props.dispatch(fetchAppsError(err));
        throw err;
      })
      .then(apps => _.each(apps, app => _.assign(stateApps, { [app.name]: app })))
      .then(() => this.props.dispatch(fetchAppsSuccess(stateApps)));
  }

  handleAppChoice = (name) => {
    this.props.dispatch(setCurrentApp({ name }));
  };

  render() {
    const { classes, apps, currentApp } = this.props;

    if (apps.loading) {
      return (
        <div className={classes.root}>
          <Typography>Loading ...</Typography>
        </div>
      );
    }

    if (apps.error) {
      return (
        <div className={classes.root}>
          <Typography>Error occured while loading apps: {apps.errorMessage}</Typography>
        </div>
      );
    }

    return (
      <div className={classes.root}>
        <Grid container spacing={8}>
          <Grid item xs={2} className={classes.gridItem}>
            <List>
              {_.keys(apps.data).map(appName => (
                <MenuItem
                  className={classes.menuItem}
                  button
                  onClick={() => this.handleAppChoice(appName)}
                  selected={currentApp.name === appName}
                >
                  <ListItemText primary={appName} />
                </MenuItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={10} className={classes.gridItemContent}>
            {_.isEmpty(currentApp) && <Typography>Apps summary (not implemented)</Typography>}
            {!_.isEmpty(currentApp) && <App />}
          </Grid>
        </Grid>
      </div>
    );
  }
}

Apps.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  apps: PropTypes.object.isRequired,
  currentApp: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  apps: state.apps.apps,
  currentApp: state.apps.currentApp,
});

export default connect(mapStateToProps)(withStyles(styles)(Apps));
