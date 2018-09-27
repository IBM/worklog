import React from "react";
import {NavLink} from "react-router-dom";

class Reset extends React.Component {

	submit = (e) => {
		if(e) e.preventDefault();

		this.props.reset(e,this.refs.username.value,this.refs.password.value,this.refs.newPassword.value);

	}

	render() {
		return (
			<div>
				<h1>Reset Password</h1>
				<form method="post" onSubmit={this.submit}>
					Username:<br/>
					<input type="text" ref="username"/><br/><br/>
					Password:<br/>
					<input type="password" ref="password"/><br/><br/>
					New Password:<br/>
					<input type="password" ref="newPassword"/><br/><br/>
					<NavLink to="/login" ><button>Cancel</button></NavLink>
					<input type="submit" value="Reset"/>
				</form>
			</div>
		);
	}
};

export default Reset;