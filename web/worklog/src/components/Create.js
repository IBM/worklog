import React from "react";
import {NavLink} from "react-router-dom";

class Create extends React.Component {

	create = async (e) => {
		if(e) e.preventDefault();
		console.log('Username is ',this.refs.username.value)
		console.log('Password is ',this.refs.password.value)
		console.log(this.props.session)

		await fetch('http://169.55.81.216:32000/api/v1/create',{
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({username:this.refs.username.value,
								password:this.refs.password.value})
		}).then(response => response.json())
		.then(data => console.log(JSON.stringify(data)))
		.catch(error => console.error(error));
	}

	render() {
		return (
			<div>
				<h1>Create Account</h1>
				<form method="post" onSubmit={this.create}>
					Username:<br/>
					<input type="text" name="username"/><br/><br/>
					Password:<br/>
					<input type="password" name="password"/><br/><br/>
					Confirm Password:<br/>
					<input type="password" name="password"/><br/><br/>
					<NavLink to="/" ><button>Cancel</button></NavLink>
					<input type="submit" value="Create"/>
				</form>
			</div>
		);
	}
};

export default Create;