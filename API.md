### Table of Contents

* [Users](#users)
	* [Login](#login)
	* [Create User](#create-user)
	* [Reset Password](#reset-password)
	* [Delete User](#delete-user)
* [Work Log Data](#work-log-data)
	* [View All Work Log Data](#view-all-work-log-data)
	* [Delete All Work Log Data](#delete-all-work-log-data)
* [Year](#year)
	* [View Work Log in a Given Year](#view-work-log-in-a-given-year)
	* [Delete Work Log Data for a Given Year](#delete-work-log-data-for-a-given-year)
* [Entry](#entry)
	* [View Entry](#view-entry)
	* [Add Entry](#add-entry)
	* [Update Entry](#update-entry)
	* [Delete Entry](#delete-entry)


# Users

This application supports multiple users. Each user is a document in the database that requires a username and password.

## Login

Users must login in order to view and modify there own respective work log. Once a user is logged in, they have a 20 minute session before being logged out.

__Command__

```
curl http://localhost:5000/api/v1/login -H "Content-Type: application/json" -X POST -d '{"username": "<user>","password": "<password>"}'
```

User = Username for user.

Password = Password for user.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing a success message.

Not Logged In: When the user specified is not a valid username and/or the password specified is not valid/correct, the response is a 400 status code. The response body is a JSON object containing an error message.

## Create User

A user must be created in order to use this application. The account information needed is a username and a password.

__Command__

```
curl http://localhost:5000/api/v1/user/create -H "Content-Type: application/json" -X PUT -d '{"username": "<user>","password": "<password>"}'
```

User = Username for user.

Password = Password for user.

__Response__

Success: The response is a 200 status code. The response body is a JSON object contianing a success message.

User Already Exists: When the user specified is already a valid user in the database, the response is a 400 status code. The response body is a JSON object containing an error message.

User Not Created: When the user specified is not a valid username and/or the password specified is not valid, the response is a 400 status code. The response body is a JSON object containing an error message.

## Reset Password

Users have the ability to reset their password.

__Command__

```
curl http://localhost:5000/api/v1/user/<user>/reset -H "Content-Type: application/json" -X PUT -d '{"new_password": <newpassword>, "password": <password>}'
```

User = Username for user.

Password = Current password for user.

NewPassword = New password for user.

__Response__

Success: The response is a 200 status code. The response body is a JSON object contianing a success message.

Password Not Reset: When the user specified is not a valid username and/or the password specified is not valid/correct, the response is a 403 status code. The response body is a JSON object containing an error message.

## Delete User

A user can be deleted from the database.

__Command__

```
curl http://localhost:5000/api/v1/user/<user>?deleteuser=true -X DELETE
```

User = Username for user.

__Response__

Success: The response is a 200 status code. The response body is a JSON object contianing a success message.

User Not Deleted: If the specified user is not deleted, the response is a 404 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

# Work Log Data

Each user has a document in the database that stores all of their associated work log information. The data being stored is:

```
{
	"_id": ObjectId,
	"years":	[
					{
						"year": Integer,
						"entries": [
								{
									"date": String,
									"type": String,
									"location": String
								}
							]
					}
				]
}
```

Visit [Entry](#entry) to see more information about the entry structure.

## View All Work Log Data

__Command__

```
curl http://localhost:5000/api/v1/user/<user>
```

User = Username for user.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing all of the logged information for a user.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.


## Delete All Work Log Data

__Command__

```
curl  http://localhost:5000/api/v1/user/<user>?deleteall=true -X DELETE
```

User = Username for user.

__Response__

Success: The response is a 200 status code. The response body is a JSON object contianing a success message.

Work Log Data Not Deleted: When there is no data to delete, the response is a 404 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

# Year

Each year is a document in a years list located in each user's unique document in the database that contains the following information:

```
{
	"year": Integer,
	"entries": [
					{
						"date": String,
						"type": String,
						"location": String
					}
				]
}
```

Visit [Entry](#entry) to see more information about the entry structure.

## View Work Log in a Given Year

__Command__

```
curl http://localhost:5000/api/v1/user/<user>?year=<year>
```

User = Username for user.

Year = Year to view.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing all of the logged information about a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object containing an error message.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Delete Work Log Data for a Given Year

__Command__

```
curl http://localhost:5000/api/v1/user/<user>?year=<year>&deleteyear=true' -X DELETE
```

User = Username for user.

Year = Year to delete.

__Response__

Success: The response is a 200 status code. The response body is a JSON object contianing a success message.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Year Data Not Deleted: When there is no year specified, the response is a 404 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

# Entry

An entry refers to worklog data associated with a specific day.

```
{
	"date": String,
	"type": String,
	"location": String
}
```

Date must follow the format "YYYY-MM-DD"
Type must be one of the following:
	* office
	* remote
	* vacation
	* holidays
	* sick
Location is only required when the Type is `remote`

## View Entry

__Command__

```
curl http://localhost:5000/api/v1/user/<user>?date=<date>
```

User = Username for user.

Date = Date to view.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the office information for a given year.

No Date Found: When there is no data for the date specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Date: When the date specified is not a valid date with the required format, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Add Entry

__Command__

```
curl http://localhost:5000/api/v1/user/<user>?date=<date>&type=<type>&location=<location> -X POST
```

User = Username for user.

Date = Date to add.

Type = Type to add.

Location = Location to add. Only required if Type is `remote`

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the office information for a given year.

Invalid Date: When the date specified is not a valid date with the required format, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Type: When the type specified is not a valid type, the response is a 400 status code. The response body is a JSON object containing an error message.

Date Data Already Exists: When the date specified is part of an existing entry in the work log, the response is a 400 status code. The response body is a JSON object containing an error message.

No Date Specified: When there is no date query parameter specified, the response is a 400 status code. The response body is a JSON object containing an error message.

No Type Specified: When there is no type query parameter specified, the response is a 400 status code. The response body is a JSON object containing an error message.

No Location Specified: When there is no location query parameter specified, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Update Entry

__Command__

```
curl http://localhost:5000/api/v1/user/<user>?date=<date>&type=<type>&location=<location> -X PUT
```

User = Username for user.

Date = Date to update.

Type = Type to update.

Location = Location to update. Only required if Type is `remote`

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the office information for a given year.

Invalid Date: When the date specified is not a valid date with the required format, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Type: When the type specified is not a valid type, the response is a 400 status code. The response body is a JSON object containing an error message.

No Date Specified: When there is no date query parameter specified, the response is a 400 status code. The response body is a JSON object containing an error message.

No Type Specified: When there is no type query parameter specified, the response is a 400 status code. The response body is a JSON object containing an error message.

No Location Specified: When there is no location query parameter specified, the response is a 400 status code. The response body is a JSON object containing an error message.

No Date Found: When there is no data for the date specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Delete Entry

__Command__

```
curl http://localhost:5000/api/v1/user/<user>?date=<date> -X DELETE
```

User = Username for user.

Date = Date to delete.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the office information for a given year.

Invalid Date: When the date specified is not a valid date with the required format, the response is a 400 status code. The response body is a JSON object containing an error message.

No Date Data Deleted: When there is no date query parameter specified or no data for the date specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.
