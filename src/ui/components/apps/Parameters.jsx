import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import _ from 'underscore';

import ReactJson from 'react-json-view';
import get, { post } from '../../fetch';

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '900px',
  },
  button: {
    margin: theme.spacing.unit,
  },
  rjv: {
    marginTop: theme.spacing.unit,
  },
  snackbar: {
    margin: theme.spacing.unit,
  },
});

class Parameters extends React.Component {
  state = {
    loading: false,
    params: undefined,
  };

  setParamsFromResponse = (res) => {
    const newState = { loading: false };
    try {
      if (res.status !== 200) throw new Error('Wrong response status');
      newState.params = JSON.parse(res.params);
    } catch (err) {
      newState.params = res.message || err.message || 'Error while getting params';
    }
    this.setState(newState);
  };

  fetchParams = () => {
    this.setState({ loading: true, params: 'Loading ...' });
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get(`/api/appenvparams/${this.props.currentApp.name}/${this.props.currentAppEnv.name}`, auth)
      .then(res => this.setParamsFromResponse(res));
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentAppEnv.name !== prevProps.currentAppEnv.name) {
      this.fetchParams();
    }
  }

  componentDidMount() {
    this.fetchParams();
  }

  onEdit = (edit) => {
    this.setState({ loading: true, params: 'Loading ...' });
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    post(`/api/appenvparams/${this.props.currentApp.name}/${this.props.currentAppEnv.name}`, _.property('updated_src')(edit), auth)
      .then(() => this.fetchParams());
  };

  onReset = () => {
    this.setState({ loading: true, params: 'Loading ...' });
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get(`/api/appenvreset/${this.props.currentApp.name}/${this.props.currentAppEnv.name}`, auth)
      .then(() => this.fetchParams());
  };

  render() {
    const { classes } = this.props;

    if (this.state.loading) {
      return (
        <div>
          <Typography>{this.state.params}</Typography>
        </div>
      );
    }

    return (
      <div>
        {typeof this.state.params === 'string' && <Typography>{this.state.params}</Typography>}
        {typeof this.state.params === 'object' &&
          <div className={classes.rjv}>
            <ReactJson theme="monokai" src={this.state.params} onEdit={this.onEdit} />
          </div>
        }
        <Button variant="contained" className={classes.button} onClick={this.onReset}>Reset changes</Button>
      </div>
    );
  }
}

Parameters.propTypes = {
  classes: PropTypes.object.isRequired,
  currentApp: PropTypes.object.isRequired,
  currentAppEnv: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  currentApp: state.apps.currentApp,
  currentAppEnv: state.apps.currentAppEnv,
});

export default connect(mapStateToProps)(withStyles(styles)(Parameters));
