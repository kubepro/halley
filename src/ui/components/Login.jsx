import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { post } from '../fetch';
import { doLogin } from '../actions/auth';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  form: {},
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
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


class Login extends React.Component {
  state = {
    username: null,
    password: null,
    flash: null,
  };

  handleUsernameChange = (event) => {
    this.setState({ username: event.target.value });
  };

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value });
  };

  handleSubmit = (event) => {
    this.setState({ flash: null });
    event.preventDefault();
    post('/auth', {
      username: this.state.username,
      password: this.state.password,
    })
      .then((res) => {
        if (res.status === 200) {
          sessionStorage.setItem('authToken', res.token);
          this.props.dispatch(doLogin());
        } else {
          this.setState({ flash: 'Wrong username/password' });
        }
      });
  };

  render() {
    const { classes, loggedIn } = this.props;

    if (loggedIn) {
      return (
        <div className={classes.root}>
          <Redirect to={{ pathname: '/' }} />
        </div>
      );
    }

    return (
      <div className={classes.root}>
        <Grid container spacing={8}>
          <Grid item xs />
          <Grid item xs>
            {this.state.flash &&
              <SnackbarContent
                className={classes.snackbar}
                message={this.state.flash}
              />
            }
            <Paper className={classes.paper}>
              <form className={classes.form} onSubmit={this.handleSubmit}>
                <Input
                  id="username"
                  placeholder="Username"
                  className={classes.input}
                  onChange={this.handleUsernameChange}
                />
                <Input
                  id="password"
                  placeholder="Password"
                  className={classes.input}
                  type="password"
                  autoComplete="current-password"
                  onChange={this.handlePasswordChange}
                />
                <Button
                  variant="raised"
                  className={classes.button}
                  type="submit"
                >
                  Submit
                </Button>
              </form>
            </Paper>
          </Grid>
          <Grid item xs />
        </Grid>
      </div>
    );
  }
}

Login.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  loggedIn: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  loggedIn: state.auth.loggedIn,
});

export default connect(mapStateToProps)(withStyles(styles)(Login));

