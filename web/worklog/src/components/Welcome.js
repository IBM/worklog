import React from "react";
import {NavLink} from "react-router-dom";
import {Button, Container, Row, Col, Card, CardBody} from 'reactstrap';

class Welcome extends React.Component {

	render() {
		return (
			<Container>
				<Row>
					<Col sm={{size: 6, offset: 5}}>
						<h1>Welcome</h1>
					</Col>
				</Row>
				<Row>
					<Col sm={{size: 6, offset: 3}}>
						<Card>
							<CardBody>
								Worklog is an app where you can log different types of days related to working.
								The different types of days include:
								<ul>
									<li>Office</li>
									<li>Remote</li>
									<li>Vacation</li>
									<li>Holidays</li>
									<li>Sick</li>
								</ul>
								<NavLink to="/create" className="float-left" ><Button color="primary">Create Account</Button></NavLink>
								<NavLink to="/login" className="float-right" ><Button color="primary">Login</Button></NavLink>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</Container>
		);
	}
};

export default Welcome;