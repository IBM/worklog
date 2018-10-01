import React from "react";
import {Button, Form, FormGroup, FormFeedback, Label, Input} from "reactstrap";

class Reset extends React.Component {

	constructor(props) {
    	super(props);

    	this.state = {username: '',
    					password: '',
    					newPassword: ''};
	}

	submit = (e) => {
		if(e) e.preventDefault();

		this.props.reset(e,this.state.username,this.state.password,this.state.newPassword);

	}

	render() {
		return (
			<div>
				<h1>Reset Password</h1>
				<Form method="post" onSubmit={this.submit}>
					<FormGroup>
						<Label>Username:</Label>
						<Input invalid={this.props.state.invalidReset} type="text" value={this.state.username} onChange={e => this.setState({username: e.target.value})}/>
					</FormGroup>
					<FormGroup>
						<Label>Password:</Label>
						<Input invalid={this.props.state.invalidReset} type="password" value={this.state.password} onChange={e => this.setState({password: e.target.value})}/>
					</FormGroup>
					<FormGroup>
						<Label>New Password:</Label>
						<Input invalid={this.props.state.invalidReset} type="password" value={this.state.newPassword} onChange={e => this.setState({newPassword: e.target.value})}/>
						<FormFeedback>Invalid credentials</FormFeedback>
					</FormGroup>
					<Button onClick={this.props.redirectToLogin} color="danger" >Cancel</Button>
					<Button type="submit" color="primary">Reset</Button>
				</Form>
			</div>
		);
	}
};

export default Reset;