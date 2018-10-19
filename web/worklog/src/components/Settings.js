import React from "react";
import {NavLink} from "react-router-dom";
import {Container, Row, Col, Nav, Navbar, NavbarBrand, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardTitle, CardBody, Form, FormGroup, Label, Input, Button, Modal, ModalBody} from 'reactstrap';

const API_BASE_URL = process.env.REACT_APP_APP_SERVER;

class Settings extends React.Component {

	constructor(props) {
		super(props);

		var session;

		if (sessionStorage.getItem("session") === "false") {
			session = false;
			this.props.redirectToLogin();
		} else if (sessionStorage.getItem("session") === "true") {
			session = true;
		}

		this.state = {
			session: session,
			dropdownOpen: false,
			deleteModal: false,
			remote: "",
			vacation: "",
			holiday: "",
			sick: "",
			slack: ""
		};

		if (sessionStorage.getItem("session") === "true" && sessionStorage.getItem("user") !== ""){
			this.getSettings();
		}

		this.toggleDropdown = this.toggleDropdown.bind(this);
		this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
	    if (!this.state.session) {
	    	this.props.redirectToLogin();
	    }
  	}

  	getSettings = async (e) => {
	    if(e) e.preventDefault();

	    const response = await fetch(API_BASE_URL+'/api/v1/user/'+sessionStorage.getItem("user")+'/settings');
	    var data = await response.json();
	    if ("error" in data) {
	    	this.setState({session: false});
	    } else {
	    	data = data["settings"];

	    	var remote = "";
	    	var vacation = "";
	    	var holiday = "";
	    	var sick = "";

	    	if (data["total"]["remote"] !== -1) {
	    		remote = data["total"]["remote"];
	    	}

	    	if (data["total"]["vacation"] !== -1) {
	    		vacation = data["total"]["vacation"];
	    	}

	    	if (data["total"]["holiday"] !== -1) {
	    		holiday = data["total"]["holiday"];
	    	}

	    	if (data["total"]["sick"] !== -1) {
	    		sick = data["total"]["sick"];
	    	}

	    	this.setState({remote: remote,
	    					vacation: vacation,
	    					holiday: holiday,
	    					sick: sick,
	    					slack: data["slack"].trim()});
	    }

	}

	toggleDropdown() {
  		this.setState({dropdownOpen: !this.state.dropdownOpen});
  	}

  	toggleDeleteModal() {
  		this.setState({deleteModal: !this.state.deleteModal});
  	}

  	logout = (e) => {
  		if(e) e.preventDefault();

  		this.setState({session: false});
  	}

  	handleUpdate = async (e) => {
  		if(e) e.preventDefault();

  		var remote = this.state.remote;
	    var vacation = this.state.vacation;
	    var holiday = this.state.holiday;
	    var sick = this.state.sick;

  		if (remote === "") {
  			remote = -1;
  		}

  		if (vacation === "") {
  			vacation = -1;
  		}

  		if (holiday === "") {
  			holiday = -1;
  		}

  		if (sick === "") {
  			sick = -1;
  		}

  		const response = await fetch(API_BASE_URL+'/api/v1/user/'+sessionStorage.getItem("user")+'/settings',{
      		method: "PUT",
      		headers: {
		    	"Content-Type": "application/json"
		   	},
		   	body: JSON.stringify({remote: remote,
		                			vacation: vacation,
		                			holiday: holiday,
		                			sick: sick,
		                			slack: this.state.slack.trim()})
    	});

    	const status = await response.status;

    	if (status === 200) {
    		this.props.redirectToDashboard();
    	} else if (status === 403) {
    		this.setState({session: false});
    	}
  	}

  	deleteAccount = async (e) => {
  		if(e) e.preventDefault();

  		this.toggleDeleteModal();

  		const response = await fetch(API_BASE_URL+'/api/v1/user/'
  									+sessionStorage.getItem("user")
  									+'?deleteuser=true',{
	      		method: "DELETE"
	    	});

  		const status = await response.status;

  		if (status === 200 || status === 403) {
  			this.setState({session: false});
  		}
  	}

	render() {
		return (
			<Container fluid={true}>
				<Row>
					<Col>
						<Navbar color="dark" dark expand="md">
							<NavbarBrand href="/dashboard">WorkLog</NavbarBrand>
							<Nav className="ml-auto" navbar>
								<ButtonDropdown nav inNavbar isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown} >
									<DropdownToggle nav caret>{sessionStorage.getItem("user")}</DropdownToggle>
									<DropdownMenu right>
										<NavLink to="/settings"><DropdownItem>Settings</DropdownItem></NavLink>
										<DropdownItem divider />
										<DropdownItem onClick={this.logout}>Logout</DropdownItem>
									</DropdownMenu>
								</ButtonDropdown>
							</Nav>
						</Navbar>
					</Col>
				</Row>
				<Row>
					<Col sm={{size: 6, offset: 3}}>
						<Card>
							<CardTitle className="text-center" style={{fontSize: '200%'}}><b>Settings</b></CardTitle>
							<CardBody>
								<Form method="post" onSubmit={this.handleUpdate}>
									<FormGroup row>
          								<Label for="remote" sm={4}>Remote Days per Year:</Label>
          								<Col sm={2}><Input type="number" min={0} value={this.state.remote} placeholder={this.state.remote} id="remote" onChange={e => this.setState({remote: e.target.value})} /></Col>
        							</FormGroup>
        							<FormGroup row>
          								<Label for="vacation" sm={4}>Vacation Days per Year:</Label>
          								<Col sm={2}><Input type="number" min={0} value={this.vacation} placeholder={this.state.vacation} id="vacation" onChange={e => this.setState({vacation: e.target.value})} /></Col>
        							</FormGroup>
        							<FormGroup row>
          								<Label for="holiday" sm={4}>Holiday Days per Year:</Label>
          								<Col sm={2}><Input type="number" min={0} value={this.holiday} placeholder={this.state.holiday} id="holiday" onChange={e => this.setState({holiday: e.target.value})} /></Col>
        							</FormGroup>
        							<FormGroup row>
          								<Label for="sick" sm={4}>Sick Days per Year:</Label>
          								<Col sm={2}><Input type="number" min={0} value={this.sick} placeholder={this.state.sick} id="sick" onChange={e => this.setState({sick: e.target.value})} /></Col>
        							</FormGroup>
									<FormGroup row>
										<Label for="slack" sm={4}>Slack Webhook URL:</Label>
										<Col sm={7}><Input type="text" id="slack" value={this.state.slack} placeholder={this.state.slack} onChange={e => this.setState({slack: e.target.value})} /></Col>
									</FormGroup>
									<Button type="submit" color="primary" className="float-right" >Update</Button>
									<Button color="danger" onClick={this.toggleDeleteModal}>Delete Account</Button>
								</Form>
							</CardBody>
						</Card>
					</Col>
				</Row>
				<Modal isOpen={this.state.deleteModal} toggle={this.toggleDeleteModal}>
					<ModalBody>
						<div className="text-center">Are you sure you want to delete your account?</div>
						<Button color="danger" onClick={this.deleteAccount} className="float-right">Delete</Button>
						<Button color="warning" onClick={this.toggleDeleteModal} className="float-left">Cancel</Button>
					</ModalBody>
				</Modal>
			</Container>
		);
	}
};

export default Settings;