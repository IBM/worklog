import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Create from "./components/Create";
import Reset from "./components/Reset";
import Dashboard from "./components/Dashboard";
import Error from "./components/Error";

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      session: false,
      user: undefined
    }
    this.login = this.login.bind(this);
  }

  login = async (e,username, password) => {
    if(e) e.preventDefault();
    console.log('Username is ',username)
    console.log('Password is ',password)

    const response = await fetch('http://169.55.81.216:32000/api/v1/login',{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username:username,
                password:password})
    });
    const isLoggedIn = await response.ok;
    this.setState({session:isLoggedIn});
    console.log(this.state);
  }

  render() {
    return (
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={Welcome} />
            <Route path="/login" render={(props) => <Login {...props} login={this.login} seeState={this.seeState} />} />
            <Route path="/reset" component={Reset} />
            <Route path="/create" component={Create} />
            <Route path="/dashboard" component={Dashboard} />
            <Route component={Error} />
          </Switch>
        </BrowserRouter>
      );
  }
};

export default App;