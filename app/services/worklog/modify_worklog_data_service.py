'''
Created on Sep 18, 2018

@author: MaxShapiro32@ibm.com

Service for modifying (adding, updating, resetting) work log data in the database for a user
'''

from app.services import utils
from flask import jsonify
from app.services.worklog import get_worklog_data_service

def addWorklogData(user, date, dayType, location):
    if not date:
        return jsonify({"error": "No date given"}), 400
    
    if not dayType:
        return jsonify({"error": "No day type given"}), 400
    
    if dayType == "remote":
        if not location:
            return jsonify({"error": "No location given"}), 400
        
    hasDateData = utils.getUserDateData(user, date)
    
    if hasDateData:
        return jsonify({"error": "Data already exists for date given"}), 400
        
    utils.addUserWorkLogData(user, date, dayType, location)
    
    return get_worklog_data_service.getWorklogData(user, None, date)

def updateWorklogData(user, date, dayType, location):
    if not date:
        return jsonify({"error": "No date given"}), 400
    
    if not dayType:
        return jsonify({"error": "No day type given"}), 400
    
    if dayType == "remote":
        if not location:
            return jsonify({"error": "No location given"}), 400
        
    userDateData = utils.getUserDateData(user, date)
    
    if userDateData:
                
        utils.updateUserWorkLog(user, date, dayType, location)
                
        return get_worklog_data_service.getWorklogData(user, None, date)
            
    return jsonify({"error": "No data found to update"}), 404

def deleteWorklogData(user, date, year, deleteUser, deleteAll, deleteYear):
    if deleteUser:
        userIsDeleted = utils.deleteUser(user)
        
        if userIsDeleted:
            return jsonify({"success":"Successfully deleted user"})
        
        return jsonify({"error":"No user deleted"}), 404
    
    elif deleteAll:
        utils.deleteUserData(user)
        
        userData = utils.getUserWorklog(user)
        
        if len(userData) == 0:
            return jsonify({"success":"Successfully deleted user data"})
        
        return jsonify({"error":"No user data deleted"}), 404
    
    elif deleteYear:
        if year:
            utils.deleteUserYearData(user, year)
            
            userData = utils.getUserYearData(user, year)
            
            if not userData:
                return jsonify({"success":"Successfully deleted user year data"})
        
        return jsonify({"error":"No user year data deleted"}), 404
    
    else:
        if date:
            userDateData = utils.getUserDateData(user, date)
        
            if userDateData:
                
                utils.deleteUserDateData(user, date)
                
                userDateData = utils.getUserDateData(user, date)
        
                if not userDateData:
                    return jsonify({"success":"Successfully deleted date data"})
                
        return jsonify({"error":"No date data removed"}), 404