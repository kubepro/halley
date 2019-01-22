import React from 'react';
import PropTypes from 'prop-types';
import yaml from 'js-yaml';
import { connect } from 'react-redux';

const JobDefinition = ({ jobs, currentJob }) => (
  <div>
    <pre><code>{yaml.safeDump(jobs.data[currentJob.name].definition)}</code></pre>
  </div>
);

JobDefinition.propTypes = {
  jobs: PropTypes.object.isRequired,
  currentJob: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  jobs: state.jobs.jobs,
  currentJob: state.jobs.currentJob,
});

export default connect(mapStateToProps)(JobDefinition);
