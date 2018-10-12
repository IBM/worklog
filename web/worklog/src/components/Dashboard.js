import React from "react";
import {Doughnut} from "react-chartjs-2";
import { Button, Alert, Card, CardTitle, CardBody, CardHeader, Form, FormGroup, Label, Input, Container, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, Modal, ModalBody, ModalHeader } from 'reactstrap';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import classnames from 'classnames';

import "react-big-calendar/lib/css/react-big-calendar.css";

const API_BASE_URL = process.env.REACT_APP_APP_SERVER;

const localizer = BigCalendar.momentLocalizer(moment);

function getRandomColor(length) {
	var result = [];
    var color = '';
    for (var i = 0; i < length; i++) {
    	color = 'rgba(';
    	for (var j = 0; j < 3; j++ ) {
        	color += Math.floor(Math.random() * 255) +',';
    	}
    	result.push(color+'0.6)');
    }
    return result;
}

function getIndex(value, arr) {
	for(var i = 0; i < arr.length; i++) {
        if(arr[i] === value) {
            return i;
        }
    }
    return -1;
}

class Dashboard extends React.Component {
	constructor(props){
		super(props);

		var session = "";

		if (sessionStorage.getItem("session") === "false") {
			session = false;
			this.props.redirectToLogin();
		} else if (sessionStorage.getItem("session") === "true") {
			session = true;
		}

		this.state = {
			session: session,
			data: undefined,
			hasRemote: false,
			activeTab: '1',
			startdate: new Date(),
			lastdate: new Date(),
			modifyEventDate: "2000-01-01",
			dayType: "office",
			locationValue: "",
			addEventsDates: [new Date()],
			isRemote: false,
			addError: false,
			updateError: false,
			deleteError: false,
			selectionError: false,
			eventModal: false,
			addModal: false,
			events: [],
			charData:{
				datasets: [{
    				data: [1,1,1,1,1],
    				backgroundColor: ['rgba(255,255,0,0.6)','rgba(0,0,255,0.6)','rgba(0,255,0,0.6)','rgba(255,165,0,0.6)','rgba(255,0,0,0.6)']
    				}],
    			labels: ['Office','Remote','Vacation','Holiday','Sick']
			},
			remoteCharData:{
				datasets: [{
    				data: [1,1],
    				backgroundColor: ['rgba(255,255,0,0.6)','rgba(0,0,255,0.6)']
    				}],
    			labels: ['United States','Canada']
			}
		}

		if (sessionStorage.getItem("session") === "true" && sessionStorage.getItem("user") !== ""){
			this.getData();
		}

		this.handleDayType = this.handleDayType.bind(this);
		this.toggleEventModal = this.toggleEventModal.bind(this);
		this.toggleAddModal = this.toggleAddModal.bind(this);
		this.toggleTab = this.toggleTab.bind(this);
		this.onDismiss = this.onDismiss.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
	    if (!this.state.session) {
	    	this.props.redirectToLogin();
	    }
  	}

	getData = async (e) => {
	    if(e) e.preventDefault();

	    const response = await fetch(API_BASE_URL+'/api/v1/user/'+sessionStorage.getItem("user"));
	    var data = await response.json();
	    if ("error" in data) {
	    	if (data["error"] === "Not logged in") {
	    		this.setState({session: false});
	    	} else if (data["error"] === "No data found") {
	    		this.setState({data: undefined,
	    						events: [],
	    						currentIndex: 0,
	    						charData:{
									datasets: [{
					    				data: [1,1,1,1,1],
					    				backgroundColor: ['rgba(255,255,0,0.6)','rgba(0,0,255,0.6)','rgba(0,255,0,0.6)','rgba(255,165,0,0.6)','rgba(255,0,0,0.6)']
					    				}],
					    			labels: ['Office','Remote','Vacation','Holiday','Sick']
								},
								remoteCharData:{
									datasets: [{
					    				data: [1,1],
					    				backgroundColor: ['rgba(255,255,0,0.6)','rgba(0,0,255,0.6)']
					    				}],
					    			labels: ['United States','Canada']
								}});
	    	}
	    } else {
	    	data = data["years"];
		    data.sort(function(a,b){
		    	return a.year > b.year;
		    })

		    var events = [];

		    for (var i = 0; i < data.length; i++) {
		    	for (var j = 0; j < data[i].entries.length; j++) {
		    		var tempdate = new Date(data[i].entries[j].date);
		    		tempdate.setDate(tempdate.getDate()+1);
		    		var title = data[i].entries[j].type;

		    		if (title === "remote") {
		    			title = title + ": " + data[i].entries[j].location
		    		} 

		    		var event = {title: title,
							   	start: tempdate,
							   	end: tempdate,
							   	allDay: true
							   	}
					events.push(event);
		    	}
		    }

		    var remoteData = [];
		    var remoteLabels = [];
		    var office = 0;
		    var remote = 0;
		    var vacation = 0;
		    var holiday = 0;
		    var sick = 0;
		    var hasRemote = false;
		    var startdate = new Date();
		    var lastdate = new Date();

		    for (i = 0; i < data[data.length-1].entries.length; i++) {
		    	if (i === 0) {
		    		startdate = new Date(data[data.length-1].entries[i].date);
		    		lastdate = new Date(data[data.length-1].entries[i].date);
		    	} else {
		    		tempdate = new Date(data[data.length-1].entries[i].date);
		    		if (tempdate < startdate) {
		    			startdate = tempdate;
		    		}
		    		if (tempdate > lastdate) {
		    			lastdate = tempdate;
		    		}
		    	}

	   			if (data[data.length-1].entries[i].hasOwnProperty("location")) {
		      		var index = getIndex(data[data.length-1].entries[i].location,remoteLabels);

		   			if (index === -1) {
		   				remoteLabels.push(data[data.length-1].entries[i].location);
		   				remoteData.push(1);
		   			} else {
		   				remoteData[index] = remoteData[index] + 1;
		   			}

		   			remote = remote + 1;
		   			hasRemote = true;
	   			} else if (data[data.length-1].entries[i].type === "office") {
	   				office = office + 1;
	   			} else if (data[data.length-1].entries[i].type === "vacation") {
	   				vacation = vacation + 1;
	   			} else if (data[data.length-1].entries[i].type === "holiday") {
	   				holiday = holiday + 1;
	   			} else if (data[data.length-1].entries[i].type === "sick") {
	   				sick = sick + 1;
	   			}
			}

			startdate.setDate(startdate.getDate()+1);
			lastdate.setDate(lastdate.getDate()+1);

		    this.setState({currentIndex: data.length-1,
		    				hasRemote: hasRemote, 
		    				startdate: startdate,
		    				lastdate: lastdate,
		    				events: events,
		    				data: data,
		    				charData:{
								datasets: [{
				    				data: [office,
		    								remote,
		    								vacation,
		    								holiday,
		    								sick],
				    				backgroundColor: this.state.charData.datasets[0].backgroundColor
				    				}],
				    			labels: this.state.charData.labels
				    		},
				    		remoteCharData:{
								datasets: [{
				    				data: remoteData,
				    				backgroundColor: getRandomColor(remoteData.length)
				    				}],
				    			labels: remoteLabels
				    		}})
		}
  	}

  	exportData = (e) => {
  		if(e) e.preventDefault();

  		var allData = ["Date,Type,Location"];

  		for (var i = 0; i < this.state.data.length; i++) {
  			for (var j = 0; j < this.state.data[i].entries.length; j++) {
  				if (this.state.data[i].entries[j].hasOwnProperty("location")) {
  					allData.push([this.state.data[i].entries[j].date,this.state.data[i].entries[j].type,this.state.data[i].entries[j].location].join(","));
  				} else {
  					allData.push([this.state.data[i].entries[j].date,this.state.data[i].entries[j].type,""].join(","));
  				}
  			}
  		}

	    var csvFile = new Blob([allData.join("\n")], {type: "text/csv"});

	    var downloadLink = document.createElement("a");

	    downloadLink.download = "worklog.csv";

	    downloadLink.href = window.URL.createObjectURL(csvFile);

	    downloadLink.style.display = "none";

	    document.body.appendChild(downloadLink);

	    downloadLink.click();
  	}

  	addDays = async (e) => {
  		if(e) e.preventDefault();

  		this.toggleAddModal(e);

  		this.setState({addError: false});

  		var response;
  		var status;

  		for (var i = 0; i < this.state.addEventsDates.length; i++) {
	  		response = await fetch(API_BASE_URL+'/api/v1/user/'
	  								+sessionStorage.getItem("user")
	  								+'?date='+this.state.addEventsDates[i].toISOString().substring(0,10)
	  								+'&type='+this.state.dayType
	  								+'&location='+this.state.locationValue,{
	      		method: "POST"
	    	});

	    	status = await response.status;

	    	if (status === 400) {
	    		this.setState({addError: true});
	    	} else if (status === 403) {
	    		this.setState({session: false});
	    		break;
	    	}
    	}

    	if (this.state.session) {
    		this.getData();
    	}
  	}

  	updateEvent = async (e) => {
  		if(e) e.preventDefault();

  		this.toggleEventModal(e);

  		const response = await fetch(API_BASE_URL+'/api/v1/user/'
  									+sessionStorage.getItem("user")
  									+'?date='+this.state.modifyEventDate
  									+'&type='+this.state.dayType
  									+'&location='+this.state.locationValue,{
      		method: "PUT"
    	});

    	const status = await response.status;

    	if (status === 200) {
    		this.setState({updateError: false});
    		this.getData();
    	} else if (status === 400) {
    		this.setState({updateError: true});
    	} else if (status === 403) {
    		this.setState({session: false});
    	}
    	
  	}

  	deleteEvent = async (e) => {
  		if(e) e.preventDefault();

  		this.toggleEventModal(e);

  		const response = await fetch(API_BASE_URL+'/api/v1/user/'
  									+sessionStorage.getItem("user")
  									+'?date='+this.state.modifyEventDate,{
      		method: "DELETE"
    	});

    	const status = await response.status;

    	if (status === 200) {
    		this.setState({deleteError: false});
    		this.getData();
    	} else if (status === 400) {
    		this.setState({deleteError: true});
    	} else if (status === 403) {
    		this.setState({session: false});
    	}
    	
  	}

  	next = (e) => {
  		if(e) e.preventDefault();

  		var remoteData = [];
	    var remoteLabels = [];
	    var office = 0;
		var remote = 0;
		var vacation = 0;
		var holiday = 0;
		var sick = 0;
		var hasRemote = false;
		var startdate = new Date();
		var lastdate = new Date();

		for (var i = 0; i < this.state.data[this.state.currentIndex+1].entries.length; i++) {
		    if (i === 0) {
		    	startdate = new Date(this.state.data[this.state.currentIndex+1].entries[i].date);
		    	lastdate = new Date(this.state.data[this.state.currentIndex+1].entries[i].date);
		    } else {
		    	var tempdate = new Date(this.state.data[this.state.currentIndex+1].entries[i].date);
		    	if (tempdate < startdate) {
		    		startdate = tempdate;
		    	}
		    	if (tempdate > lastdate) {
		    		lastdate = tempdate;
		    	}
		    }

	   		if (this.state.data[this.state.currentIndex+1].entries[i].hasOwnProperty("location")) {
		      	var index = getIndex(this.state.data[this.state.currentIndex+1].entries[i].location,remoteLabels);

		   		if (index === -1) {
		   			remoteLabels.push(this.state.data[this.state.currentIndex+1].entries[i].location);
		   			remoteData.push(1);
		   		} else {
		   			remoteData[index] = remoteData[index] + 1;
		   		}

		   		remote = remote + 1;
		   		hasRemote = true;
	   		} else if (this.state.data[this.state.currentIndex+1].entries[i].type === "office") {
	   			office = office + 1;
	   		} else if (this.state.data[this.state.currentIndex+1].entries[i].type === "vacation") {
	   			vacation = vacation + 1;
	   		} else if (this.state.data[this.state.currentIndex+1].entries[i].type === "holiday") {
	   			holiday = holiday + 1;
	   		} else if (this.state.data[this.state.currentIndex+1].entries[i].type === "sick") {
	   			sick = sick + 1;
	   		}
		}

		startdate.setDate(startdate.getDate()+1);
		lastdate.setDate(lastdate.getDate()+1);

  		this.setState({currentIndex: this.state.currentIndex+1,
  						hasRemote: hasRemote,
  						startdate: startdate,
  						lastdate: lastdate,
  						charData:{
							datasets: [{
			    				data: [office,
	    								remote,
	    								vacation,
	    								holiday,
	    								sick],
			    				backgroundColor: this.state.charData.datasets[0].backgroundColor
			    				}],
			    			labels: this.state.charData.labels
			    		},
			    		remoteCharData:{
							datasets: [{
			    				data: remoteData,
			    				backgroundColor: getRandomColor(remoteData.length)
			    				}],
			    			labels: remoteLabels
			    		}});
  	}

  	previous = (e) => {
  		if(e) e.preventDefault();

  		var remoteData = [];
	    var remoteLabels = [];
	    var office = 0;
		var remote = 0;
		var vacation = 0;
		var holiday = 0;
		var sick = 0;
		var hasRemote = false;
		var startdate = new Date();
		var lastdate = new Date();

		for (var i = 0; i < this.state.data[this.state.currentIndex-1].entries.length; i++) {
		    if (i === 0) {
		    	startdate = new Date(this.state.data[this.state.currentIndex-1].entries[i].date);
		    	lastdate = new Date(this.state.data[this.state.currentIndex-1].entries[i].date);
		    } else {
		    	var tempdate = new Date(this.state.data[this.state.currentIndex-1].entries[i].date);
		    	if (tempdate < startdate) {
		    		startdate = tempdate;
		    	}
		    	if (tempdate > lastdate) {
		    		lastdate = tempdate;
		    	}
		    }

	   		if (this.state.data[this.state.currentIndex-1].entries[i].hasOwnProperty("location")) {
		      	var index = getIndex(this.state.data[this.state.currentIndex-1].entries[i].location,remoteLabels);

		   		if (index === -1) {
		   			remoteLabels.push(this.state.data[this.state.currentIndex-1].entries[i].location);
		   			remoteData.push(1);
		   		} else {
		   			remoteData[index] = remoteData[index] + 1;
		   		}

		   		remote = remote + 1;
		   		hasRemote = true;
	   		} else if (this.state.data[this.state.currentIndex-1].entries[i].type === "office") {
	   			office = office + 1;
	   		} else if (this.state.data[this.state.currentIndex-1].entries[i].type === "vacation") {
	   			vacation = vacation + 1;
	   		} else if (this.state.data[this.state.currentIndex-1].entries[i].type === "holiday") {
	   			holiday = holiday + 1;
	   		} else if (this.state.data[this.state.currentIndex-1].entries[i].type === "sick") {
	   			sick = sick + 1;
	   		}
		}

		startdate.setDate(startdate.getDate()+1);
		lastdate.setDate(lastdate.getDate()+1);

  		this.setState({currentIndex: this.state.currentIndex-1,
  						hasRemote: hasRemote,
  						startdate: startdate,
  						lastdate: lastdate,
  						charData:{
							datasets: [{
			    				data: [office,
	    								remote,
	    								vacation,
	    								holiday,
	    								sick],
			    				backgroundColor: this.state.charData.datasets[0].backgroundColor
			    				}],
			    			labels: this.state.charData.labels
			    		},
			    		remoteCharData:{
							datasets: [{
			    				data: remoteData,
			    				backgroundColor: getRandomColor(remoteData.length)
			    				}],
			    			labels: remoteLabels
			    		}});
  	}

  	logout = (e) => {
  		if(e) e.preventDefault();

  		this.setState({session: false});
  	}

  	toggleTab(tab) {
    	if (this.state.activeTab !== tab) {
      		this.setState({
       			activeTab: tab
     		});
    	}
  	}

  	onDismiss() {
    	this.setState({ selectionError: false,
    					addError: false,
    					updateError: false,
    					deleteError: false
    					});
  	}

  	toggleEventModal(e) {

  		if (e.hasOwnProperty("title")) {
  			if (e.title.indexOf("remote") >= 0) {
  				this.setState({
	  				dayType: "remote",
	  				isRemote: true,
	  				locationValue: e.title.substring(8,e.title.length),
	  				selectionError: false,
	      			eventModal: !this.state.eventModal
	    		});
  			} else {
	  			this.setState({
	  				dayType: e.title,
	  				isRemote: false,
	  				locationValue: "",
	  				selectionError: false,
	      			eventModal: !this.state.eventModal
	    		});
  			}
  		} else {
    		this.setState({
    			selectionError: false,
      			eventModal: !this.state.eventModal
    		});
    	}

    	if (e.hasOwnProperty("start")) {
    		var updatedDay = new Date(e.start.getFullYear(), e.start.getMonth(), e.start.getDate());
    		var dateString = updatedDay.toISOString().substring(0,10);

    		this.setState({
    			selectionError: false,
    			modifyEventDate: dateString
    		});
    	}
  	}

  	toggleAddModal(e) {

  		if (e.hasOwnProperty("start")) {
	  		var tempdate = new Date(e.start.getFullYear(), e.start.getMonth(), e.start.getDate());
	  		var invalid = false;

	  		for (var i = 0; i < e.slots.length; i++) {
	  			for (var j = 0; j < this.state.events.length; j++) {
	  				if (tempdate.getFullYear() === this.state.events[j].start.getFullYear()
	  					&& tempdate.getMonth() === this.state.events[j].start.getMonth()
	  					&& tempdate.getDate() === this.state.events[j].start.getDate()) {
	  					invalid = true;
	  					break;
	  				}
	  			}

	  			if (invalid) {
	  				break;
	  			} else {
	  				tempdate.setDate(tempdate.getDate()+1);
	  			}
	  		}

	  		if (invalid) {
	  			this.setState({selectionError: true, addModal: false});
	  		} else {
	  			this.setState({selectionError: false, addEventsDates: e.slots, addModal: true});
	  		}
	  	} else {
	  		this.setState({addModal: false});
	  	}
  	}

  	handleDayType(e) {
  		if(e) e.preventDefault();

  		if (e.target.value === "remote") {
  			this.setState({dayType: e.target.value,
  							isRemote: true});
  		} else {
  			this.setState({dayType: e.target.value,
  							locationValue: "",
  							isRemote: false});
  		}
  	}

  	eventSetColor(e) {

  		var style = {};

  		if (e.title === "office") {
	  		style = {
	  			backgroundColor: 'rgba(255,255,0,0.6)',
	  			color: 'black'
	  		};
	  	} else if (e.title.indexOf("remote") >= 0) {
	  		style = {
	  			backgroundColor: 'rgba(0,0,255,0.6)',
	  			color: 'black'
	  		};
	  	} else if (e.title === "vacation") {
	  		style = {
	  			backgroundColor: 'rgba(0,255,0,0.6)',
	  			color: 'black'
	  		};
	  	} else if (e.title === "holiday") {
	  		style = {
	  			backgroundColor: 'rgba(255,165,0,0.6)',
	  			color: 'black'
	  		};
	  	} else if (e.title === "sick") {
	  		style = {
	  			backgroundColor: 'rgba(255,0,0,0.6)',
	  			color: 'black'
	  		};
	  	}
  		return {
  			style: style
  		};
  	}
	
	render() {
		return (
			<Container>
				<Row>
					<Col sm={{size: 5, offset: 5}}>
						<h1>Dashboard</h1>
					</Col>
					<Col>
						<Button color="danger" onClick={this.logout} className="float-right">Logout</Button>
					</Col>
				</Row>
				<Row>
					<Col lg={{size: 12}}>
						<Nav tabs>
							<NavItem>
								<NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggleTab('1'); }} >Calendar</NavLink>
							</NavItem>
							<NavItem>
								<NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggleTab('2'); }} >Data</NavLink>
							</NavItem>
						</Nav>
						<TabContent activeTab={this.state.activeTab}>
      						<TabPane tabId="1">
      							<Card>
									<CardBody id="test">
										<Alert color="danger" isOpen={this.state.selectionError} toggle={this.onDismiss}>Invalid selection of Dates: Worklog Event already exists</Alert>
										<Alert color="danger" isOpen={this.state.addError} toggle={this.onDismiss}>Invalid selection of Dates: Worklog Event already exists</Alert>
										<Alert color="danger" isOpen={this.state.updateError} toggle={this.onDismiss}>Invalid selection of Dates: Worklog Event already exists</Alert>
										<Alert color="danger" isOpen={this.state.deleteError} toggle={this.onDismiss}>Invalid selection of Dates: Worklog Event already exists</Alert>
										<BigCalendar
								        	selectable="ignoreEvents"
								          	localizer={localizer}
								          	events={this.state.events}
								          	defaultView={BigCalendar.Views.MONTH}
								          	views={["month"]}
								          	style={{ height: "100vh" }}
								          	onSelectEvent={(this.toggleEventModal)}
								          	onSelectSlot={(this.toggleAddModal)}
								          	eventPropGetter={(this.eventSetColor)}
										/>
									</CardBody>
								</Card>
								<Modal isOpen={this.state.eventModal} toggle={this.toggleEventModal}>
									<ModalHeader>Modify Worklog Event: {this.state.modifyEventDate}</ModalHeader>
									<ModalBody>
										<Form method="post" onSubmit={this.updateEvent}>
											<FormGroup>
												<select value={this.state.dayType} onChange={this.handleDayType}>
													<option value="office">Office</option>
													<option value="remote">Remote</option>
													<option value="vacation">Vacation</option>
													<option value="holiday">Holiday</option>
													<option value="Sick">Sick</option>
												</select>
											</FormGroup>
											{this.state.isRemote ?(<FormGroup>
												<Label>Location:</Label>
												<Input type="text" value={this.state.locationValue} onChange={e => this.setState({LocationValue: e.target.value})} />
											</FormGroup>) : ''}
									        <Button type="submit" color="primary" className="float-right">Update</Button>
									        <Button color="warning" onClick={e => this.setState({eventModal: false})} className="float-left">Cancel</Button>
									        <Button color="danger" onClick={this.deleteEvent} className="float-left">Delete</Button>
										</Form>
									</ModalBody>
								</Modal>
								<Modal isOpen={this.state.addModal} toggle={this.toggleAddModal}>
									<ModalHeader>Add Worklog Event: {this.state.addEventsDates[0].toDateString()} - {this.state.addEventsDates[this.state.addEventsDates.length-1].toDateString()}</ModalHeader>
									<ModalBody>
										<Form method="post" onSubmit={this.addDays}>
											<FormGroup>
												<select value={this.state.dayType} onChange={this.handleDayType}>
													<option value="office">Office</option>
													<option value="remote">Remote</option>
													<option value="vacation">Vacation</option>
													<option value="holiday">Holiday</option>
													<option value="Sick">Sick</option>
												</select>
											</FormGroup>
											{this.state.isRemote ?(<FormGroup>
												<Label>Location:</Label>
												<Input type="text" value={this.state.locationValue} onChange={e => this.setState({locationValue: e.target.value})} />
											</FormGroup>) : ''}
									        <Button type="submit" color="primary" className="float-right">Add</Button>
									        <Button color="warning" onClick={e => this.setState({addModal: false})} className="float-left">Cancel</Button>
										</Form>
									</ModalBody>
								</Modal>
							</TabPane>
							<TabPane tabId="2" active={this.state.data !== undefined ? "true" : "false"} >
								{this.state.data !== undefined ?
									(<Card>
										<CardHeader>
											<Button color="info" disabled={this.state.currentIndex === 0} onClick={this.previous} className="float-left" >&laquo; Previous Year</Button>
											<Button color="info" disabled={this.state.currentIndex === this.state.data.length-1} onClick={this.next} className="float-right" >Next Year &raquo;</Button>
										</CardHeader>
										<CardTitle className="text-center">{this.state.startdate.toDateString()} - {this.state.lastdate.toDateString()}</CardTitle>
										<CardBody>
											{this.state.hasRemote ? 
												(<Row>
													<Col sm={{size: 6}}>
														<Doughnut data={this.state.charData} />
													</Col>
													<Col sm={{size: 6}}>
														<Doughnut data={this.state.remoteCharData} />
													</Col>
												</Row>) : 
												(<Row>
													<Col sm={{size: 6, offset: 3}}>
														<Doughnut data={this.state.charData} />
													</Col>
												</Row>)
											}
											<Row>
												<Col>
													<Button color="primary" onClick={this.exportData} className="float-right" >Export All Data</Button>
												</Col>
											</Row>
										</CardBody>
									</Card>) :
									(<h4>No data to display</h4>)
								}
							</TabPane>
						</TabContent>
					</Col>
				</Row>
			</Container>
		);
	}
};

export default Dashboard;