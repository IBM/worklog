import React from "react";
import {Doughnut} from "react-chartjs-2"

class Dashboard extends React.Component {
	constructor(props){
		super(props);

		if (!this.props.state.session) {
			this.props.redirectToLogin();
		}

		this.state = {
			dayType: "office",
			isRemote: false,
			charData:{
				datasets: [{
    				data: [1,1,1,1,1],
    				backgroundColor: ['rgba(255,255,0,0.6)','rgba(0,0,255,0.6)','rgba(0,255,0,0.6)','rgba(255,165,0,0.6)','rgba(255,0,0,0.6)']
    				}],
    			labels: ['Office','Remote','Vacation','Holidays','Sick']
			}
		}
		this.getData();

		this.handleChange = this.handleChange.bind(this);
	}

	componentDidUpdate(prevProps) {
	    console.log(this.state);
  	}

	getData = async (e) => {
	    if(e) e.preventDefault();

	    const response = await fetch('http://169.55.81.216:32000/api/v1/user/'+this.props.state.user);
	    const data = await response.json();
	    data.sort(function(a,b){
	    	return a.year > b.year;
	    })
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
			    		}})
  	}

  	addDays = async (e) => {
  		if(e) e.preventDefault();

  		var today = new Date();
  		var year = today.getFullYear();

  		const response = await fetch('http://169.55.81.216:32000/api/v1/user/'
  									+this.props.state.user
  									+'?year='+year
  									+'&type='+this.state.dayType
  									+'&days='+this.refs.days.value,{
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

  	clickChart = async (clickedDay) => {
  		console.log(clickedDay[0]._model.label);
  		console.log(this.state.data[this.state.currentIndex].year);
  	}

  	next = (e) => {
  		if(e) e.preventDefault();

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
			    		}});
  	}

  	previous = (e) => {
  		if(e) e.preventDefault();

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
			    		}});
  	}

  	handleChange(e) {
  		if(e) e.preventDefault();

  		if (e.target.value === "remote") {
  			this.setState({dayType: e.target.value,
  							isRemote: true});
  		} else {
  			this.setState({dayType: e.target.value,
  							isRemote: false});
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
					<button>Export Data</button><br/><br/>
					<form method="post" onSubmit={this.addDays}>
						Add Days<br/>
						<select value={this.state.dayType} onChange={this.handleChange}>
							<option value="office">Office</option>
							<option value="remote">Remote</option>
							<option value="vacation">Vacation</option>
							<option value="Holidays">Holidays</option>
							<option value="Sick">Sick</option>
						</select><br/>
						# of Days:<br/>
						<input type="number" min="1" ref="days"/><br/>
						Location:<br/>
						<input type="text" ref="location" disabled={!this.state.isRemote}/>
						<input type="submit" value="Add"/>
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
						<select value={this.state.dayType} onChange={this.handleChange}>
							<option value="office">Office</option>
							<option value="remote">Remote</option>
							<option value="vacation">Vacation</option>
							<option value="Holidays">Holidays</option>
							<option value="Sick">Sick</option>
						</select><br/>
						# of Days:<br/>
						<input type="number" min="1" ref="days"/><br/>
						Location:<br/>
						<input type="text" ref="location" disabled={!this.state.isRemote}/>
						<input type="submit" value="Add"/>
					</form>
				</div>
			);
		}
	}
};

export default Dashboard;