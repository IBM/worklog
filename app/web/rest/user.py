'''
Created on Sep 17, 2018

@author: MaxShapiro32@ibm.com

User restful end points handling
'''

from flask import Blueprint, request, jsonify
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

@user_v1_blueprint.route('/user/<user>', methods=['GET','POST','PUT'])
@utils.logged_in
def handleUserData(user=""):
    year = request.args.get('year',None,type=int)
    dayType = request.args.get('type',None,type=str)
    days = request.args.get('days',0,type=int)
    location = request.args.get('location',None,type=str)
    
    if 'year' in request.args and not year:
        return jsonify({"error": "Invalid year given"}), 400
    
    if dayType:
        dayType = dayType.lower()

        if dayType not in {"office","remote","vacation","holidays","sick","total"}:
            return jsonify({"error": "Invalid day type given"}), 400
        
    if location:
        location = location.title()
    
    if request.method == "GET":
        return get_worklog_data_service.getWorklogData(user, year, dayType) 
        
    elif request.method == "POST":
        return modify_worklog_data_service.addWorklogData(user, year, dayType, days, location)
   
    elif request.method == "PUT":
        return modify_worklog_data_service.resetWorklogData(user, year, dayType, days, location, request.get_json())
    