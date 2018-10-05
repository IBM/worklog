import React from "react";
import {Doughnut} from "react-chartjs-2";
import { Button, Modal, ModalHeader, ModalBody, Card, CardTitle, CardBody, CardHeader, Form, FormGroup, FormFeedback, Label, Input, Container, Row, Col } from 'reactstrap';
import {PacmanLoader} from "react-spinners";

const API_BASE_URL = process.env.REACT_APP_APP_SERVER;

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
			addDayType: "office",
			addDaysValue: 1,
			addLocationValue: "",
			addYearValue: new Date().getFullYear(),
			editDayType: "office",
			editDayValue: 0,
			editLocationValue: "",
			editStartDateMonth: undefined,
			editStartDateDay: undefined,
			editLastDateMonth: undefined,
			editLastDateDay: undefined,
			isAddRemote: false,
			isEditRemote: false,
			addError: false,
			editError: false,
			clicked: "Office",
			modal: false,
			charData:{
				datasets: [{
    				data: [1,1,1,1,1],
    				backgroundColor: ['rgba(255,255,0,0.6)','rgba(0,0,255,0.6)','rgba(0,255,0,0.6)','rgba(255,165,0,0.6)','rgba(255,0,0,0.6)']
    				}],
    			labels: ['Office','Remote','Vacation','Holidays','Sick']
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

		this.handleChange = this.handleChange.bind(this);
		this.toggle = this.toggle.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
	    if (!this.state.session) {
	    	this.props.redirectToLogin();
	    }
  	}

	getData = async (e) => {
	    if(e) e.preventDefault();

	    this.props.updateLoading();

	    const response = await fetch(API_BASE_URL+'/api/v1/user/'+sessionStorage.getItem("user"));
	    const data = await response.json();
	    if ("error" in data) {
	    	if (data["error"] === "Not logged in") {
	    		this.setState({session: false});
	    	}
	    } else {
		    data.sort(function(a,b){
		    	return a.year > b.year;
		    })

		    var remoteData = [];
		    var remoteLabels = [];

		    for (var location in data[data.length-1].remote.locations) {

	   			if ( ! data[data.length-1].remote.locations.hasOwnProperty(location)) {
	      			continue;
	   			}

	   			remoteLabels.push(location);
	   			remoteData.push(data[data.length-1].remote.locations[location]);
			}

		    this.setState({currentIndex: data.length-1, 
		    				data: data,
		    				charData:{
								datasets: [{
				    				data: [data[data.length-1].office,
		    								data[data.length-1].remote.total,
		    								data[data.length-1].vacation,
		    								data[data.length-1].holidays,
		    								data[data.length-1].sick],
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
		this.props.updateLoading();
  	}

  	exportData = (e) => {
  		if(e) e.preventDefault();

  		var allData = ["Year,Office,Remote,Vacation,Holidays,Sick"];

	    this.state.data.map(function(year,i){
	    	allData.push([year.year,year.office,year.remote.total,year.vacation,year.holidays,year.sick].join(","));
	    	return undefined;
	    })

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

  		this.props.updateLoading();

  		const response = await fetch(API_BASE_URL+'/api/v1/user/'
  									+sessionStorage.getItem("user")
  									+'?year='+this.state.addYearValue
  									+'&type='+this.state.addDayType
  									+'&days='+this.state.addDaysValue
  									+'&location='+this.state.addLocationValue,{
      		method: "POST",
      		headers: {
        		"Content-Type": "application/json"
      		}
    	});

    	const status = await response.status;

    	if (status === 200) {
    		this.setState({addError: false});
    		this.getData();
    	} else if (status === 400) {
    		this.setState({addError: true});
    	} else if (status === 403) {
    		this.setState({session: false});
    	}

    	this.props.updateLoading();
  	}

  	editDays = async (e) => {
  		if(e) e.preventDefault();

  		this.toggle();

  		var body = {};
  		var days = this.state.editDayValue;

  		if (this.state.editStartDateMonth && this.state.editStartDateDay) {
  			body["startdate"] = {month: parseInt(this.state.editStartDateMonth, 10),
  								day: parseInt(this.state.editStartDateDay, 10)}
  		}

  		if (this.state.editLastDateMonth && this.state.editLastDateDay) {
  			body["lastdate"] = {month: parseInt(this.state.editLastDateMonth, 10),
  								day: parseInt(this.state.editLastDateDay, 10)}
  		}

  		if (!days) {
  			if (this.state.editDayType === "remote" && this.state.editLocationValue) {
  				days = this.state.data[this.state.currentIndex][this.state.editDayType][this.state.editLocationValue];
  			} else {
  				days = this.state.data[this.state.currentIndex][this.state.editDayType];
  			}
  		}

  		this.props.updateLoading();

  		const response = await fetch(API_BASE_URL+'/api/v1/user/'
  									+sessionStorage.getItem("user")
  									+'?year='+this.state.data[this.state.currentIndex].year
  									+'&type='+this.state.editDayType
  									+'&days='+days
  									+'&location='+this.state.editLocationValue,{
      		method: "PUT",
      		headers: {
        		"Content-Type": "application/json"
      		},
      		body: JSON.stringify(body)
    	});

    	const status = await response.status;

    	if (status === 200) {
    		this.setState({editError: false});
    		this.getData();
    	} else if (status === 400) {
    		this.setState({editError: true});
    	} else if (status === 403) {
    		this.setState({session: false});
    	}

    	this.props.updateLoading();
    	
  	}

  	clickChart = (clickedDay) => {
  		if (clickedDay.length > 0) {
	  		var dayType = clickedDay[0]._model.label.toLowerCase();

	  		var startSplit = this.state.data[this.state.currentIndex].startdate.split(" ");
	  		var lastSplit = this.state.data[this.state.currentIndex].lastdate.split(" ");

	  		var tempStartDate = new Date(startSplit[1] + ' ' + startSplit[2] + ' ' + startSplit[3]);
	  		var tempLastDate = new Date(lastSplit[1] + ' ' + lastSplit[2] + ' ' + lastSplit[3]);

	  		var dayValue = 0;
	  		var isRemote = false;

	  		var location = "";

	  		if (clickedDay[0]._model.label in this.state.data[this.state.currentIndex].remote.locations) {
	  			dayType = "remote";
	  			location = clickedDay[0]._model.label;
	  		}

	  		if (dayType === "remote") {
	  			if (location === "") {
	  				location = this.state.remoteCharData.labels[0];
	  			}
	  			dayValue = this.state.data[this.state.currentIndex][dayType].locations[location];
	  			isRemote = true;
	  		} else {
	  			dayValue = this.state.data[this.state.currentIndex][dayType];
	  			isRemote = false;
	  		}
	  		this.setState({editDayType: dayType,
	  						editDayValue: dayValue,
	  						isEditRemote: isRemote,
	  						editStartDateMonth: tempStartDate.getMonth()+1,
	  						editStartDateDay: tempStartDate.getDate(),
	  						editLastDateMonth: tempLastDate.getMonth()+1,
	  						editLastDateDay: tempLastDate.getDate(),
	  						editLocationValue: location});

	  		this.toggle();
  		}
  	}

  	next = (e) => {
  		if(e) e.preventDefault();

  		var remoteData = [];
	    var remoteLabels = [];

	    for (var location in this.state.data[this.state.currentIndex+1].remote.locations) {

   			if ( ! this.state.data[this.state.currentIndex+1].remote.locations.hasOwnProperty(location)) {
      			continue;
   			}

   			remoteLabels.push(location);
   			remoteData.push(this.state.data[this.state.currentIndex+1].remote.locations[location]);
		}

  		this.setState({currentIndex: this.state.currentIndex+1,
  						charData:{
							datasets: [{
			    				data: [this.state.data[this.state.currentIndex+1].office,
	    								this.state.data[this.state.currentIndex+1].remote.total,
	    								this.state.data[this.state.currentIndex+1].vacation,
	    								this.state.data[this.state.currentIndex+1].holidays,
	    								this.state.data[this.state.currentIndex+1].sick],
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

	    for (var location in this.state.data[this.state.currentIndex-1].remote.locations) {

   			if ( ! this.state.data[this.state.currentIndex-1].remote.locations.hasOwnProperty(location)) {
      			continue;
   			}

   			remoteLabels.push(location);
   			remoteData.push(this.state.data[this.state.currentIndex-1].remote.locations[location]);
		}

  		this.setState({currentIndex: this.state.currentIndex-1,
  						charData:{
							datasets: [{
			    				data: [this.state.data[this.state.currentIndex-1].office,
	    								this.state.data[this.state.currentIndex-1].remote.total,
	    								this.state.data[this.state.currentIndex-1].vacation,
	    								this.state.data[this.state.currentIndex-1].holidays,
	    								this.state.data[this.state.currentIndex-1].sick],
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

  	handleChange(e) {
  		if(e) e.preventDefault();

  		if (e.target.value === "remote") {
  			this.setState({addDayType: e.target.value,
  							isAddRemote: true});
  		} else {
  			this.setState({addDayType: e.target.value,
  							isAddRemote: false});
  		}
  	}

  	toggle() {
    	this.setState({
      		modal: !this.state.modal
    	});
  	}
	
	render() {
		if (this.state.data) {
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
							<Card>
								<CardHeader>
									<Button color="info" disabled={this.state.currentIndex === 0} onClick={this.previous} className="float-left" >&laquo; Previous</Button>
									<Button color="info" disabled={this.state.currentIndex === this.state.data.length-1} onClick={this.next} className="float-right" >Next &raquo;</Button>
								</CardHeader>
								<CardTitle className="text-center">{this.state.data[this.state.currentIndex].startdate} - {this.state.data[this.state.currentIndex].lastdate}</CardTitle>
								<CardBody>
									{this.state.data[this.state.currentIndex].remote.total > 0 ? 
										(<Row>
											<Col sm={{size: 6}}>
												<Doughnut data={this.state.charData} onElementsClick={this.clickChart} />
											</Col>
											<Col sm={{size: 6}}>
												<Doughnut data={this.state.remoteCharData} onElementsClick={this.clickChart} />
											</Col>
										</Row>) : 
										(<Row>
											<Col sm={{size: 6, offset: 3}}>
												<Doughnut data={this.state.charData} onElementsClick={this.clickChart} />
											</Col>
										</Row>)
									}
									<Row>
										<Col>
											<Button color="primary" onClick={this.exportData} className="float-right" >Export Data</Button>
										</Col>
									</Row>
								</CardBody>
							</Card>
						</Col>
					</Row>
					<Row>
						<Col sm={{size: 6, offset: 3}}>
							<Card>
								<CardTitle className="text-center">Add Days</CardTitle>
								<CardBody>
									<Form method="post" onSubmit={this.addDays}>
										<FormGroup>
											<select value={this.state.addDayType} onChange={this.handleChange}>
												<option value="office">Office</option>
												<option value="remote">Remote</option>
												<option value="vacation">Vacation</option>
												<option value="Holidays">Holidays</option>
												<option value="Sick">Sick</option>
											</select><br/>
										</FormGroup>
										<FormGroup>
											<Label>Year:</Label>
											<Input invalid={this.state.addError} type="number" min="1900" max={new Date().getFullYear()} value={this.state.addYearValue} onChange={e => this.setState({addYearValue: e.target.value})} />
										</FormGroup>
										{this.state.isAddRemote ?(<FormGroup>
											<Label>Location:</Label>
											<Input invalid={this.state.addError} type="text" value={this.state.addLocationValue} onChange={e => this.setState({addLocationValue: e.target.value})} />
										</FormGroup>) : ''}
										<FormGroup>
											<Label># of Days:</Label>
											<Input invalid={this.state.addError} type="number" min="1" max="365" value={this.state.addDaysValue} onChange={e => this.setState({addDaysValue: e.target.value})}/>
											<FormFeedback>Invalid parameters</FormFeedback>
										</FormGroup>
										<Button type="submit" color="primary" className="float-right">Add</Button>
									</Form>
								</CardBody>
							</Card>
							<PacmanLoader loading={this.props.state.loading} color='#FFFF00'/>
						</Col>
					</Row>
					<Modal isOpen={this.state.modal} toggle={this.toggle}>
						<ModalBody>
							<ModalHeader>Edit {this.state.editDayType.charAt(0).toUpperCase() + this.state.editDayType.slice(1)} Days</ModalHeader>
							<Form method="post" onSubmit={this.editDays}>
								<FormGroup>
									<h6>Start Date ({this.state.data[this.state.currentIndex].year}):</h6>
									<FormGroup>
										<Label>Month:</Label>
										<Input invalid={this.state.editError} type="number" min="1" max="12" value={this.state.editStartDateMonth} onChange={e => this.setState({editStartDateMonth: e.target.value})}/>
									</FormGroup>
									<FormGroup>
										<Label>Day:</Label>
										<Input invalid={this.state.editError} type="number" min="1" max="31" value={this.state.editStartDateDay} onChange={e => this.setState({editStartDateDay: e.target.value})}/>
									</FormGroup>
								</FormGroup>
								<FormGroup>
									<h6>Last Date ({this.state.data[this.state.currentIndex].year}):</h6>
									<FormGroup>
										<Label>Month:</Label>
										<Input invalid={this.state.editError} type="number" min="1" max="12" value={this.state.editLastDateMonth} onChange={e => this.setState({editLastDateMonth: e.target.value})}/>
									</FormGroup>
									<FormGroup>
										<Label>Day:</Label>
										<Input invalid={this.state.editError} type="number" min="1" max="31" value={this.state.editLastDateDay} onChange={e => this.setState({editLastDateDay: e.target.value})}/>
									</FormGroup>
								</FormGroup>
								{this.state.isEditRemote ?( <FormGroup>
									<Label>Location:</Label>
									<Input invalid={this.state.editError} type="text" value={this.state.editLocationValue} onChange={e => this.setState({editLocationValue: e.target.value})}/>
								</FormGroup> ) : ''}
								<FormGroup>
									<Label># of Days:</Label>
									<Input invalid={this.state.editError} type="number" min="0" max={this.state.editDayValue} value={this.state.editDayValue} onChange={e => this.setState({editDayValue: e.target.value})}/>
									<FormFeedback>Invalid parameters</FormFeedback>
								</FormGroup>
								<Button type="submit" color="primary" >Update</Button>
							</Form>
						</ModalBody>
					</Modal>
				</Container>
			);
		} else {
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
						<Col sm={{size: 5, offset: 5}}>
							<h4>No data to display</h4>
						</Col>
					</Row>
					<Row>
						<Col sm={{size: 6, offset: 3}}>
							<Card>
								<CardTitle className="text-center">Add Days</CardTitle>
								<CardBody>
									<Form method="post" onSubmit={this.addDays}>
										<FormGroup>
											<select value={this.state.addDayType} onChange={this.handleChange}>
												<option value="office">Office</option>
												<option value="remote">Remote</option>
												<option value="vacation">Vacation</option>
												<option value="Holidays">Holidays</option>
												<option value="Sick">Sick</option>
											</select><br/>
										</FormGroup>
										<FormGroup>
											<Label>Year:</Label>
											<Input invalid={this.state.addError} type="number" min="1900" max={new Date().getFullYear()} value={this.state.addYearValue} onChange={e => this.setState({addYearValue: e.target.value})} />
										</FormGroup>
										{this.state.isAddRemote ?(<FormGroup>
											<Label>Location:</Label>
											<Input invalid={this.state.addError} type="text" value={this.state.addLocationValue} onChange={e => this.setState({addLocationValue: e.target.value})} />
										</FormGroup>) : ''}
										<FormGroup>
											<Label># of Days:</Label>
											<Input invalid={this.state.addError} type="number" min="1" max="365" value={this.state.addDaysValue} onChange={e => this.setState({addDaysValue: e.target.value})}/>
											<FormFeedback>Invalid parameters</FormFeedback>
										</FormGroup>
										<Button type="submit" color="primary" className="float-right">Add</Button>
									</Form>
								</CardBody>
							</Card>
							<PacmanLoader loading={this.props.state.loading} color='#FFFF00'/>
						</Col>
					</Row>
				</Container>
			);
		}
	}
};

export default Dashboard;