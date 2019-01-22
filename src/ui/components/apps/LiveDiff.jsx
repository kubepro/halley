import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';

import get from '../../fetch';

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
});

class LiveDiff extends React.Component {
  state = {
    loading: false,
    diff: null,
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
    get(`/api/appenvlivediff/${this.props.currentApp.name}/${this.props.currentAppEnv.name}`, auth)
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

  render() {
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
        {!this.state.diff && <Typography>There is no difference</Typography>}
      </div>
    );
  }
}

LiveDiff.propTypes = {
  currentApp: PropTypes.object.isRequired,
  currentAppEnv: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  currentApp: state.apps.currentApp,
  currentAppEnv: state.apps.currentAppEnv,
});

export default connect(mapStateToProps)(withStyles(styles)(LiveDiff));
