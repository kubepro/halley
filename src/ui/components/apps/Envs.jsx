import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';

import { connect } from 'react-redux';
import _ from 'underscore';
import {
  fetchAppEnvsBegin,
  fetchAppEnvsError,
  fetchAppEnvsSuccess,
  setCurrentAppEnv,
} from '../../actions/apps';
import get from '../../fetch';
import Env from './Env';

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

class Envs extends React.Component {
  fetchAppEnvs = () => {
    this.props.dispatch(fetchAppEnvsBegin());
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };

    get(`/api/appenvs/${this.props.currentApp.name}`, auth)
      .then((res) => {
        if (res.status === 200) {
          return res.envs;
        }
        const err = res.message || 'Unknown error';
        this.props.dispatch(fetchAppEnvsError(err));
        throw err;
      })
      .then(envs => this.props.dispatch(fetchAppEnvsSuccess(envs)));
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentApp.name !== prevProps.currentApp.name) {
      this.fetchAppEnvs();
    }
  }

  componentDidMount() {
    this.fetchAppEnvs();
  }

  setCurrentAppEnv = (name) => {
    this.props.dispatch(setCurrentAppEnv({ name }));
  };

  render() {
    const {
      classes,
      envs,
      currentAppEnv,
    } = this.props;

    if (envs.loading) {
      return (
        <div className={classes.root}>
          <Typography>Loading ...</Typography>
        </div>
      );
    }

    if (envs.error) {
      return (
        <div className={classes.root}>
          <Typography>Error occured while loading app envs: {envs.errorMessage}</Typography>
        </div>
      );
    }

    if (_.isEmpty(envs.data)) {
      return (<div><Typography>There are no app envs</Typography></div>);
    }

    return (
      <div className={classes.root}>
        <Grid container spacing={8}>
          <Grid item xs={2} className={classes.gridItem}>
            <List>
              {_.map(_.keys(envs.data), envName => (
                <MenuItem
                  button
                  key={`env-${envName}`}
                  onClick={() => this.setCurrentAppEnv(envName)}
                  selected={currentAppEnv.name === envName}
                >
                  <ListItemText primary={envName} />
                </MenuItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={10} className={classes.gridItemContent}>
            {_.isEmpty(currentAppEnv) && <Typography>Env is not chosen</Typography>}
            {!_.isEmpty(currentAppEnv) && <Env /> }
          </Grid>
        </Grid>

      </div>
    );
  }
}

Envs.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  envs: PropTypes.object.isRequired,
  currentApp: PropTypes.object.isRequired,
  currentAppEnv: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  envs: state.apps.envs,
  currentApp: state.apps.currentApp,
  currentAppEnv: state.apps.currentAppEnv,
});


export default connect(mapStateToProps)(withStyles(styles)(Envs));
