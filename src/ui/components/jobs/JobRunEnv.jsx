import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';

import get from '../../fetch';

class JobRunEnv extends React.Component {
  state = {
    loading: false,
    env: undefined,
  };

  fetchEnv = () => {
    this.setState({ loading: true, env: 'Loading ...' });
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get(`/api/jobrunenv/${this.props.currentJobRun.uuid}`, auth)
      .then((data) => {
        this.setState({ loading: false, env: data.env || 'Not found' });
      });
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentJobRun.uuid !== prevProps.currentJobRun.uuid) {
      this.fetchEnv();
    }
  }

  componentDidMount() {
    this.fetchEnv();
  }

  render() {
    if (this.state.loading) {
      return (
        <div>
          <Typography>{this.state.env}</Typography>
        </div>
      );
    }

    return (
      <div>
        <pre>
          <code>
            {this.state.env}
          </code>
        </pre>
      </div>
    );
  }
}

JobRunEnv.propTypes = {
  currentJobRun: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  currentJobRun: state.jobs.currentJobRun,
});


export default connect(mapStateToProps)(JobRunEnv);

