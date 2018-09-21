'''
Created on Sep 17, 2018

@author: MaxShapiro32@ibm.com

Utility functions for services
'''

from pymongo import MongoClient
import datetime
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
    userId = mongoLog.db.log.insert_one({"years": []}).inserted_id
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

def getUserWorklog(user):
    userCred = getUserCredentials(user)
        
    log = mongoLog.db.log.find_one({"_id": userCred["user_id"]})
        
    if log:
        return log["years"]
    return None

def getUserYearData(user,year):
    userData = getUserWorklog(user)
        
    userYearData = None
    for yearData in userData:
        if yearData["year"] == year:
            userYearData = yearData 
            
    return userYearData

def updateUserWorkLog(user,year,updatedData):
    userCred = getUserCredentials(user)
                    
    data = {}
    for key in updatedData.keys():
        data["years.$."+key] = updatedData[key]           
    
    mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                {"$set": data},
                                upsert=True)
    
def addUserWorkLogData(user, year, dayType, days, location, startdate, lastdate):
    userCred = mongoCredentials.db.credentials.find_one({"username": user})
    
    year = {"year": year,
            "startdate" : startdate,
            "lastdate" : lastdate,
            "office" : 0,
            "remote" : {
                "total" : 0,
                "locations" : {}
            },
            "vacation" : 0,
            "holidays" : 0,
            "sick" : 0}
    
    if dayType == "remote":
        year[dayType]["total"] = days
        year[dayType]["locations"] = {location:days}
    else:
        year[dayType] = days
    
    mongoLog.db.log.update_one({"_id": userCred["user_id"]},
                                {"$addToSet": {"years": year}},
                                upsert=True)

def getYearDates(year):
    lastdate = datetime.datetime.utcnow()
    if year < lastdate.year:
        startdate = datetime.datetime(year,1,1)
        lastdate = datetime.datetime(year,12,31)
    elif year > lastdate.year:
        startdate = datetime.datetime(year,1,1)
        lastdate = startdate
    else:
        startdate = lastdate
        
    return (startdate,lastdate)
        