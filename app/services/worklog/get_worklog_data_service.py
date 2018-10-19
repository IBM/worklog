'''
Created on Sep 18, 2018

@author: MaxShapiro32@ibm.com

Service for getting work log data from the database for a user
'''

from app.services import utils
from flask import jsonify

def getWorklogData(user,year,date):
    
    if year:
        userData = utils.getUserYearData(user, year)
        
        if userData:
            return jsonify(userData)
        else:
            return jsonify({"error": "No data found"}), 404
    elif date:
        userData = utils.getUserDateData(user, date)
        
        if userData:
            return jsonify(userData)
        else:
            return jsonify({"error": "No data found"}), 404
    else:
        userData = utils.getUserWorklog(user)
        
        if userData:
            return jsonify({"years": userData})
        else:
            return jsonify({"error": "No data found"}), 404
        
def getWorklogSettings(user):
    
    userSettings = utils.getUserSettings(user)
    
    if userSettings:
        return jsonify({"settings": userSettings})
    else:
        return jsonify({"error": "No settings found"}), 404