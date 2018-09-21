'''
Created on Sep 18, 2018

@author: MaxShapiro32@ibm.com

Service for getting work log data from the database for a user
'''

from app.services import utils
from flask import jsonify

def getWorklogData(user,year,dayType):
    userData = utils.getUserWorklog(user)
    
    if userData:
        if year:
            for yearData in userData:
                if yearData["year"] == year:
                    if dayType in yearData.keys():
                        dayTypeValue = yearData[dayType]
                    elif dayType == "total":
                        dayTypeValue = yearData["office"] + yearData["remote"]["total"]
                    else:
                        return jsonify(yearData)
                        
                    return jsonify({"startdate": yearData["startdate"],
                                    "lastdate": yearData["lastdate"],
                                    dayType: dayTypeValue})
            return jsonify({"error": "No data found for year given"}), 404
        else:
            if dayType:
                dayTypeValue = 0
                for yearData in userData:
                    if dayType in yearData.keys():
                        dayTypeValue += yearData[dayType]
                    elif dayType == "total":
                        dayTypeValue += yearData["office"] + yearData["remote"]["total"]
                return jsonify({dayType: dayTypeValue})
            else:
                return jsonify(userData)
    return jsonify({"error": "No data found"}), 404