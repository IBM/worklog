import React from "react";
import {Doughnut} from "react-chartjs-2";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


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

		if (!this.props.state.session) {
			this.props.redirectToLogin();
		}

		this.state = {
			session: this.props.state.session,
			addDayType: "office",
			editDayType: "office",
			editDayValue: 0,
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
		this.getData();

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

	    const response = await fetch('http://169.55.81.216:32000/api/v1/user/'+this.props.state.user);
	    const data = await response.json();
	    if ("error" in data) {
	    	this.setState({session: false});
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
  	}

  	exportData = (e) => {
  		if(e) e.preventDefault();

  		var allData = ["Year,Office,Remote,Vacation,Holidays,Sick"];

	    {this.state.data.map(function(year,i){
	    	allData.push([year.year,year.office,year.remote.total,year.vacation,year.holidays,year.sick].join(","));
	    })}

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

  		var today = new Date();
  		var year = today.getFullYear();

  		if (this.refs.addYear.value) {
  			year = this.refs.addYear.value;
  		}

  		const response = await fetch('http://169.55.81.216:32000/api/v1/user/'
  									+this.props.state.user
  									+'?year='+year
  									+'&type='+this.state.addDayType
  									+'&days='+this.refs.addDays.value
  									+'&location='+this.refs.addLocation.value,{
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
  	}

  	editDays = async (e) => {
  		if(e) e.preventDefault();

  		var body = {};
  		var days = this.refs.editDays.value;

  		if (this.refs.startDateMonth.value && this.refs.startDateDay.value) {
  			body["startdate"] = {month: parseInt(this.refs.startDateMonth.value),
  								day: parseInt(this.refs.startDateDay.value)}
  		}

  		if (this.refs.lastDateMonth.value && this.refs.lastDateDay.value) {
  			body["lastdate"] = {month: parseInt(this.refs.lastDateMonth.value),
  								day: parseInt(this.refs.lastDateDay.value)}
  		}

  		if (!days) {
  			if (this.state.editDayType === "remote" && this.refs.editLocation.value) {
  				days = this.state.data[this.state.currentIndex][this.state.editDayType][this.refs.location.value];
  			} else {
  				days = this.state.data[this.state.currentIndex][this.state.editDayType];
  			}
  		}

  		const response = await fetch('http://169.55.81.216:32000/api/v1/user/'
  									+this.props.state.user
  									+'?year='+this.state.data[this.state.currentIndex].year
  									+'&type='+this.state.editDayType
  									+'&days='+days
  									+'&location='+this.refs.editLocation.value,{
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
    	
  	}

  	clickChart = (clickedDay) => {
  		var dayType = clickedDay[0]._model.label.toLowerCase();

  		var dayValue = 0;
  		var isRemote = false;

  		if (dayType === "remote") {
  			dayValue = this.state.data[this.state.currentIndex][clickedDay[0]._model.label.toLowerCase()].total;
  			isRemote = true;
  		} else {
  			dayValue = this.state.data[this.state.currentIndex][clickedDay[0]._model.label.toLowerCase()];
  			isRemote = false;
  		}
  		this.setState({editDayType: dayType,
  						editDayValue: dayValue,
  						isEditRemote: isRemote});

  		this.toggle();
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
				<div>
					<h1>Dashboard</h1>
					<Button color="danger" onClick={this.logout} >Logout</Button><br/>
					<Button color="info" disabled={this.state.currentIndex === 0} onClick={this.previous} >&laquo; Previous</Button>
					<Button color="info" disabled={this.state.currentIndex === this.state.data.length-1} onClick={this.next} >Next &raquo;</Button>
					<br/>
					<h4>{this.state.data[this.state.currentIndex].startdate} - {this.state.data[this.state.currentIndex].lastdate}</h4>
					<Doughnut data={this.state.charData} onElementsClick={this.clickChart} />
					{this.state.data[this.state.currentIndex].remote.total > 0 ? 
						(<div>
							<h5>Remote Locations</h5>
							<Doughnut data={this.state.remoteCharData} />
						</div>
						) : ''
					}
					<Button color="primary" onClick={this.exportData} >Export Data</Button><br/><br/>
					<form method="post" onSubmit={this.addDays}>
						Add Days<br/>
						<select value={this.state.addDayType} onChange={this.handleChange}>
							<option value="office">Office</option>
							<option value="remote">Remote</option>
							<option value="vacation">Vacation</option>
							<option value="Holidays">Holidays</option>
							<option value="Sick">Sick</option>
						</select><br/>
						Year:<br/>
						<input type="number" min="1900" max={new Date().getFullYear()} ref="addYear" /><br/>
						# of Days:<br/>
						<input type="number" min="1" max="365" ref="addDays"/><br/>
						Location:<br/>
						<input type="text" ref="addLocation" disabled={!this.state.isAddRemote}/>
						<input type="submit" value="Add"/><br/>
						{this.state.addError ? 'Invalid Parameters':''}
					</form><br/><br/>
					<Modal isOpen={this.state.modal} toggle={this.toggle}>
						<ModalBody>
							<form method="post" onSubmit={this.editDays}>
								Edit {this.state.editDayType.charAt(0).toUpperCase() + this.state.editDayType.slice(1)} Days<br/>
								Start Date ({this.state.data[this.state.currentIndex].year}):<br/>
								Month: <input type="number" min="1" max="12" ref="startDateMonth"/>
								Day: <input type="number" min="1" max="31" ref="startDateDay"/><br/>
								Last Date ({this.state.data[this.state.currentIndex].year}):<br/>
								Month: <input type="number" min="1" max="12" ref="lastDateMonth"/>
								Day: <input type="number" min="1" max="31" ref="lastDateDay"/><br/>
								# of Days:<br/>
								<input type="number" min="0" max={this.state.editDayValue} ref="editDays"/><br/>
								Location:<br/>
								<input type="text" ref="editLocation" disabled={!this.state.isEditRemote}/>
								<input type="submit" value="Update"/><br/>
								{this.state.editError ? 'Invalid Parameters':''}
							</form>
						</ModalBody>
					</Modal>
				</div>
			);
		} else {
			return (
				<div>
					<h1>Dashboard</h1>
					<h4>No data to display</h4>
					<form method="post" onSubmit={this.addDays}>
						Add Days
						<select value={this.state.addDayType} onChange={this.handleChange}>
							<option value="office">Office</option>
							<option value="remote">Remote</option>
							<option value="vacation">Vacation</option>
							<option value="Holidays">Holidays</option>
							<option value="Sick">Sick</option>
						</select><br/>
						# of Days:<br/>
						<input type="number" min="1" ref="days"/><br/>
						Location:<br/>
						<input type="text" ref="location" disabled={!this.state.isAddRemote}/>
						<input type="submit" value="Add"/><br/>
						{this.state.addError ? 'Invalid Parameters':''}
					</form>
				</div>
			);
		}
	}
};

export default Dashboard;