import React from "react";
import {Doughnut} from "react-chartjs-2"

class Dashboard extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			charData:{
				datasets: [{
    				data: [10,20,30],
    				backgroundColor: ['rgba(255,0,0,0.6)','rgba(255,255,0,0.6)','rgba(0,0,255,0.6)']
    				}],
    			labels: ['Vacation','Remote','Office']
			}
		}
	}
	
	render() {
		return (
			<div>
				<h1>Dashboard</h1>
				<button>&laquo; Previous</button>
				<button>Next &raquo;</button>
				<br/>
				<h4>1/1/2018 - 9/1/2018</h4>
				<Doughnut data={this.state.charData} />
				<button>Export Data</button>
			</div>
		);
	}
};

export default Dashboard;