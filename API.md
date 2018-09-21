### Table of Contents

* [Users](#users)
	* [Login](#login)
	* [Create User](#create-user)
	* [Reset Password](#reset-password)
* [Year](#year)
	* [View Work Log in a Given Year](#view-work-log-in-a-given-year)
* [Total](#total)
	* [View Total Days Worked in a Given Year](#view-total-days-worked-in-a-given-year)
* [Office](#office)
	* [View Days Worked in Office in a Given Year](#view-days-worked-in-office-in-a-given-year)
	* [Update Days Worked in Office in Current Year](#update-days-worked-in-office-in-current-year)
	* [Reset Days Worked in Office in a Given Year](#reset-days-worked-in-office-in-a-given-year)
* [Remote](#remote)
	* [View Days Worked Remote in a Given Year](#view-days-worked-remote-in-a-given-year)
	* [Update Days Worked Remote in a Specific Location in Current Year](#update-days-worked-remote-in-a-specific-location-in-current-year)
	* [Reset Days Worked Remote in a Specific Location in a Given Year](#reset-days-worked-remote-in-a-specific-location-in-a-given-year)
* [Vacation](#vacation)
	* [View Vacation Days Used in a Given Year](#view-vacation-days-used-in-a-given-year)
	* [Update Vacation Days Used in Current Year](#update-vacation-days-used-in-current-year)
	* [Reset Vacation Days in a Given Year](#reset-vacation-days-in-a-given-year)
* [Holidays](#holidays)
	* [View Holidays in a Given Year](#view-holidays-in-a-given-year)
	* [Update Holidays in Current Year](#update-holidays-in-current-year)
	* [Reset Holidays in a Given Year](#reset-holidays-in-a-given-year)
* [Sick](#sick)
	* [View Sick Days Used in a Given Year](#view-sick-days-used-in-a-given-year)
	* [Update Sick Days Used in Current Year](#update-sick-days-used-in-current-year)
	* [Reset Sick Days Used in a Given Year](#reset-sick-days-used-in-a-given-year)

# Users

This application supports multiple users. Each user is a document in the database that contains the following information:

```
{
	"_id": ObjectId,
	"years":	[
					{
						"year": Integer,
						"startdate":	Date,
						"lastdate": Date,
						"office":	Integer,
						"remote": {
							"total":	Integer,
							"locations": {
								String: Integer
							}
						},
						"vacation":	Integer,
						"holidays":	Integer,
						"sick":	Integer
					}
				]
}
```

## Login

Users must login in order to view and modify there own respective work log. Once a user is logged in, they have a 20 minute session before being logged out.

__Command__

```
curl http://localhost:5000/login -H "Content-Type: application/json" -X POST -d '{"username": "<user>","password": "<password>"}'
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
curl http://localhost:5000/user/create -H "Content-Type: application/json" -X PUT -d '{"username": "<user>","password": "<password>"}'
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
curl http://localhost:5000/user/<user>/reset -H "Content-Type: application/json" -X PUT -d '{"new_password": <newpassword>, "password": <password>}'
```

User = Username for user.

Password = Current password for user.

NewPassword = New password for user.

__Response__

Success: The response is a 200 status code. The response body is a JSON object contianing a success message.

Password Not Reset: When the user specified is not a valid username and/or the password specified is not valid/correct, the response is a 403 status code. The response body is a JSON object containing an error message.

# Year

Each year is a document in a years list located in each user's unique document in the database that contains the following information:

```
{
	"year": Integer,
	"startdate":	Date,
	"lastdate": Date,
	"office":	Integer,
	"remote": {
		"total":	Integer,
		"locations": {
			String: Integer
		}
	},
	"vacation":	Integer,
	"holidays":	Integer,
	"sick":	Integer
}
```

## View Work Log in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>
```

User = Username for user.

Year = Year to view.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing all of the logged information about a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object containing an error message.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

# Total

The total for each year refers to the total number of days worked during a calendar year. This includes both days worked in the office and remote.

```
{
	"total":	Integer,
	"startdate":	Date,
	"lastdate":	Date
}
```

## View Total Days Worked in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=total
```

User = Username for user.

Year = Year to view.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the total information for a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

# Office

The office for each year refers to the number of days worked in the office during a calendar year.

```
{
	"office":	Integer,
	"startdate":	Date,
	"lastdate":	Date
}
```

## View Days Worked in Office in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=office
```

User = Username for user.

Year = Year to view.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the office information for a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Update Days Worked in Office in Current Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=office&days=<office> -X POST
```

User = Username for user.

Year = Year to update.

Office = Number of days to be added to the already existing office total.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the updated office total information for a given year.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Office Total: When the office variable input is invalid and not a positive number, or the total to increase by plus the already existing total is greater than the number of total days from the given year's start date to the latest date logged, the response is a 400 status code. The response body is a JSON object containing an error.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Reset Days Worked in Office in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=office&days=<office> -H "Content-Type: application/json" -X PUT -d '{"startdate": {"month": "<month>","day": "<day>"},"lastdate": {"month": "<month>","day": "<day>"}}'
```

User = Username for user.

Year = Year to reset.

Office = Number of days to be reset to for working in the office for a given year. To just modify dates while keeping the office total the same, have Office be the same as the already existing office total. 

Startdate = OPTIONAL month and day to reset start date for the given year.

Lastdate = OPTIONAL month and day to reset last date for the given year.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the reset office total information for a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Office Total: When the office variable input is invalid and not a postive number, or the reset value is greater than or equal to the existing office total, the response is a 400 status code. The response body is a JSON object containing an error.

Invalid Dates: When the startdate comes after the lastdate or the month and day parameters are not valid integers, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

# Remote

The remote for each year refers to the number of days worked remotely during a calendar year. In addition, the remote includes a breakdown of the locations worked remotely and the number of days worked at each location.

```
{
	"remote": {
		"total":	Integer,
		"locations": {
			String:	Integer
		}
	},
	"startdate":	Date,
	"lastdate":	Date
}
```

## View Days Worked Remote in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=remote
```

User = Username for user.

Year = Year to view.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the remote information for a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Update Days Worked Remote in a Specific Location in Current Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=remote&location=<location>&days=<remote> -X POST
```

User = Username for user.

Year = Year to update.

Location = Remote location worked to update.

Remote = Number of days to be added to the already existing remote total for the given location and year.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the updated remote total information for a given year.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Remote Total: When the remote variable input is invalid and not a positive number, or the total to increase by plus the already existing total is greater than the number of total days from the given year's start date to the latest date logged, the response is a 400 status code. The response body is a JSON object containing an error.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Reset Days Worked Remote in a Specific Location in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=remote&location=<location>&days=<remote> -H "Content-Type: application/json" -X PUT -d '{"startdate": {"month": "<month>","day": "<day>"},"lastdate": {"month": "<month>","day": "<day>"}}'
```

User = Username for user.

Year = Year to reset.

Location = Remote location worked to reset.

Remote = Number of days to be reset to for working remotely for a given year and location. To just modify dates while keeping the remote total the same, have Remote be the same as the already existing remote total. 

Startdate = OPTIONAL month and day to reset start date for the given year.

Lastdate = OPTIONAL month and day to reset last date for the given year.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the reset remote total information for a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Office Total: When the remote variable input is invalid and not a postive number, or the reset value is greater than or equal to the existing remote total, the response is a 400 status code. The response body is a JSON object containing an error.

Invalid Dates: When the startdate comes after the lastdate or the month and day parameters are not valid integers, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

# Vacation

The vacation for each year refers to the number of vacation days used during a calendar year.

```
{
	"vacation":	Integer,
	"startdate":	Date,
	"lastdate":	Date
}
```

## View Vacation Days Used in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=vacation
```

User = Username for user.

Year = Year to view.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the vacation information for a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Update Vacation Days Used in Current Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=vacation&days=<vacation> -X POST
```

User = Username for user.

Year = Year to update.

Vacation = Number of days to be added to the already existing vacation total for the given year.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the updated vacation total information for a given year.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Vacation Total: When the vacation variable input is invalid and not a positive number, or the total to increase by plus the already existing total is greater than the number of total days from the given year's start date to the latest date logged, the response is a 400 status code. The response body is a JSON object containing an error.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Reset Vacation Days in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=vacation&days=<vacation> -H "Content-Type: application/json" -X PUT -d '{"startdate": {"month": "<month>","day": "<day>"},"lastdate": {"month": "<month>","day": "<day>"}}'
```

User = Username for user.

Year = Year to reset.

Vacation = Number of days to be reset to for vacation for a given year. To just modify dates while keeping the vacation total the same, have Vacation be the same as the already existing vacation total. 

Startdate = OPTIONAL month and day to reset start date for the given year.

Lastdate = OPTIONAL month and day to reset last date for the given year.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the reset vacation total information for a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Office Total: When the vacation variable input is invalid and not a postive number, or the reset value is greater than or equal to the existing vacation total, the response is a 400 status code. The response body is a JSON object containing an error.

Invalid Dates: When the startdate comes after the lastdate or the month and day parameters are not valid integers, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

# Holidays

The holidays for each year refers to the number of holidays used during a calendar year.

```
{
	"holidays":	Integer,
	"startdate":	Date,
	"lastdate":	Date
}
```

## View Holidays in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=holidays
```

User = Username for user.

Year = Year to view.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the holiday information for a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Update Holidays in Current Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=holidays&days=<holidays> -X POST
```

User = Username for user.

Year = Year to update.

Holidays = Number of days to be added to the already existing holiday total for the given year.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the updated holiday total information for a given year.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Holiday Total: When the holidays variable input is invalid and not a positive number, or the total to increase by plus the already existing total is greater than the number of total days from the given year's start date to the latest date logged, the response is a 400 status code. The response body is a JSON object containing an error.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Reset Holidays in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=holidays&days=<holidays> -H "Content-Type: application/json" -X PUT -d '{"startdate": {"month": "<month>","day": "<day>"},"lastdate": {"month": "<month>","day": "<day>"}}'
```

User = Username for user.

Year = Year to reset.

Holidays = Number of days to be reset to for holidays for a given year. To just modify dates while keeping the holidays total the same, have Holidays be the same as the already existing holidays total. 

Startdate = OPTIONAL month and day to reset start date for the given year.

Lastdate = OPTIONAL month and day to reset last date for the given year.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the reset holiday total information for a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Office Total: When the holidays variable input is invalid and not a postive number, or the reset value is greater than or equal to the existing vacation total, the response is a 400 status code. The response body is a JSON object containing an error.

Invalid Dates: When the startdate comes after the lastdate or the month and day parameters are not valid integers, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

# Sick

The sick for each year refers to the number of sick days used during a calendar year.

```
{
	"sick":	Integer,
	"startdate":	Date,
	"lastdate":	Date
}
```

## View Sick Days Used in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=sick
```

User = Username for user.

Year = Year to view.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the sick information for a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Update Sick Days Used in Current Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=sick&days=<sick> -X POST
```

User = Username for user.

Year = Year to update.

Sick = Number of days to be added to the already existing sick days total for the given year.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the updated sick days total information for a given year.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Sick Days Total: When the sick variable input is invalid and not a positive number, or the total to increase by plus the already existing total is greater than the number of total days from the given year's start date to the latest date logged, the response is a 400 status code. The response body is a JSON object containing an error.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.

## Reset Sick Days Used in a Given Year

__Command__

```
curl http://localhost:5000/user/<user>?year=<year>&type=sick&days=<sick> -H "Content-Type: application/json" -X PUT -d '{"startdate": {"month": "<month>","day": "<day>"},"lastdate": {"month": "<month>","day": "<day>"}}'
```

User = Username for user.

Year = Year to reset.

Sick = Number of days to be reset to for sick days for a given year. To just modify dates while keeping the sick total the same, have Sick be the same as the already existing sick total. 

Startdate = OPTIONAL month and day to reset start date for the given year.

Lastdate = OPTIONAL month and day to reset last date for the given year.

__Response__

Success: The response is a 200 status code. The response body is a JSON object containing the reset sick days total information for a given year.

No Year Found: When there is no document for the year specified, the response is a 404 status code. The response body is a JSON object cantaining an error.

Invalid Year: When the year specified is not a valid integer year, the response is a 400 status code. The response body is a JSON object containing an error message.

Invalid Sick Days Total: When the sick variable input is invalid and not a postive number, or the reset value is greater than or equal to the existing vacation total, the response is a 400 status code. The response body is a JSON object containing an error.

Invalid Dates: When the startdate comes after the lastdate or the month and day parameters are not valid integers, the response is a 400 status code. The response body is a JSON object containing an error message.

Not Logged In: When the user specified is not a valid username or the valid user is not currently logged in, the response is a 403 status code. The response body is a JSON object containing an error message.