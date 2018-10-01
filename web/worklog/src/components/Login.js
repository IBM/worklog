import React from "react";
import {NavLink} from "react-router-dom";

class Login extends React.Component {

	submit = (e) => {
		if(e) e.preventDefault();
		this.props.login(e,this.refs.username.value,this.refs.password.value);
	}

	render() {
		return (
			<div>
				<h1>Login</h1>
				<form method="post" onSubmit={this.submit}>
					Username:<br/>
					<input type="text" ref="username"/><br/>
					Password:<br/>
					<input type="password" ref="password"/><br/><br/>
					<NavLink to="/" ><button>Cancel</button></NavLink>
					<NavLink to="/reset" ><button>Reset Password</button></NavLink>
					<input type="submit" value="Login"/>
				</form>
				{this.props.state.invalidLogin ? "Invalid Credentials" : ""}
			</div>
		);
	}
};

export default Login;