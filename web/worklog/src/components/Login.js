import React from "react";
import {NavLink} from "react-router-dom";
import {Button, Form, FormGroup, FormFeedback, Label, Input, Container, Row, Col, Card, CardBody} from "reactstrap";
import {PacmanLoader} from "react-spinners";

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
			<Container>
				<Row>
					<Col sm={{size: 6, offset: 5}}>
						<h1>Login</h1>
					</Col>
				</Row>
				<Row>
					<Col sm={{size: 6, offset: 3}}>
						<Card>
							<CardBody>
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
									<Button type="submit" color="primary" className="float-right">Login</Button>
									<NavLink to="/" ><Button color="danger">Cancel</Button></NavLink>{' '}
									<NavLink to="/reset" ><Button color="secondary">Reset Password</Button></NavLink>
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

export default Login;