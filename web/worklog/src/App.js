import React from 'react';
import {Router, Route, Switch} from 'react-router-dom';
import createHistory from "history/createBrowserHistory";

import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Create from "./components/Create";
import Reset from "./components/Reset";
import Dashboard from "./components/Dashboard";
import Error from "./components/Error";

const API_BASE_URL = process.env.REACT_APP_APP_SERVER;

class App extends React.Component {

  constructor(props) {
    super(props);

    this.history = createHistory();

    this.state = {
      invalidLogin: false,
      invalidReset: false,
      invalidCreate: false,
      loading: false
    };
    this.login = this.login.bind(this);
    this.create = this.create.bind(this);
    this.reset = this.reset.bind(this);
    this.redirectToLogin = this.redirectToLogin.bind(this);
    this.updateLoading = this.updateLoading.bind(this);
    this.createError = this.createError.bind(this);

    if (!sessionStorage.getItem("session")) {
      sessionStorage.setItem("session",false);
    }

    if (!sessionStorage.getItem("user")) {
      sessionStorage.setItem("user","");
    }
  }

  componentDidUpdate(prevProps) {
    if (sessionStorage.getItem("session") === "true") {
      this.history.push("/dashboard");
    }
  }

  redirectToLogin = (e) => {
    this.setState({invalidLogin: false,
                    invalidReset: false,
                    invalidCreate: false,
                    loading: false});
    sessionStorage.setItem("session",false);
    sessionStorage.setItem("user","");
    this.history.push("/login");
  }

  createError = () => {
    this.setState({invalidCreate: true});
  }

  updateLoading = () => {
    this.setState({loading: !this.state.loading});
  }

  login = async (e,username, password) => {
    if(e) e.preventDefault();

    if (username.replace(/\s+/g,'').length > 0 && password.replace(/\s+/g,'').length > 0) {

      this.updateLoading();

      const response = await fetch(API_BASE_URL+'/api/v1/login',{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({username:username,
                  password:password})
      });

      const isLoggedIn = await response.ok;

      if (isLoggedIn) {
        sessionStorage.setItem("session",true);
        sessionStorage.setItem("user",username);
        this.setState({invalidLogin: false});
      } else {
        sessionStorage.setItem("session",false);
        this.setState({invalidLogin: true});
      }

      this.updateLoading();
    } else {
      sessionStorage.setItem("session",false);
      this.setState({invalidLogin: true});
    }
  }

  create = async (e,username,password) => {
    if(e) e.preventDefault();

    this.updateLoading();

    const response = await fetch(API_BASE_URL+'/api/v1/user/create',{
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username:username,
                password:password})
    });
    const userIsCreated = await response.ok;
    sessionStorage.setItem("session",userIsCreated);
    sessionStorage.setItem("user",username);
    this.setState({invalidCreate:!userIsCreated});

    this.updateLoading();
  }

  reset = async (e,username,password,newPassword) => {
    if(e) e.preventDefault();

    this.updateLoading();

    const response = await fetch(API_BASE_URL+'/api/v1/user/'+username+'/reset',{
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({password:password,
                new_password:newPassword})
    });
    const isReset = await response.ok;
    if (isReset) {
      this.setState({invalidReset: false});
      this.redirectToLogin();
    } else {
      this.setState({invalidReset: true});
    }

    this.updateLoading();
  }

  render() {
    return (
        <Router history={this.history}>
          <Switch>
            <Route exact path="/" component={Welcome} />
            <Route path="/login" render={(props) => <Login {...props} login={this.login} state={this.state} />} />
            <Route path="/reset" render={(props) => <Reset {...props} reset={this.reset} state={this.state} redirectToLogin={this.redirectToLogin} />} />
            <Route path="/create" render={(props) => <Create {...props} create={this.create} createError={this.createError} state={this.state} />} />
            <Route path="/dashboard" render={(props) => <Dashboard {...props} state={this.state} redirectToLogin={this.redirectToLogin} />} />
            <Route component={Error} />
          </Switch>
        </Router>
      );
  }
};

export default App;