import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import get from '../../fetch';

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  button: {
    margin: theme.spacing.unit,
  },
  snackbar: {
    margin: theme.spacing.unit,
  },
});

class GitDiff extends React.Component {
  state = {
    loading: false,
    diff: null,
    error: false,
    errorMessage: null,
    flash: null,
  };

  setDiffFromResponse = (res) => {
    const newState = { loading: false };
    try {
      if (res.status !== 200) throw new Error(res.message || 'Wrong response status');
      newState.diff = res.diff;
    } catch (err) {
      newState.diff = res.message || err.message || 'Error while getting env diff';
    }
    this.setState(newState);
  };

  fetchDiff = () => {
    this.setState({ loading: true, diff: 'Loading ...' });
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get(`/api/appenvdiff/${this.props.currentApp.name}/${this.props.currentAppEnv.name}`, auth)
      .then(res => this.setDiffFromResponse(res));
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentAppEnv.name !== prevProps.currentAppEnv.name) {
      this.fetchDiff();
    }
  }

  componentDidMount() {
    this.fetchDiff();
  }

  onReset = () => {
    this.setState({ loading: true, diff: 'Loading ...' });
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get(`/api/appenvreset/${this.props.currentApp.name}/${this.props.currentAppEnv.name}`, auth)
      .then(() => this.fetchDiff());
  };

  onSubmit = () => {
    this.setState({ loading: true, diff: 'Loading ...' });
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get(`/api/appenvpush/${this.props.currentApp.name}/${this.props.currentAppEnv.name}`, auth)
      .then((res) => {
        if (res.status !== 200) {
          this.setState({ flash: res.message, error: true, errorMessage: res.error });
        }
        this.fetchDiff();
      });
  };

  render() {
    const { classes } = this.props;

    if (this.state.loading) {
      return (
        <div>
          <Typography>{this.state.diff}</Typography>
        </div>
      );
    }

    return (
      <div>
        {this.state.diff && <pre><code>{this.state.diff}</code></pre>}
        <Button variant="contained" className={classes.button} onClick={this.onReset}>Reset changes</Button>
        <Button variant="contained" color="primary" className={classes.button} onClick={this.onSubmit}>Push to repo</Button>
        {this.state.flash &&
          <SnackbarContent
            className={classes.snackbar}
            message={this.state.flash}
          />
        }
        {this.state.error && <pre><code>{this.state.errorMessage}</code></pre>}
      </div>
    );
  }
}

GitDiff.propTypes = {
  classes: PropTypes.object.isRequired,
  currentApp: PropTypes.object.isRequired,
  currentAppEnv: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  currentApp: state.apps.currentApp,
  currentAppEnv: state.apps.currentAppEnv,
});

export default connect(mapStateToProps)(withStyles(styles)(GitDiff));
