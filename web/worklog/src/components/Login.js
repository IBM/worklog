import React from "react";
import {NavLink} from "react-router-dom";
import {Button, Form, FormGroup, FormFeedback, Label, Input} from "reactstrap";

class Login extends React.Component {

	constructor(props) {
    	super(props);

    	this.state = {username: '',
    					password: ''};
	}

	submit = (e) => {
		if(e) e.preventDefault();
		this.props.login(e,this.state.username,this.state.password);
	}

	render() {
		return (
			<div>
				<h1>Login</h1>
				<Form method="post" onSubmit={this.submit}>
					<FormGroup>
						<Label>Username:</Label>
						<Input invalid={this.props.state.invalidLogin} type="text" value={this.state.username} onChange={e => this.setState({username: e.target.value})}/>
					</FormGroup>
					<FormGroup>
						<Label>Password:</Label>
						<Input invalid={this.props.state.invalidLogin} type="password" value={this.state.password} onChange={e => this.setState({password: e.target.value})}/>
						<FormFeedback>Invalid credentials</FormFeedback>
					</FormGroup>
					<NavLink to="/" ><Button color="danger">Cancel</Button></NavLink>
					<NavLink to="/reset" ><Button color="primary">Reset Password</Button></NavLink>
					<Button type="submit" color="primary">Login</Button>
				</Form>
			</div>
		);
	}
};

export default Login;