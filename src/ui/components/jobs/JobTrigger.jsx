import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import { post } from '../../fetch';
import { setCurrentJob } from '../../actions/jobs';

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '900px',
  },
  form: {},
  input: {
    margin: theme.spacing.unit,
  },
  button: {
    margin: theme.spacing.unit,
  },
  snackbar: {
    margin: theme.spacing.unit,
  },
});


class JobTrigger extends React.Component {
  state = {
    payload: {},
    error: false,
    flash: null,
  };

  handlePayloadChange = (event) => {
    try {
      this.setState({
        payload: JSON.parse(event.target.value),
        error: false,
        flash: null,
      });
    } catch (err) {
      this.setState({ error: true });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.state.error) {
      this.setState({ flash: 'Wrong payload. Fix before trying to send.' });
      return;
    }

    this.setState({ flash: null });
    const auth = { 'x-http-auth': sessionStorage.getItem('authToken') };
    post(`/api/jobtrigger/name/${this.props.currentJob.name}`, this.state.payload, auth)
      .then((res) => {
        if (res.status === 200) {
          this.props.dispatch(setCurrentJob({
            name: this.props.currentJob.name,
            view: 'runs',
          }));
        }
      });
  };

  render() {
    const { classes, currentJob } = this.props;
    return (
      <div className={classes.root}>
        <form className={classes.form} onSubmit={this.handleSubmit}>
          <TextField
            defaultValue={JSON.stringify(this.state.payload)}
            label={`Event payload (JSON) for ${currentJob.name}`}
            error={this.state.error}
            fullWidth
            multiline
            rows={20}
            className={classes.input}
            onChange={this.handlePayloadChange}
          />
          <Button variant="raised" className={classes.button} type="submit">
            Submit
          </Button>
        </form>
        {this.state.flash &&
          <SnackbarContent
            className={classes.snackbar}
            message={this.state.flash}
          />
        }
      </div>
    );
  }
}


JobTrigger.propTypes = {
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  currentJob: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  currentJob: state.jobs.currentJob,
});

export default connect(mapStateToProps)(withStyles(styles)(JobTrigger));
