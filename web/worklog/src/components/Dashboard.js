import React from "react";
import {Doughnut} from "react-chartjs-2"


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
			addDayType: "office",
			editDayType: "office",
			editDayValue: 0,
			isAddRemote: false,
			isEditRemote: false,
			clicked: "Office",
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
	}

	componentDidUpdate(prevProps, prevState) {
	    console.log(this.state);
  	}

	getData = async (e) => {
	    if(e) e.preventDefault();

	    const response = await fetch('http://169.55.81.216:32000/api/v1/user/'+this.props.state.user);
	    const data = await response.json();
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

  	addDays = async (e) => {
  		if(e) e.preventDefault();

  		var today = new Date();
  		var year = today.getFullYear();

  		const response = await fetch('http://169.55.81.216:32000/api/v1/user/'
  									+this.props.state.user
  									+'?year='+year
  									+'&type='+this.state.addDayType
  									+'&days='+this.refs.addDays.value,{
      		method: "POST",
      		headers: {
        		"Content-Type": "application/json"
      		}
    	});

    	const daysAdded = await response.ok;

    	if (daysAdded) {
    		this.getData();
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
  			if (this.state.editDayType === "remote" && this.refs.location.value) {
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
  									+'&location='+this.refs.location.value,{
      		method: "PUT",
      		headers: {
        		"Content-Type": "application/json"
      		},
      		body: JSON.stringify(body)
    	});

    	const daysEdited = await response.ok;

    	if (daysEdited) {
    		this.getData();
    	}
  	}

  	clickChart = (clickedDay) => {
  		var dayType = clickedDay[0]._model.label.toLowerCase();

  		if (dayType === "remote") {
  			var dayValue = this.state.data[this.state.currentIndex][clickedDay[0]._model.label.toLowerCase()].total;
  			var isRemote = true;
  		} else {
  			var dayValue = this.state.data[this.state.currentIndex][clickedDay[0]._model.label.toLowerCase()];
  			var isRemote = false;
  		}
  		this.setState({editDayType: dayType,
  						editDayValue: dayValue,
  						isEditRemote: isRemote});
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
	
	render() {
		if (this.state.data) {
			return (
				<div>
					<h1>Dashboard</h1>
					<button disabled={this.state.currentIndex === 0} onClick={this.previous} >&laquo; Previous</button>
					<button disabled={this.state.currentIndex === this.state.data.length-1} onClick={this.next} >Next &raquo;</button>
					<br/>
					<h4>{this.state.data[this.state.currentIndex].startdate} - {this.state.data[this.state.currentIndex].lastdate}</h4>
					<Doughnut data={this.state.charData} onElementsClick={this.clickChart} />
					<h5>Remote Locations</h5>
					<Doughnut data={this.state.remoteCharData} />
					<button>Export Data</button><br/><br/>
					<form method="post" onSubmit={this.addDays}>
						Add Days<br/>
						<select value={this.state.addDayType} onChange={this.handleChange}>
							<option value="office">Office</option>
							<option value="remote">Remote</option>
							<option value="vacation">Vacation</option>
							<option value="Holidays">Holidays</option>
							<option value="Sick">Sick</option>
						</select><br/>
						# of Days:<br/>
						<input type="number" min="1" max="365" ref="addDays"/><br/>
						Location:<br/>
						<input type="text" ref="location" disabled={!this.state.isAddRemote}/>
						<input type="submit" value="Add"/>
					</form><br/><br/>
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
						<input type="text" ref="location" disabled={!this.state.isEditRemote}/>
						<input type="submit" value="Update"/>
					</form>
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
						<input type="submit" value="Add"/>
					</form>
				</div>
			);
		}
	}
};

export default Dashboard;