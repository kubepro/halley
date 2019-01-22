import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SuccessIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/HighlightOff';
import UnknownIcon from '@material-ui/icons/Help';
import RunningIcon from '@material-ui/icons/HourglassFull';
import PendingIcon from '@material-ui/icons/Schedule';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';
import _ from 'underscore';
import { fetchRefsBegin, fetchRefsError, fetchRefsSuccess, setCurrentJobRun } from '../../actions/jobs';

import JobRun from './JobRun';
import get from '../../fetch';

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


class JobRuns extends React.Component {
  fetchRefs = () => {
    this.props.dispatch(fetchRefsBegin());
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };

    get(`/api/jobrefs/${this.props.currentJob.name}`, auth)
      .then((res) => {
        if (res.status === 200) {
          return res.refs;
        }
        const err = res.message || 'Unknown error';
        this.props.dispatch(fetchRefsError(err));
        throw err;
      })
      .then(refs => this.props.dispatch(fetchRefsSuccess(refs)));
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentJob.name !== prevProps.currentJob.name) {
      this.fetchRefs();
    }
  }

  componentDidMount() {
    this.fetchRefs();
  }

  setCurrentJobRun = (uuid) => {
    this.props.dispatch(setCurrentJobRun({ uuid }));
  };

  render() {
    const {
      classes,
      refs,
      currentJobRun,
    } = this.props;

    if (refs.loading) {
      return (
        <div className={classes.root}>
          <Typography>Loading ...</Typography>
        </div>
      );
    }

    if (refs.error) {
      return (
        <div className={classes.root}>
          <Typography>Error occured while loading job refs: {refs.errorMessage}</Typography>
        </div>
      );
    }

    if (_.isEmpty(refs.data)) {
      return (<div><Typography>There are no job runs</Typography></div>);
    }

    return (
      <div className={classes.root}>
        <Grid container spacing={8}>
          <Grid item xs={3} className={classes.gridItem}>
            <List>
              {_.pairs(refs.data).map(([ref, refData]) => {
                let icon = null;
                switch (refData.status) {
                  case 'SUCCEEDED':
                    icon = <SuccessIcon />;
                    break;
                  case 'FAILED':
                    icon = <ErrorIcon />;
                    break;
                  case 'PENDING':
                    icon = <PendingIcon />;
                    break;
                  case 'STARTED':
                    icon = <RunningIcon />;
                    break;
                  default:
                    icon = <UnknownIcon />;
                }
                return (
                  <MenuItem
                    button
                    key={refData.uuid}
                    onClick={() => this.setCurrentJobRun(refData.uuid)}
                    selected={currentJobRun.uuid === refData.uuid}
                  >
                    <ListItemIcon>
                      {icon}
                    </ListItemIcon>
                    <ListItemText primary={ref} />
                  </MenuItem>
                );
              })}
            </List>
          </Grid>
          <Grid item xs={9} className={classes.gridItemContent}>
            {_.isEmpty(currentJobRun) && <Typography>Job run is not chosen</Typography>}
            {!_.isEmpty(currentJobRun) && <JobRun /> }
          </Grid>
        </Grid>

      </div>
    );
  }
}

JobRuns.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  refs: PropTypes.object.isRequired,
  currentJob: PropTypes.object.isRequired,
  currentJobRun: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  refs: state.jobs.refs,
  currentJob: state.jobs.currentJob,
  currentJobRun: state.jobs.currentJobRun,
});


export default connect(mapStateToProps)(withStyles(styles)(JobRuns));

