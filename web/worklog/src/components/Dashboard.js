import React from "react";
import {Doughnut} from "react-chartjs-2";
import {NavLink} from "react-router-dom";
import { Button, Alert, Card, CardTitle, CardBody, Form, FormGroup, Label, Input, Container, Row, Col, Nav, Navbar, NavbarBrand, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

import "react-big-calendar/lib/css/react-big-calendar.css";

const API_BASE_URL = process.env.REACT_APP_APP_SERVER;

const localizer = BigCalendar.momentLocalizer(moment);

class Dashboard extends React.Component {
	constructor(props){
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
			data: undefined,
			hasRemote: false,
			hasEvent: false,
			year: (new Date()).getFullYear(),
			dates: [new Date()],
			dayType: "office",
			locationValue: "",
			notes: "",
			isRemote: false,
			addError: false,
			updateError: false,
			deleteError: false,
			selectionError: false,
			dropdownOpen: false,
			remoteTotal: 0,
			vacationTotal: 0,
			holidayTotal: 0,
			sickTotal: 0,
			events: [],
			charData:{
				datasets: [{
    				data: [0,0,0,0,0],
    				backgroundColor: ['rgba(51,153,255,0.6)','rgba(51,0,204,0.6)','rgba(255,204,0,0.6)','rgba(255,51,204,0.6)','rgba(255,0,0,0.6)']
    				}],
    			labels: ['Office','Remote','Vacation','Holiday','Sick']
			},
			remoteCharData:{
				datasets: [{
    				data: [0,0,0,0,0,0],
    				backgroundColor: ['rgba(255,0,0,0.6)','rgba(255,153,51,0.6)','rgba(255,0,204,0.6)','rgba(255,255,51,0.6)','rgba(51,153,255,0.6)','rgba(0,0,204,0.6)']
    				}],
    			labels: ['New York','Toronto','North Dakota','Oregon','Washington','Other']
			}
		}

		if (sessionStorage.getItem("session") === "true" && sessionStorage.getItem("user") !== ""){
			this.getData();
			this.getSettings();
		}

		this.handleDayType = this.handleDayType.bind(this);
		this.onDismiss = this.onDismiss.bind(this);
		this.toggleDropdown = this.toggleDropdown.bind(this);
		this.calNavigate = this.calNavigate.bind(this);
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
	    						charData:{
									datasets: [{
					    				data: [0,0,0,0,0],
					    				backgroundColor: ['rgba(51,153,255,0.6)','rgba(51,0,204,0.6)','rgba(255,204,0,0.6)','rgba(255,51,204,0.6)','rgba(255,0,0,0.6)']
					    				}],
					    			labels: ['Office','Remote','Vacation','Holiday','Sick']
								},
								remoteCharData:{
									datasets: [{
					    				data: [0,0,0,0,0,0],
    									backgroundColor: ['rgba(255,0,0,0.6)','rgba(255,153,51,0.6)','rgba(255,0,204,0.6)','rgba(255,255,51,0.6)','rgba(51,153,255,0.6)','rgba(0,0,204,0.6)']
    								}],
    								labels: ['New York','Toronto','North Dakota','Oregon','Washington','Other']
								}});
	    	}
	    } else {
	    	data = data["years"];
		    data.sort(function(a,b){
		    	return a.year > b.year;
		    })

		    var events = [];
		    var hasEvent = false;

		    for (var i = 0; i < data.length; i++) {
		    	for (var j = 0; j < data[i].entries.length; j++) {
		    		var tempdate = new Date(data[i].entries[j].date);
		    		tempdate.setDate(tempdate.getDate()+1);
		    		var title = data[i].entries[j].type.charAt(0).toUpperCase() + data[i].entries[j].type.slice(1);

		    		if (title === "Remote") {
		    			title = title + ": " + data[i].entries[j].location
		    		} 

		    		var event = {title: title,
							   	start: tempdate,
							   	end: tempdate,
							   	allDay: true,
							   	notes: data[i].entries[j].notes
							   	}
					events.push(event);

					if (tempdate.getFullYear() === this.state.dates[0].getFullYear()
  						&& tempdate.getMonth() === this.state.dates[0].getMonth()
  						&& tempdate.getDate() === this.state.dates[0].getDate()) {
						hasEvent = true;
					}
		    	}
		    }

		    var remoteData = [];
		    var office = 0;
		    var remote = 0;
		    var vacation = 0;
		    var holiday = 0;
		    var sick = 0;
		    var hasRemote = false;
		    var year = this.state.year;
		    var currentIndex;

		    for (i = 0; i < data.length; i++) {
		    	if (year === data[i].year) {
		    		currentIndex = i;
		    		break;
		    	}
		    }

		    if (currentIndex !== undefined) {

			    for (i = 0; i < data[currentIndex].entries.length; i++) {
			    	if (i === 0) {
			    		tempdate = new Date(data[currentIndex].entries[i].date);
			    		year = tempdate.getFullYear();
			    	}

		   			if (data[currentIndex].entries[i].hasOwnProperty("location")) {
			      		var index = -1;

			      		for(j = 0; j < remoteData.length; j++) {
			      			if (data[currentIndex].entries[i].location === remoteData[j].label) {
			      				index = j;
			      				break;
			      			}
			      		}

			   			if (index === -1) {
			   				remoteData.push({data:1,label:data[currentIndex].entries[i].location});
			   			} else {
			   				remoteData[index].data = remoteData[index].data + 1;
			   			}

			   			remote = remote + 1;
			   			hasRemote = true;
		   			} else if (data[currentIndex].entries[i].type === "office") {
		   				office = office + 1;
		   			} else if (data[currentIndex].entries[i].type === "vacation") {
		   				vacation = vacation + 1;
		   			} else if (data[currentIndex].entries[i].type === "holiday") {
		   				holiday = holiday + 1;
		   			} else if (data[currentIndex].entries[i].type === "sick") {
		   				sick = sick + 1;
		   			}
				}

				remoteData.sort(function(a,b){
			    	return a.data < b.data;
			    })

				var remoteTopFiveData = [];
				var remoteTopFiveLabels = [];
				var otherTotal = 0;

				for (i = 0; i < remoteData.length; i++) {
					if (i < 5) {
						remoteTopFiveData.push(remoteData[i].data);
						remoteTopFiveLabels.push(remoteData[i].label);
					} else {
						otherTotal = otherTotal + remoteData[i].data;
					}
				}

				if (remoteData.length > 5) {
					remoteTopFiveData.push(otherTotal);
					remoteTopFiveLabels.push("Other");
				}
			}

		    this.setState({hasRemote: hasRemote, 
		    				year: year,
		    				events: events,
		    				hasEvent: hasEvent,
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
				    				data: remoteTopFiveData,
				    				backgroundColor: this.state.remoteCharData.datasets[0].backgroundColor
				    				}],
				    			labels: remoteTopFiveLabels
				    		}})
		}
  	}

  	getSettings = async () => {

	    const response = await fetch(API_BASE_URL+'/api/v1/user/'+sessionStorage.getItem("user")+'/settings');
	    var data = await response.json();
	    if ("error" in data) {
	    	this.setState({session: false});
	    } else {
	    	this.setState({remoteTotal: data["settings"]["total"]["remote"],
	    					vacationTotal: data["settings"]["total"]["vacation"],
	    					holidayTotal: data["settings"]["total"]["holiday"],
	    					sickTotal: data["settings"]["total"]["sick"]});
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


  	handleUpdate = (e) => {
  		if(e) e.preventDefault();

  		var put = false;

  		for (var i = 0; i < this.state.dates.length; i++) {
  			put = false;
  			for (var j = 0; j < this.state.events.length; j++) {
  				if (this.state.dates[i].getFullYear() === this.state.events[j].start.getFullYear()
  					&& this.state.dates[i].getMonth() === this.state.events[j].start.getMonth()
  					&& this.state.dates[i].getDate() === this.state.events[j].start.getDate()) {
  					this.updateEvent(i,"PUT");
  					put = true;
  					break;
  				}
  			}
  			if (!put) {
  				this.updateEvent(i,"POST");
  			}
  		}
  	}

  	updateEvent = async (index, method) => {

  		const response = await fetch(API_BASE_URL+'/api/v1/user/'
  									+sessionStorage.getItem("user")
  									+'?date='+this.state.dates[index].toISOString().substring(0,10)
  									+'&type='+this.state.dayType
  									+'&location='+this.state.locationValue,{
      		method: method,
      		headers: {
        		"Content-Type": "application/json"
      		},
      		body: JSON.stringify({notes:this.state.notes})
    	});

    	const status = await response.status;

    	if (status === 200) {
    		this.getData();
    		this.getSettings();
    	} else if (status === 400) {
    		if (method === "POST") {
    			this.setState({addError: true});
    		} else if (method === "PUT") {
    			this.setState({updateError: false});
    		}

    		this.getData();
    		this.getSettings();
    	} else if (status === 403) {
    		this.setState({session: false});
    	}
    	
  	}

  	deleteEvent = async (e) => {
  		if(e) e.preventDefault();

  		this.setState({deleteError: false});

  		var response;
  		var status;

  		for (var i = 0; i < this.state.dates.length; i++) {
  			response = await fetch(API_BASE_URL+'/api/v1/user/'
  									+sessionStorage.getItem("user")
  									+'?date='+this.state.dates[i].toISOString().substring(0,10),{
	      		method: "DELETE"
	    	});

	    	status = await response.status;

	    	if (status === 400) {
	    		this.setState({deleteError: true});
	    	} else if (status === 403) {
	    		this.setState({session: false});
	    		break;
	    	}
    	}

    	if (this.state.session) {
    		this.getData();
    		this.getSettings();
    		this.setState({hasEvent: false});
    	}
  	}

  	next = (e) => {

  		var remoteData = [];
	    var office = 0;
		var remote = 0;
		var vacation = 0;
		var holiday = 0;
		var sick = 0;
		var hasRemote = false;
		var year = this.state.year + 1;
		var currentIndex;

		if (e) {
			if (e.hasOwnProperty("year")) {
				year = e.year;
			} else {
				var newDate = new Date(year,this.state.dates[0].getMonth(),this.state.dates[0].getDate());
				this.setState({dates: [newDate]});
			}
		}

		for (var i = 0; i < this.state.data.length; i++) {
	    	if (year === this.state.data[i].year) {
	    		currentIndex = i;
	    		break;
	    	}
	    }

		if (this.state.data && currentIndex < this.state.data.length && currentIndex >= 0) {

			for (i = 0; i < this.state.data[currentIndex].entries.length; i++) {
			    if (this.state.data[currentIndex].entries[i].hasOwnProperty("location")) {
			      	var index = -1;

		      		for(var j = 0; j < remoteData.length; j++) {
		      			if (this.state.data[currentIndex].entries[i].location === remoteData[j].label) {
		      				index = j;
		      				break;
		      			}
		      		}

		   			if (index === -1) {
		   				remoteData.push({data:1,label:this.state.data[currentIndex].entries[i].location});
		   			} else {
		   				remoteData[index].data = remoteData[index].data + 1;
		   			}

			   		remote = remote + 1;
			   		hasRemote = true;
		   		} else if (this.state.data[currentIndex].entries[i].type === "office") {
		   			office = office + 1;
		   		} else if (this.state.data[currentIndex].entries[i].type === "vacation") {
		   			vacation = vacation + 1;
		   		} else if (this.state.data[currentIndex].entries[i].type === "holiday") {
		   			holiday = holiday + 1;
		   		} else if (this.state.data[currentIndex].entries[i].type === "sick") {
		   			sick = sick + 1;
		   		}
			}
		}

		remoteData.sort(function(a,b){
	    	return a.data < b.data;
	    })

		var remoteTopFiveData = [];
		var remoteTopFiveLabels = [];
		var otherTotal = 0;

		for (i = 0; i < remoteData.length; i++) {
			if (i < 5) {
				remoteTopFiveData.push(remoteData[i].data);
				remoteTopFiveLabels.push(remoteData[i].label);
			} else {
				otherTotal = otherTotal + remoteData[i].data;
			}
		}

		if (remoteData.length > 5) {
			remoteTopFiveData.push(otherTotal);
			remoteTopFiveLabels.push("Other");
		}

  		this.setState({hasRemote: hasRemote,
  						year: year,
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
			    				data: remoteTopFiveData,
			    				backgroundColor: this.state.remoteCharData.datasets[0].backgroundColor
			    				}],
			    			labels: remoteTopFiveLabels
			    		}});
  	}

  	previous = (e) => {

  		var remoteData = [];
	    var office = 0;
		var remote = 0;
		var vacation = 0;
		var holiday = 0;
		var sick = 0;
		var hasRemote = false;
		var year = this.state.year - 1;
		var currentIndex;

		if (e) {
			if (e.hasOwnProperty("year")) {
				year = e.year;
			} else {
				var newDate = new Date(year,this.state.dates[0].getMonth(),this.state.dates[0].getDate());
				this.setState({dates: [newDate]});
			}
		}

		for (var i = 0; i < this.state.data.length; i++) {
	    	if (year === this.state.data[i].year) {
	    		currentIndex = i;
	    		break;
	    	}
	    }

		if (this.state.data && currentIndex >= 0 && currentIndex < this.state.data.length) {

			for (i = 0; i < this.state.data[currentIndex].entries.length; i++) {
		   		if (this.state.data[currentIndex].entries[i].hasOwnProperty("location")) {
			      	var index = -1;

		      		for(var j = 0; j < remoteData.length; j++) {
		      			if (this.state.data[currentIndex].entries[i].location === remoteData[j].label) {
		      				index = j;
		      				break;
		      			}
		      		}

		   			if (index === -1) {
		   				remoteData.push({data:1,label:this.state.data[currentIndex].entries[i].location});
		   			} else {
		   				remoteData[index].data = remoteData[index].data + 1;
		   			}

			   		remote = remote + 1;
			   		hasRemote = true;
		   		} else if (this.state.data[currentIndex].entries[i].type === "office") {
		   			office = office + 1;
		   		} else if (this.state.data[currentIndex].entries[i].type === "vacation") {
		   			vacation = vacation + 1;
		   		} else if (this.state.data[currentIndex].entries[i].type === "holiday") {
		   			holiday = holiday + 1;
		   		} else if (this.state.data[currentIndex].entries[i].type === "sick") {
		   			sick = sick + 1;
		   		}
			}

		}

		remoteData.sort(function(a,b){
	    	return a.data < b.data;
	    })

		var remoteTopFiveData = [];
		var remoteTopFiveLabels = [];
		var otherTotal = 0;

		for (i = 0; i < remoteData.length; i++) {
			if (i < 5) {
				remoteTopFiveData.push(remoteData[i].data);
				remoteTopFiveLabels.push(remoteData[i].label);
			} else {
				otherTotal = otherTotal + remoteData[i].data;
			}
		}

		if (remoteData.length > 5) {
			remoteTopFiveData.push(otherTotal);
			remoteTopFiveLabels.push("Other");
		}

  		this.setState({hasRemote: hasRemote,
  						year: year,
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
			    				data: remoteTopFiveData,
			    				backgroundColor: this.state.remoteCharData.datasets[0].backgroundColor
			    				}],
			    			labels: remoteTopFiveLabels
			    		}});
  	}

  	nextDays = (e) => {
  		if(e) e.preventDefault();

  		var nextDays = [];
  		var tempdate;

  		for (var i = 0; i < this.state.dates.length; i++) {
  			tempdate = new Date(this.state.dates[i].getFullYear(),this.state.dates[i].getMonth(),this.state.dates[i].getDate()+1);
  			nextDays.push(tempdate);
  		}

  		this.calNavigate({slots:nextDays});
  	}

  	previousDays = (e) => {
  		if(e) e.preventDefault();
  		
  		var nextDays = [];
  		var tempdate;

  		for (var i = 0; i < this.state.dates.length; i++) {
  			tempdate = new Date(this.state.dates[i].getFullYear(),this.state.dates[i].getMonth(),this.state.dates[i].getDate()-1);
  			nextDays.push(tempdate);
  		}

  		this.calNavigate({slots:nextDays});
  	}

  	logout = (e) => {
  		if(e) e.preventDefault();

  		this.setState({session: false});
  	}

  	onDismiss() {
    	this.setState({ selectionError: false,
    					addError: false,
    					updateError: false,
    					deleteError: false
    					});
  	}

  	toggleDropdown() {
  		this.setState({dropdownOpen: !this.state.dropdownOpen});
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

  		if (e.title === "Office") {
	  		style = {
	  			backgroundColor: 'rgba(51,153,255,0.6)',
	  			color: 'black'
	  		};
	  	} else if (e.title.indexOf("Remote") >= 0) {
	  		style = {
	  			backgroundColor: 'rgba(51,0,204,0.6)',
	  			color: 'black'
	  		};
	  	} else if (e.title === "Vacation") {
	  		style = {
	  			backgroundColor: 'rgba(255,204,0,0.6)',
	  			color: 'black'
	  		};
	  	} else if (e.title === "Holiday") {
	  		style = {
	  			backgroundColor: 'rgba(255,51,204,0.6)',
	  			color: 'black'
	  		};
	  	} else if (e.title === "Sick") {
	  		style = {
	  			backgroundColor: 'rgba(255,0,0,0.6)',
	  			color: 'black'
	  		};
	  	}
  		return {
  			style: style
  		};
  	}

  	calNavigate(newDates) {

  		var dayType = this.state.dayType;
  		var location = this.state.locationValue;
  		var notes = "";
  		var isRemote = this.state.isRemote;
  		var hasEvent = false;

  		if (newDates.hasOwnProperty("slots")) {
  			newDates = newDates.slots;
  		} else if (newDates.hasOwnProperty("start")) {
  			hasEvent = true;
  			if (newDates.title.indexOf("Remote") >= 0) {
				dayType = "remote";
				location = newDates.title.substring(8);
				isRemote = true;
				if (newDates.notes) {
					notes = newDates.notes;
				}
			} else {
				dayType = newDates.title.toLowerCase();
				location = "";
				isRemote = false;
				if (newDates.notes) {
					notes = newDates.notes;
				}
			}
			newDates = [new Date(newDates.start.getFullYear(), newDates.start.getMonth(), newDates.start.getDate())];
  		} else {
  			newDates = [newDates];
  		}

  		for (var i = 0; i < this.state.events.length; i++) {
  			if (!hasEvent){
  				for (var j = 0; j < newDates.length; j++) {
		  			if (this.state.events[i].start.getFullYear() === newDates[j].getFullYear()
		  				&& this.state.events[i].start.getMonth() === newDates[j].getMonth()
		  				&& this.state.events[i].start.getDate() === newDates[j].getDate()) {

		  				hasEvent = true;

		  				if (this.state.events[i].title.indexOf("Remote") >= 0) {
		  					dayType = "remote";
		  					location = this.state.events[i].title.substring(8);
		  					isRemote = true;
		  					notes = this.state.events[i].notes
		  				} else {
		  					dayType = this.state.events[i].title.toLowerCase();
		  					location = "";
		  					isRemote = false;
		  					notes = this.state.events[i].notes
		  				}
		  			}
		  		}
  			}
  		}

  		this.setState({dates: newDates,
  						dayType: dayType,
  						locationValue: location,
  						notes: notes,
  						isRemote: isRemote,
  						hasEvent: hasEvent});

  		if (newDates[0].getFullYear() > this.state.year) {
  			this.next({year: newDates[0].getFullYear()});
  		} else if (newDates[0].getFullYear() < this.state.year) {
  			this.previous({year: newDates[0].getFullYear()});
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
					<Col lg={6}>
						<Card>
							<CardTitle style={{padding: 10}}>
							<Button color="info" onClick={this.nextDays} className="float-right" >&raquo;</Button>
										<Button color="info" onClick={this.previousDays} className="float-left" >&laquo;</Button>
										<div className="text-center" style={{fontSize: '200%'}}><b>{this.state.dates.length > 1 ? this.state.dates[0].toDateString().substring(0,10) + ' - ' + this.state.dates[this.state.dates.length-1].toDateString().substring(0,10) : this.state.dates[0].toDateString().substring(0,10)}</b></div>
							</CardTitle>
							<CardBody id="test">
								<Row style={{marginBottom: 25}}>
									<Col>
										
										<Form method="post" onSubmit={this.handleUpdate}>
											<FormGroup row>
												<Label for="type" sm={2}>Type:</Label><br/>
												<select style={{width: "125px"}} id="type" value={this.state.dayType} onChange={this.handleDayType}>
													<option value="office">Office</option>
													<option value="remote">Remote</option>
													<option value="vacation">Vacation</option>
													<option value="holiday">Holiday</option>
													<option value="sick">Sick</option>
												</select>
											</FormGroup>
											<FormGroup row>
												<Label for="location" sm={2}>Location:</Label>
												<Col sm={5}><Input id="location" type="text" disabled={!this.state.isRemote} value={this.state.locationValue} onChange={e => this.setState({locationValue: e.target.value})} /></Col>
											</FormGroup>
											<FormGroup row>
												<Label for="notes" sm={2}>Notes:</Label>
												<Col sm={5}><Input id="notes" type="text" value={this.state.notes} onChange={e => this.setState({notes: e.target.value})} /></Col>
											</FormGroup>
									        <Button outline type="submit" color="primary" className="float-right" >Update</Button>
									        <Button outline disabled={!this.state.hasEvent} color="danger" onClick={this.deleteEvent} className="float-right" style={{marginRight:10}} >Delete</Button>
										</Form>
									</Col>
								</Row>
								<Row>
									<Col>
										<Alert color="danger" isOpen={this.state.selectionError} toggle={this.onDismiss}>Invalid selection of Dates: Worklog Event already exists</Alert>
										<Alert color="danger" isOpen={this.state.addError} toggle={this.onDismiss}>Invalid selection of Dates: Worklog Event already exists</Alert>
										<Alert color="danger" isOpen={this.state.updateError} toggle={this.onDismiss}>Invalid selection of Dates: Worklog Event already exists</Alert>
										<Alert color="danger" isOpen={this.state.deleteError} toggle={this.onDismiss}>Invalid selection of Dates: Worklog Event already exists</Alert>
										<BigCalendar
											date={this.state.dates[0]}
											onNavigate={(this.calNavigate)}
								        	selectable="ignoreEvents"
								          	localizer={localizer}
								          	events={this.state.events}
								          	defaultView={BigCalendar.Views.MONTH}
								          	views={["month"]}
								          	style={{ height: "50vh" }}
								          	onSelectEvent={(this.calNavigate)}
								          	onSelectSlot={(this.calNavigate)}
								          	eventPropGetter={(this.eventSetColor)}
										/>
									</Col>
								</Row>
							</CardBody>
						</Card>
					</Col>
					<Col lg={6}>
						<Card>
							<CardTitle style={{padding: 10}} className="text-center">
								<Button color="info" onClick={this.previous} className="float-left" >&laquo;</Button>
								<Button color="info" onClick={this.next} className="float-right" >&raquo;</Button>
								<div style={{fontSize: '200%'}}><b>{this.state.year}</b></div>
							</CardTitle>
							<CardBody>
								{this.state.remoteTotal > 0 ? 
								(<Row>
									<Col>
										<div style={{fontSize: '200%'}}><b>{this.state.remoteTotal - this.state.charData.datasets[0].data[1] < 0 ? 0 : this.state.remoteTotal - this.state.charData.datasets[0].data[1]}</b> Remote days remaining</div>
									</Col>
								</Row>)
								: ''}
								{this.state.vacationTotal > 0 ? 
								(<Row>
									<Col>
										<div style={{fontSize: '200%'}}><b>{this.state.vacationTotal - this.state.charData.datasets[0].data[2] < 0 ? 0 : this.state.vacationTotal - this.state.charData.datasets[0].data[2]}</b> Vacation days remaining</div>
									</Col>
								</Row>)
								: ''}
								{this.state.holidayTotal > 0 ? 
								(<Row>
									<Col>
										<div style={{fontSize: '200%'}}><b>{this.state.holidayTotal - this.state.charData.datasets[0].data[3] < 0 ? 0 : this.state.holidayTotal - this.state.charData.datasets[0].data[3]}</b> Holiday days remaining</div>
									</Col>
								</Row>)
								: ''}
								{this.state.sickTotal > 0 ? 
								(<Row>
									<Col>
										<div style={{fontSize: '200%'}}><b>{this.state.sickTotal - this.state.charData.datasets[0].data[4] < 0 ? 0 : this.state.sickTotal - this.state.charData.datasets[0].data[4]}</b> Sick days remaining</div>
									</Col>
								</Row>)
								: ''}
								<Row>
									<Col>
										<div style={{fontSize: '200%'}}><b>{this.state.charData.datasets[0].data[0]}</b></div>
										<div>
											Office Days Worked
										</div>
									</Col>
									<Col>
										<div style={{fontSize: '200%'}}><b>{this.state.charData.datasets[0].data[1]}</b></div>
										<div>
											Remote Days Worked
										</div>
									</Col>
									<Col>
										<div style={{fontSize: '200%'}}><b>{this.state.charData.datasets[0].data[2]}</b></div>
										<div>
											Vacation Days
										</div>
									</Col>
									<Col>
										<div style={{fontSize: '200%'}}><b>{this.state.charData.datasets[0].data[3]}</b></div>
										<div>
											Holidays
										</div>
									</Col>
									<Col>
										<div style={{fontSize: '200%'}}><b>{this.state.charData.datasets[0].data[4]}</b></div>
										<div>
											Sick Days
										</div>
									</Col>
								</Row>
								{this.state.hasRemote ? 
									(<Row>
										<Col lg={{size: 6}}>
											<Doughnut data={this.state.charData} />
										</Col>
										<Col lg={{size: 6}}>
											<Doughnut data={this.state.remoteCharData} />
										</Col>
									</Row>) : 
									(<Row>
										<Col lg={{size: 6}}>
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
						</Card>
					</Col>
				</Row>
			</Container>
		);
	}
};

export default Dashboard;