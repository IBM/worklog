'''
Created on Sep 17, 2018

@author: MaxShapiro32@ibm.com

Utility functions for services
'''

from pymongo import MongoClient
import datetime
import sys
from simplecrypt import encrypt, decrypt

encKey = b'c\xf8\xccH\xbe\x7ffp\xda\xe4\xa4TY\x03\x85CR<\x97f'

try:
    mongoCredentials = MongoClient("mongodb://mongo:27017/credentials")
    mongoLog = MongoClient("mongodb://mongo:27017/log")
except:
    exit("Error: Unable to connect to the databases")
    
def getUserCredentials(user):
    return mongoCredentials.db.credentials.find_one({"username": user})

def updateUserCredentials(user,updatedData):
    mongoCredentials.db.credentials.update_one({"username": user},
                                               {"$set": updatedData},
                                               upsert=True)
    
def createUserInDatabase(user,password):
    userId = mongoLog.db.log.insert_one({"settings": {
                                            "slack": "",
                                            "total": {
                                                "remote": -1,
                                                "vacation": -1,
                                                "holiday": -1,
                                                "sick": -1}},
                                         "years": []}).inserted_id
    mongoCredentials.db.credentials.insert_one({"user_id": userId,
                                                "username": user,
                                                "password": encrypt(encKey, password),
                                                "sessionend": datetime.datetime.utcnow()})
    return mongoCredentials.db.credentials.find_one({"username": user,
                                                        "user_id": userId})

def decryptPassword(password):
    return decrypt(encKey, password).decode("utf8")

def encryptPassword(password):
    return encrypt(encKey, password)

def getUserSettings(user):
    userCred = getUserCredentials(user)
    
    log = mongoLog.db.log.find_one({"_id": userCred["user_id"]})
    
    if log:
        return log["settings"]
    return None

def updateUserSettings(user, updatedSettings):
    userCred = getUserCredentials(user)
    
    try:
        settings = getUserSettings(user)
    except:
        settings = {"slack": "",
                    "total": {
                        "remote": -1,
                        "vacation": -1,
                        "holiday": -1,
                        "sick": -1}}
    
    for setting in updatedSettings.keys():
        if setting.lower() == "slack":
            settings["slack"] = updatedSettings[setting]
        elif setting.lower() in ["remote", "vacation", "holiday", "sick"]:
            settings["total"][setting.lower()] = updatedSettings[setting]
    
    mongoLog.db.log.update_one({"_id": userCred["user_id"]},
                                {"$set": {"settings": settings}},
                                upsert=True)

def getUserWorklog(user):
    userCred = getUserCredentials(user)
        
    log = mongoLog.db.log.find_one({"_id": userCred["user_id"]})
        
    if log:
        return log["years"]
    return None

def getUserYearData(user,year):
    userData = getUserWorklog(user)
    
    if userData:
        for yearData in userData:
            if yearData["year"] == year:
                return yearData 
            
    return None

def getUserDateData(user,date):
    userYearData = getUserYearData(user, date.year)
    
    if userYearData:
        for dateData in userYearData["entries"]:
            if sys.version_info.major >= 3 and sys.version_info.minor >= 7:
                if datetime.date.fromisoformat(dateData["date"]) == date:
                    return dateData
            else:
                date_split = dateData["date"].split("-")
                if datetime.date(int(date_split[0]),int(date_split[1]),int(date_split[2])) == date:
                    return dateData
        
    return None

def updateUserWorkLog(user,date,dayType,location,notes):
    userCred = getUserCredentials(user)
                    
    entry = {"date": date.isoformat(),
             "type": dayType,
             "notes": notes}
        
    if dayType == "remote":
        entry["location"] = location        
    
    mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":date.year},
                                {"$set": {"years.$.entries.$[entry]": entry}},
                                array_filters=[{"entry.date": date.isoformat()}])
    
def addUserWorkLogData(user,date,dayType,location,notes):
    userCred = mongoCredentials.db.credentials.find_one({"username": user})
    
    hasYearData = getUserYearData(user, date.year)
    
    entry = {"date": date.isoformat(),
             "type": dayType,
             "notes": notes}
        
    if dayType == "remote":
        entry["location"] = location
    
    if hasYearData:
        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":date.year},
                                    {"$push": {"years.$.entries": entry}},
                                    upsert=True)
    else:
        year = {"year": date.year,
                "entries": [entry]}
        
        mongoLog.db.log.update_one({"_id": userCred["user_id"]},
                                    {"$addToSet": {"years": year}},
                                    upsert=True)

def deleteUserDateData(user, date):        
    userCred = mongoCredentials.db.credentials.find_one({"username": user})
    
    mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":date.year},
                                {"$pull": {"years.$.entries": {"date": date.isoformat()}}})
    
    yearData = getUserYearData(user, date.year)
    
    if len(yearData["entries"]) == 0:
        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":date.year},
                                   {"$pull": {"years": {"year": date.year}}})
        
def deleteUser(user):
    userCred = mongoCredentials.db.credentials.find_one({"username": user})
    
    logResult = mongoLog.db.log.delete_one({"_id": userCred["user_id"]})
    
    credentialsResult = mongoCredentials.db.credentials.delete_one({"username": user})
    
    return logResult.deleted_count == 1 and credentialsResult.deleted_count == 1
    
def deleteUserData(user):
    userCred = mongoCredentials.db.credentials.find_one({"username": user})
    
    mongoLog.db.log.update_one({"_id": userCred["user_id"]},
                                {"$set": {"years": []}})
    
def deleteUserYearData(user, year):
    userCred = mongoCredentials.db.credentials.find_one({"username": user})
    
    mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                   {"$pull": {"years": {"year": year}}})
        