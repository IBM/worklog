'''
Created on Sep 18, 2018

@author: MaxShapiro32@ibm.com

Service for modifying (adding, updating, resetting) work log data in the database for a user
'''

from app.services import utils
from flask import jsonify
from app.services.worklog import get_worklog_data_service
import datetime

def addWorklogData(user, year, dayType, days, location):
    if not dayType:
        return jsonify({"error": "No day type given"}), 400
        
    userYearData = utils.getUserYearData(user,year)
            
    if userYearData:
        return updateWorklogData(user, year, dayType, days, location, userYearData)
    else:
        return setWorklogData(user, year, dayType, days, location)

def setWorklogData(user, year, dayType, days, location):
    startdate, lastdate = utils.getYearDates(year)
    
    if days < 0:
        return jsonify({"error": "Invalid days given"}), 400
                
    utils.addUserWorkLogData(user, year, dayType, days, location, startdate, lastdate)
    
    return get_worklog_data_service.getWorklogData(user, year, dayType)

def updateWorklogData(user, year, dayType, days, location, userYearData):
    _, lastdate = utils.getYearDates(year)
    
    updatedData = {"lastdate": lastdate}
    
    if dayType == "remote":
        updatedData[dayType+".total"] = userYearData[dayType]["total"]+days
        
        if location in userYearData[dayType]["locations"]:
            if days < 0 or userYearData[dayType]["locations"][location] + days > (userYearData["lastdate"] - userYearData["startdate"]).days:
                return jsonify({"error": "Invalid days given"}), 400
            
            updatedData[dayType+".locations."+location] = userYearData[dayType]["locations"][location]+days
        else:
            if days < 0:
                return jsonify({"error": "Invalid days given"}), 400
            
            locations = userYearData[dayType]["locations"]

            locations[location] = days
            
            updatedData[dayType+".locations"] = locations
    else:
        if days < 0 or userYearData[dayType] + days > (userYearData["lastdate"] - userYearData["startdate"]).days:
            return jsonify({"error": "Invalid days given"}), 400
            
        updatedData[dayType] = userYearData[dayType]+days
            
    utils.updateUserWorkLog(user, year, updatedData)
                
    return get_worklog_data_service.getWorklogData(user, year, dayType)

def resetWorklogData(user, year, dayType, days, location, data):
    if not dayType:
        return jsonify({"error": "No day type given"}), 400
        
    userYearData = utils.getUserYearData(user,year)
    
    if userYearData:
        if dayType == "remote":
            if days > userYearData[dayType]["locations"][location] or days < 0:
                return jsonify({"error": "Invalid days given"}), 400
            
            updatedData = {dayType+".total" : userYearData[dayType]["total"]-userYearData[dayType]["locations"][location]+days,
                           dayType+".locations."+location : days}
        else:
            if days > userYearData[dayType] or days < 0:
                return jsonify({"error": "Invalid days given"}), 400
                
            updatedData = {dayType: days}
                
        if data:
            startdate = None
            lastdate = None
            if "lastdate" in data:
                try:
                    lastdate = datetime.datetime(year,data["lastdate"]["month"],data["lastdate"]["day"])
                except:
                    return jsonify({"error": "Invalid dates given"}), 400
                    
            if "startdate" in data:
                try:
                    startdate = datetime.datetime(year,data["startdate"]["month"],data["startdate"]["day"])
                except:
                    return jsonify({"error": "Invalid dates given"}), 400
                        
                if lastdate:
                    if (lastdate - startdate).days < 0:
                        return jsonify({"error": "Invalid dates given"}), 400
                else:
                    if (userYearData["lastdate"] - startdate).days < 0:
                        return jsonify({"error": "Invalid dates given"}), 400
                        
            if startdate:
                updatedData["startdate"] = startdate
                
            if lastdate:
                updatedData["lastdate"] = lastdate
                
        utils.updateUserWorkLog(user, year, updatedData)
                
        return get_worklog_data_service.getWorklogData(user, year, dayType)
            
    return jsonify({"error": "No data found for year given"}), 404