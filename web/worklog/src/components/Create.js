import React from "react";
import {NavLink} from "react-router-dom";

class Create extends React.Component {

	constructor(props) {
    	super(props);

    	this.state = {error:undefined};
	}

	submit = (e) => {
		if(e) e.preventDefault();

		if (this.refs.password.value === this.refs.passwordConfirm.value) {
			this.props.create(e,this.refs.username.value,this.refs.password.value);
		} else {
			this.setState({error:<h5>Invalid credentials</h5>});
		}
	}

	render() {
		return (
			<div>
				<h1>Create Account</h1>
				<form method="post" onSubmit={this.submit}>
					Username:<br/>
					<input type="text" ref="username"/><br/><br/>
					Password:<br/>
					<input type="password" ref="password"/><br/><br/>
					Confirm Password:<br/>
					<input type="password" ref="passwordConfirm"/><br/><br/>
					<NavLink to="/" ><button>Cancel</button></NavLink>
					<input type="submit" value="Create"/>
				</form>
				{this.state.error}
			</div>
		);
	}
};

export default Create;