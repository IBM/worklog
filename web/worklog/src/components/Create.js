import React from "react";
import {NavLink} from "react-router-dom";
import {Button, Form, FormGroup, FormFeedback, Label, Input, Container, Row, Col, Card, CardBody} from "reactstrap";
import {PacmanLoader} from "react-spinners";

class Create extends React.Component {

	constructor(props) {
    	super(props);

    	this.state = {username: '',
    					password: '',
    					passwordConfirm: ''};
	}

	submit = (e) => {
		if(e) e.preventDefault();

		if (this.state.password === this.state.passwordConfirm) {
			this.props.create(e,this.state.username,this.state.password);
		} else {
			this.props.createError();
		}
	}

	render() {
		return (
			<Container>
				<Row>
					<Col sm={{size: 6, offset: 3}}>
						<h1>Create Account</h1>
					</Col>
				</Row>
				<Row>
					<Col sm={{size: 6, offset: 3}}>
						<Card>
							<CardBody>
								<Form method="post" onSubmit={this.submit}>
									<FormGroup>
										<Label>Username:</Label>
										<Input invalid={this.props.state.invalidCreate} type="text" value={this.state.username} onChange={e => this.setState({username: e.target.value})}/>
									</FormGroup>
									<FormGroup>
										<Label>Password:</Label>
										<Input invalid={this.props.state.invalidCreate} type="password" value={this.state.password} onChange={e => this.setState({password: e.target.value})}/>
									</FormGroup>
									<FormGroup>
										<Label>Confirm Password:</Label>
										<Input invalid={this.props.state.invalidCreate} type="password" value={this.state.passwordConfirm} onChange={e => this.setState({passwordConfirm: e.target.value})}/>
										<FormFeedback>Invalid credentials</FormFeedback>
									</FormGroup>
									<NavLink to="/" ><Button color="danger" className="float-left">Cancel</Button></NavLink>
									<Button type="submit" color="primary" className="float-right">Create</Button>
								</Form>
							</CardBody>
						</Card>
						<PacmanLoader loading={this.props.state.loading} color='#FFFF00'/>
					</Col>
				</Row>
			</Container>
		);
	}
};

export default Create;