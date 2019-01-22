import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';

import get from '../../fetch';

class JobRunScript extends React.Component {
  state = {
    loading: false,
    script: undefined,
  };

  fetchScript = () => {
    this.setState({ loading: true, script: 'Loading ...' });
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get(`/api/jobrunscript/${this.props.currentJobRun.uuid}`, auth)
      .then((data) => {
        this.setState({ loading: false, script: data.script || 'Not found' });
      });
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentJobRun.uuid !== prevProps.currentJobRun.uuid) {
      this.fetchScript();
    }
  }

  componentDidMount() {
    this.fetchScript();
  }

  render() {
    if (this.state.loading) {
      return (
        <div>
          <Typography>{this.state.script}</Typography>
        </div>
      );
    }

    return (
      <div>
        <pre>
          <code>
            {this.state.script}
          </code>
        </pre>
      </div>
    );
  }
}

JobRunScript.propTypes = {
  currentJobRun: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  currentJobRun: state.jobs.currentJobRun,
});


export default connect(mapStateToProps)(JobRunScript);

