import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';

import get from '../../fetch';

class JobRunLog extends React.Component {
  state = {
    loading: false,
    log: undefined,
  };

  fetchLog = () => {
    this.setState({ loading: true, log: 'Loading ...' });
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get(`/api/jobrunlog/${this.props.currentJobRun.uuid}`, auth)
      .then(data => this.setState({
        loading: false,
        log: data.log,
      }));
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentJobRun.uuid !== prevProps.currentJobRun.uuid) {
      this.fetchLog();
    }
  }

  componentDidMount() {
    this.fetchLog();
  }

  render() {
    if (this.state.loading) {
      return (
        <div>
          <Typography>{this.state.log}</Typography>
        </div>
      );
    }

    return (
      <div>
        <pre>
          <code>
            {this.state.log}
          </code>
        </pre>
      </div>
    );
  }
}

JobRunLog.propTypes = {
  currentJobRun: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  currentJobRun: state.jobs.currentJobRun,
});


export default connect(mapStateToProps)(JobRunLog);

