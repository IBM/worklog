import React from "react";

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
					<button onClick={this.props.redirectToLogin} >Cancel</button>
					<input type="submit" value="Reset"/>
				</form>
				{this.props.state.invalidReset ? "Invalid Credentials" : ""}
			</div>
		);
	}
};

export default Reset;