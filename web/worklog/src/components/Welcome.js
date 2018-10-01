import React from "react";
import {NavLink} from "react-router-dom";
import {Button} from 'reactstrap';

class Welcome extends React.Component {

	render() {
		return (
			<div>
				<h1>Welcome</h1>
				<p>Description of features</p>
				<NavLink to="/create" ><Button color="primary">Create Account</Button></NavLink>
				{' '}
				<NavLink to="/login" ><Button color="primary">Login</Button></NavLink>
			</div>
		);
	}
};

export default Welcome;