import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';

import get from '../../fetch';

class JobRunEvent extends React.Component {
  state = {
    loading: false,
    event: undefined,
  };

  fetchEvent = () => {
    this.setState({ loading: true, event: 'Loading ...' });
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get(`/api/jobrunevent/${this.props.currentJobRun.uuid}`, auth)
      .then((data) => {
        const newState = { loading: false };
        try {
          newState.event = JSON.parse(data.event);
        } catch (err) {
          newState.event = data.message || 'Error while getting event';
        }
        this.setState(newState);
      });
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentJobRun.uuid !== prevProps.currentJobRun.uuid) {
      this.fetchEvent();
    }
  }

  componentDidMount() {
    this.fetchEvent();
  }

  render() {
    if (this.state.loading) {
      return (
        <div>
          <Typography>{this.state.event}</Typography>
        </div>
      );
    }

    return (
      <div>
        {typeof this.state.event === 'string' && <Typography>{this.state.event}</Typography>}
        {typeof this.state.event === 'object' &&
          <pre><code>{JSON.stringify(this.state.event, null, '  ')}</code></pre>}
      </div>
    );
  }
}

JobRunEvent.propTypes = {
  currentJobRun: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  currentJobRun: state.jobs.currentJobRun,
});


export default connect(mapStateToProps)(JobRunEvent);

