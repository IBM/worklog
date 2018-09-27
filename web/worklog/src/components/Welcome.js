import React from "react";
import {NavLink} from "react-router-dom";

class Welcome extends React.Component {

	render() {
		return (
			<div>
				<h1>Welcome</h1>
				<p>Description of features</p>
				<NavLink to="/create" ><button>Create Account</button></NavLink>
				<NavLink to="/login" ><button>Login</button></NavLink>
			</div>
		);
	}
};

export default Welcome;