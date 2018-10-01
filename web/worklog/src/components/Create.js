import React from "react";
import {NavLink} from "react-router-dom";
import {Button, Form, FormGroup, FormFeedback, Label, Input} from "reactstrap";

class Create extends React.Component {

	constructor(props) {
    	super(props);

    	this.state = {error: false,
    					username: '',
    					password: '',
    					passwordConfirm: ''};
	}

	submit = (e) => {
		if(e) e.preventDefault();

		if (this.state.password === this.state.passwordConfirm) {
			this.setState({error: undefined});
			this.props.create(e,this.state.username,this.state.password);
		} else {
			this.setState({error: true});
		}
	}

	render() {
		return (
			<div>
				<h1>Create Account</h1>
				<Form method="post" onSubmit={this.submit}>
					<FormGroup>
						<Label>Username:</Label>
						<Input type="text" value={this.state.username} onChange={e => this.setState({username: e.target.value})}/>
					</FormGroup>
					<FormGroup>
						<Label>Password:</Label>
						<Input invalid={this.state.error} type="password" value={this.state.password} onChange={e => this.setState({password: e.target.value})}/>
					</FormGroup>
					<FormGroup>
						<Label>Confirm Password:</Label>
						<Input invalid={this.state.error} type="password" value={this.state.passwordConfirm} onChange={e => this.setState({passwordConfirm: e.target.value})}/>
						<FormFeedback>Invalid credentials</FormFeedback>
					</FormGroup>
					<NavLink to="/" ><Button color="danger">Cancel</Button></NavLink>
					<Button type="submit" color="primary">Create</Button>
				</Form>
			</div>
		);
	}
};

export default Create;