import React from 'react';
import {Router, Route, Switch} from 'react-router-dom';
import createHistory from "history/createBrowserHistory";

import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Create from "./components/Create";
import Reset from "./components/Reset";
import Dashboard from "./components/Dashboard";
import Error from "./components/Error";

class App extends React.Component {

  constructor(props) {
    super(props);

    this.history = createHistory();

    this.state = {
      session: false,
      user: undefined
    };
    this.login = this.login.bind(this);
    this.create = this.create.bind(this);
    this.reset = this.reset.bind(this);
    this.redirectToLogin = this.redirectToLogin.bind(this);
  }

  componentDidUpdate(prevProps) {
    console.log(this.state);

    if (this.state.session) {
      this.history.push("/dashboard");
    }
  }

  redirectToLogin = (e) => {
    this.history.push("/login");
  }

  login = async (e,username, password) => {
    if(e) e.preventDefault();

    const response = await fetch('http://169.55.81.216:32000/api/v1/login',{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username:username,
                password:password})
    });
    const isLoggedIn = await response.ok;
    this.setState({session:isLoggedIn, user:username});
  }

  create = async (e,username,password) => {
    if(e) e.preventDefault();

    const response = await fetch('http://169.55.81.216:32000/api/v1/user/create',{
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username:username,
                password:password})
    });
    const userIsCreated = await response.ok;
    this.setState({session:userIsCreated, user:username});
  }

  reset = async (e,username,password,newPassword) => {
    if(e) e.preventDefault();

    const response = await fetch('http://169.55.81.216:32000/api/v1/user/'+username+'/reset',{
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({password:password,
                new_password:newPassword})
    });
    const isReset = await response.ok;
    if (isReset) {
      this.redirectToLogin();
    }
  }

  render() {
    return (
        <Router history={this.history}>
          <Switch>
            <Route exact path="/" component={Welcome} />
            <Route path="/login" render={(props) => <Login {...props} login={this.login} />} />
            <Route path="/reset" render={(props) => <Reset {...props} reset={this.reset} />} />
            <Route path="/create" render={(props) => <Create {...props} create={this.create} />} />
            <Route path="/dashboard" render={(props) => <Dashboard {...props} state={this.state} redirectToLogin={this.redirectToLogin} />} />
            <Route component={Error} />
          </Switch>
        </Router>
      );
  }
};

export default App;