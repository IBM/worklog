import React from "react";
import {NavLink} from "react-router-dom";

class Reset extends React.Component {
	render() {
		return (
			<div>
				<h1>Reset Password</h1>
				<form method="post">
					Username:<br/>
					<input type="text" name="username"/><br/><br/>
					Password:<br/>
					<input type="password" name="password"/><br/><br/>
					New Password:<br/>
					<input type="password" name="password"/><br/><br/>
					<NavLink to="/login" ><button>Cancel</button></NavLink>
					<input type="submit" value="Reset"/>
				</form>
			</div>
		);
	}
};

export default Reset;