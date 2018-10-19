'''
Created on Sep 17, 2018

@author: MaxShapiro32@ibm.com

User restful end points handling
'''

from flask import Blueprint, request, jsonify
import datetime
import sys
import urllib.request, urllib.parse
import json
from app.web import utils
from app.services.user import create_user_service, reset_password_service
from app.services.worklog import get_worklog_data_service, modify_worklog_data_service

user_v1_blueprint = Blueprint('user_v1_api', __name__)

@user_v1_blueprint.route('/user/create', methods=['PUT'])
def createUser():
    data = request.get_json()
    if data and "username" in data and "password" in data:
        userCreated = create_user_service.createUser(data['username'], data['password'])
        
        if userCreated:
            return userCreated
    return jsonify({"error":"Did not create user"}),400

@user_v1_blueprint.route('/user/<user>/reset', methods=['PUT'])
def resetPassword(user=""):
    data = request.get_json()
    if data and "password" in data and "new_password" in data:
        passwordReset = reset_password_service.resetPassword(user, data['password'], data['new_password'])
        
        if passwordReset:
            return passwordReset
    return jsonify({"error":"Did not reset password"}),403

@user_v1_blueprint.route('/user/<user>', methods=['GET','POST','PUT','DELETE'])
@utils.logged_in
def handleUserData(user=""):
    year = request.args.get('year',None,type=int)
    dayType = request.args.get('type',None,type=str)
    date = request.args.get('date',None,type=str)
    location = request.args.get('location',None,type=str)
    deleteUser = request.args.get('deleteuser',False,type=bool)
    deleteAll = request.args.get('deleteall',False,type=bool)
    deleteYear = request.args.get('deleteyear',False,type=bool)
    
    data = request.get_json()
    notes = ""
    if data and "notes" in data:
        notes = data["notes"]
    
    if 'year' in request.args and not year:
        return jsonify({"error": "Invalid year given"}), 400
    
    if dayType:
        dayType = dayType.lower()

        if dayType not in {"office","remote","vacation","holiday","sick"}:
            return jsonify({"error": "Invalid day type given"}), 400
        
    if date:
        try:
            if sys.version_info.major >= 3 and sys.version_info.minor >= 7:
                date = datetime.date.fromisoformat(date)
            else:
                date_split = date.split("-")
                date = datetime.date(int(date_split[0]),int(date_split[1]),int(date_split[2]))
        except:
            return jsonify({"error": "Invalid date given"}), 400
        
    if location:
        location = location.title()
    
    if request.method == "GET":
        return get_worklog_data_service.getWorklogData(user, year, date)
        
    elif request.method == "POST":
        response = modify_worklog_data_service.addWorklogData(user, date, dayType, location, notes)
        
        if type(response) != tuple and response.status_code == 200:
            settings = json.loads(get_worklog_data_service.getWorklogSettings(user).data)["settings"]
            if settings["slack"].strip():
                try:
                    data = {"payload": {"text": user + " added " + dayType + " for " + date.isoformat()}}
                    data = bytes( urllib.parse.urlencode( data ).encode() )
            
                    urllib.request.urlopen(settings["slack"].strip(), data=data)
                except:
                    pass
                
        return response
    
    elif request.method == "PUT":
        response = modify_worklog_data_service.updateWorklogData(user, date, dayType, location, notes)
    
        if type(response) != tuple and response.status_code == 200:
            settings = json.loads(get_worklog_data_service.getWorklogSettings(user).data)["settings"]
            if settings["slack"].strip():
                try:
                    data = {"payload": {"text": user + " changed " + date.isoformat() + " to " + dayType}}
                    data = bytes( urllib.parse.urlencode( data ).encode() )
            
                    urllib.request.urlopen(settings["slack"].strip(), data=data)
                except:
                    pass
                
        return response
    
    elif request.method == "DELETE":
        return modify_worklog_data_service.deleteWorklogData(user, date, year, deleteUser, deleteAll, deleteYear)

@user_v1_blueprint.route('/user/<user>/settings', methods=['GET','PUT'])
@utils.logged_in
def handleUserSettings(user=""):  
    data = request.get_json()
    
    if request.method == "GET":
        return get_worklog_data_service.getWorklogSettings(user)
    elif request.method == "PUT":
        return modify_worklog_data_service.updateWorklogSettings(user, data)
