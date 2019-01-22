import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import WorkIcon from '@material-ui/icons/Work';
import ListItemText from '@material-ui/core/ListItemText';

import _ from 'underscore';
import { connect } from 'react-redux';

import get from '../../fetch';
import {
  fetchJobsBegin,
  fetchJobsError,
  fetchJobsSuccess,
  setCurrentJob,
  setCurrentJobRun,
} from '../../actions/jobs';

import Job from './Job';

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


class Jobs extends React.Component {

  componentDidMount() {
    this.props.dispatch(fetchJobsBegin());
    const stateJobs = {};
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    get('/api/jobs', auth)
      .then((res) => {
        if (res.status === 200) {
          return res.jobs;
        }
        const err = res.message || 'Unknown error';
        this.props.dispatch(fetchJobsError(err));
        throw err;
      })
      .then(jobs => _.each(jobs, job => _.assign(stateJobs, { [job.name]: { definition: job } })))
      .then(() => this.props.dispatch(fetchJobsSuccess(stateJobs)));
  }

  handleJobChoice = (name) => {
    this.props.dispatch(setCurrentJobRun({}));
    this.props.dispatch(setCurrentJob({ name }));
  };

  render() {
    const { classes, jobs, currentJob } = this.props;

    if (jobs.loading) {
      return (
        <div className={classes.root}>
          <Typography>Loading ...</Typography>
        </div>
      );
    }

    if (jobs.error) {
      return (
        <div className={classes.root}>
          <Typography>Error occured while loading jobs: {jobs.errorMessage}</Typography>
        </div>
      );
    }

    return (
      <div className={classes.root}>
        <Grid container spacing={8}>
          <Grid item xs={2} className={classes.gridItem}>
            <List>
              {_.keys(jobs.data).map(jobName => (
                <MenuItem
                  className={classes.menuItem}
                  button
                  key={`job-${jobName}`}
                  onClick={() => this.handleJobChoice(jobName)}
                  selected={currentJob.name === jobName}
                >
                  <ListItemIcon>
                    <WorkIcon />
                  </ListItemIcon>
                  <ListItemText primary={jobName} />
                </MenuItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={10} className={classes.gridItemContent}>
            {_.isEmpty(currentJob) && <Typography>Jobs summary (not implemented)</Typography>}
            {!_.isEmpty(currentJob) && <Job />}
          </Grid>
        </Grid>
      </div>
    );
  }
}

Jobs.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  jobs: PropTypes.object.isRequired,
  currentJob: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  jobs: state.jobs.jobs,
  currentJob: state.jobs.currentJob,
});

export default connect(mapStateToProps)(withStyles(styles)(Jobs));
