'''
Created on Feb 1, 2018

@author: Max Shapiro (MaxShapiro32@ibm.com)
'''

from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
import datetime
from simplecrypt import encrypt, decrypt

app = Flask(__name__)
mongoLog = PyMongo(app, uri="mongodb://mongo:27017/log")
mongoCredentials = PyMongo(app, uri="mongodb://mongo:27017/credentials")

encKey = b'c\xf8\xccH\xbe\x7ffp\xda\xe4\xa4TY\x03\x85CR<\x97f'

'''
User End Points
'''

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    userCred = mongoCredentials.db.credentials.find_one({"username": data['username']})
    if userCred and data['password'] == decrypt(encKey, userCred["password"]).decode("utf8"):
        mongoCredentials.db.credentials.update_one({"username": data['username']},
                                                    {"$set": {"sessionend":datetime.datetime.utcnow()}},
                                                    upsert=True)
        return jsonify({"success":"Successfully logged in"})
    return jsonify({"failure":"Did not log in"}),400

@app.route('/user/create', methods=['PUT'])
def createUser():
    data = request.get_json()
    if data and "username" in data and "password" in data:
        userCred = mongoCredentials.db.credentials.find_one({"username": data['username']})
        if userCred:
            return jsonify({"failure":"User already exists"}),400
        userId = mongoLog.db.log.insert_one({"years": []}).inserted_id
        mongoCredentials.db.credentials.insert_one({"user_id": userId,
                                                    "username": data["username"],
                                                    "password": encrypt(encKey, data['password']),
                                                    "sessionend": datetime.datetime.utcnow()})
        userCred = mongoCredentials.db.credentials.find_one({"username": data['username'],
                                                             "user_id": userId})
        if userCred:
            return jsonify({"success":"User "+ data["username"] + " created"})
    return jsonify({"failure":"Did not create user"}),400

@app.route('/user/<user>/password/reset', methods=['PUT'])
def resetPassword(user=""):
    data = request.get_json()
    if data and "password" in data and "new_password" in data:
        userCred = mongoCredentials.db.credentials.find_one({"username": user})
        
        if userCred and data['password'] == decrypt(encKey, userCred["password"]).decode("utf8"):
            mongoCredentials.db.credentials.update_one({"username": user},
                                                        {"$set": {"password": encrypt(encKey, data['new_password'])}},
                                                        upsert=True)
            userCred = mongoCredentials.db.credentials.find_one({"username": user})
            
            if userCred and data['new_password'] == decrypt(encKey, userCred["password"]).decode("utf8"):
                return jsonify({"success":"Password reset"})
    return jsonify({"failure":"Did not reset password"}),403

'''
User Helper Functions
'''

def isLoggedIn(user):
    userCred = mongoCredentials.db.credentials.find_one({"username": user})
    if userCred:
        return (datetime.datetime.utcnow() - userCred["sessionend"]) < datetime.timedelta(minutes=20)

'''
Log Data End Points
'''

@app.route('/user/<user>/year/<year>')
def getYear(user="",year=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        data = getYearFromDatabase(user, year)
        
        if data:
            return jsonify({"year": data["year"],
                            "startdate": data["startdate"],
                            "lastdate": data["lastdate"],
                            "office": data["office"],
                            "remote": data["remote"],
                            "vacation": data["vacation"],
                            "holidays": data["holidays"],
                            "sick":  data["sick"]})
        
        return jsonify({"error": "No data found for year given"}), 404
    return jsonify({"error": "Not logged in"}), 403
            
@app.route('/user/<user>/year/<year>/total', methods=['GET'])
def getTotal(user="",year=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        data = getYearFromDatabase(user, year)
        
        if data:
            return jsonify({"total": data["office"] + data["remote"]["total"],
                            "startdate": data["startdate"],
                           "lastdate": data["lastdate"]})
        
        return jsonify({"error": "No data found for year given"}), 404
    return jsonify({"error": "Not logged in"}), 403


@app.route('/user/<user>/year/<year>/office', methods=['GET'])
def getOffice(user="",year=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        data = getYearFromDatabase(user, year)
        
        if data:
            return jsonify({"office": data["office"],
                            "startdate": data["startdate"],
                           "lastdate": data["lastdate"]})
        
        return jsonify({"error": "No data found for year given"}), 404
    return jsonify({"error": "Not logged in"}), 403


@app.route('/user/<user>/year/<year>/office/<office>', methods=['POST','PUT'])
def modifyOffice(user="",year=None,office=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        try:
            office = int(office)
        except:
            return jsonify({"error": "Invalid office days given"}), 400
        
        data = request.get_json()
        
        userData = getYearFromDatabase(user, year)
        
        if request.method == "POST":
            if userData:
                if office < 0 or userData["office"] + office > (userData["lastdate"] - userData["startdate"]).days:
                    return jsonify({"error": "Invalid office days given"}), 400
                
                lastdate = datetime.datetime.utcnow()
                if year < lastdate.year:
                    lastdate = datetime.datetime(year,12,31)
                elif year > lastdate.year:
                    lastdate = datetime.datetime(year,1,1)
                    
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                    
                mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                           {"$set": {"years.$.office":userData["office"]+office,"years.$.lastdate":lastdate}},
                                           upsert=True)
                
                return getOffice(user, year)
            else:
                
                if office < 0:
                    return jsonify({"error": "Invalid office days given"}), 400
                
                lastdate = datetime.datetime.utcnow()
                if year < lastdate.year:
                    startdate = datetime.datetime(year,1,1)
                    lastdate = datetime.datetime(year,12,31)
                elif year > lastdate.year:
                    startdate = datetime.datetime(year,1,1)
                    lastdate = startdate
                else:
                    startdate = lastdate
                
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                
                mongoLog.db.log.update_one({"_id": userCred["user_id"]},
                                           {"$addToSet": {"years": {"year": year,
                                                                    "startdate" : startdate,
                                                                    "lastdate" : lastdate,
                                                                    "office" : office,
                                                                    "remote" : {
                                                                        "total" : 0,
                                                                        "locations" : {}
                                                                    },
                                                                    "vacation" : 0,
                                                                    "holidays" : 0,
                                                                    "sick" : 0}
                                                                    }},
                                           upsert=True)
                
                return getOffice(user, year)
        
        if request.method == "PUT":
            if userData:
                if office > userData["office"] or office < 0:
                    return jsonify({"error": "Invalid office days given"}), 400
                
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                
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
                            if (userData["lastdate"] - startdate).days < 0:
                                return jsonify({"error": "Invalid dates given"}), 400
                        
                    if startdate and lastdate:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.office":office,
                                                             "years.$.startdate":startdate,
                                                             "years.$.lastdate":lastdate}},
                                                   upsert=True)
                    elif startdate:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.office":office,
                                                             "years.$.startdate":startdate}},
                                                   upsert=True)
                    else:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.office":office,
                                                             "years.$.lastdate":lastdate}},
                                                   upsert=True)
                
                else:
                    mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                               {"$set": {"years.$.office":office}},
                                               upsert=True)
                
                return getOffice(user, year)
            
            return jsonify({"error": "No data found for year given"}), 404
         
        
    return jsonify({"error": "Not logged in"}), 403

@app.route('/user/<user>/year/<year>/remote', methods=['GET'])
def getRemote(user="",year=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        data = getYearFromDatabase(user, year)
        
        if data:
            return jsonify({"remote": data["remote"],
                            "startdate": data["startdate"],
                           "lastdate": data["lastdate"]})
        
        return jsonify({"error": "No data found for year given"}), 404
    return jsonify({"error": "Not logged in"}), 403


@app.route('/user/<user>/year/<year>/remote/location/<location>/<remote>', methods=['POST','PUT'])
def modifyRemote(user="",year=None,remote=None,location=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        try:
            remote = int(remote)
        except:
            return jsonify({"error": "Invalid remote days given"}), 400
        
        location = location.title()
        
        data = request.get_json()
        
        userData = getYearFromDatabase(user, year)
        
        if request.method == "POST":
            if userData:
                if location in userData["remote"]["locations"]:
                    if remote < 0 or userData["remote"]["locations"][location] + remote > (userData["lastdate"] - userData["startdate"]).days:
                        return jsonify({"error": "Invalid remote days given"}), 400
                    
                    lastdate = datetime.datetime.utcnow()
                    if year < lastdate.year:
                        lastdate = datetime.datetime(year,12,31)
                    elif year > lastdate.year:
                        lastdate = datetime.datetime(year,1,1)
                        
                    userCred = mongoCredentials.db.credentials.find_one({"username": user})
                        
                    mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                               {"$set": {"years.$.remote.total":userData["remote"]["total"]+remote,
                                                        "years.$.remote.locations."+location:userData["remote"]["locations"][location]+remote,
                                                        "years.$.lastdate":lastdate}},
                                               upsert=True)
                    
                    return getRemote(user, year)
                else:
                    if remote < 0:
                        return jsonify({"error": "Invalid remote days given"}), 400
                    
                    startdate = datetime.datetime(year,1,1)
                    lastdate = datetime.datetime.utcnow()
                    if year < lastdate.year:
                        lastdate = datetime.datetime(year,12,31)
                    elif year > lastdate.year:
                        lastdate = startdate
                        
                    locations = userData["remote"]["locations"]

                    locations[location] = remote
                    
                    userCred = mongoCredentials.db.credentials.find_one({"username": user})
                    
                    mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                               {"$set": {"years.$.remote.total":userData["remote"]["total"]+remote,
                                                        "years.$.remote.locations": locations}},
                                               upsert=True)
                    
                    return getRemote(user, year)
            else:
                
                if remote < 0:
                    return jsonify({"error": "Invalid remote days given"}), 400
                
                lastdate = datetime.datetime.utcnow()
                if year < lastdate.year:
                    startdate = datetime.datetime(year,1,1)
                    lastdate = datetime.datetime(year,12,31)
                elif year > lastdate.year:
                    startdate = datetime.datetime(year,1,1)
                    lastdate = startdate
                else:
                    startdate = lastdate
                
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                
                mongoLog.db.log.update_one({"_id": userCred["user_id"]},
                                           {"$addToSet": {"years": {"year": year,
                                                                    "startdate" : startdate,
                                                                    "lastdate" : lastdate,
                                                                    "office" : 0,
                                                                    "remote" : {
                                                                        "total" : remote,
                                                                        "locations" : {
                                                                            location: remote
                                                                        }
                                                                    },
                                                                    "vacation" : 0,
                                                                    "holidays" : 0,
                                                                    "sick" : 0
                                                                    }}},
                                           upsert=True)
                
                return getRemote(user, year)
        
        if request.method == "PUT":
            if userData:
                if remote > userData["remote"]["locations"][location] or remote < 0:
                    return jsonify({"error": "Invalid remote days given"}), 400
                
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                
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
                            if (userData["lastdate"] - startdate).days < 0:
                                return jsonify({"error": "Invalid dates given"}), 400
                        
                    if startdate and lastdate:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.remote.total":userData["remote"]["total"]-userData["remote"]["locations"][location]+remote,
                                                             "years.$.remote.locations."+location:remote,
                                                             "years.$.startdate":startdate,
                                                             "years.$.lastdate":lastdate}},
                                                   upsert=True)
                    elif startdate:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.remote.total":userData["remote"]["total"]-userData["remote"]["locations"][location]+remote,
                                                             "years.$.remote.locations."+location:remote,
                                                             "years.$.startdate":startdate}},
                                                   upsert=True)
                    else:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.remote.total":userData["remote"]["total"]-userData["remote"]["locations"][location]+remote,
                                                             "years.$.remote.locations."+location:remote,
                                                             "years.$.lastdate":lastdate}},
                                                   upsert=True)
                else:
                    mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                               {"$set": {"years.$.remote.total":userData["remote"]["total"]-userData["remote"]["locations"][location]+remote,
                                                         "years.$.remote.locations."+location:remote}},
                                               upsert=True)
                
                return getRemote(user, year)
            
            return jsonify({"error": "No data found for year given"}), 404
    
    return jsonify({"error": "Not logged in"}), 403


@app.route('/user/<user>/year/<year>/vacation', methods=['GET'])
def getVacation(user="",year=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        data = getYearFromDatabase(user, year)
        
        if data:
            return jsonify({"vacation": data["vacation"],
                            "startdate": data["startdate"],
                           "lastdate": data["lastdate"]})
        
        return jsonify({"error": "No data found for year given"}), 404
    return jsonify({"error": "Not logged in"}), 403


@app.route('/user/<user>/year/<year>/vacation/<vacation>', methods=['POST','PUT'])
def modifyVacation(user="",year=None,vacation=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        try:
            vacation = int(vacation)
        except:
            return jsonify({"error": "Invalid vacation days given"}), 400
        
        data = request.get_json()
        
        userData = getYearFromDatabase(user, year)
        
        if request.method == "POST":
            if userData:
                if vacation < 0 or userData["vacation"] + vacation > (userData["lastdate"] - userData["startdate"]).days:
                    return jsonify({"error": "Invalid vacation days given"}), 400
                
                lastdate = datetime.datetime.utcnow()
                if year < lastdate.year:
                    lastdate = datetime.datetime(year,12,31)
                elif year > lastdate.year:
                    lastdate = datetime.datetime(year,1,1)
                    
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                    
                mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                           {"$set": {"years.$.vacation":userData["vacation"]+vacation,
                                                     "years.$.lastdate":lastdate}},
                                           upsert=True)
                
                return getVacation(user, year)
            else:
                
                if vacation < 0:
                    return jsonify({"error": "Invalid vacation days given"}), 400
                
                lastdate = datetime.datetime.utcnow()
                if year < lastdate.year:
                    startdate = datetime.datetime(year,1,1)
                    lastdate = datetime.datetime(year,12,31)
                elif year > lastdate.year:
                    startdate = datetime.datetime(year,1,1)
                    lastdate = startdate
                else:
                    startdate = lastdate
                
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                
                mongoLog.db.log.update_one({"_id": userCred["user_id"]},
                                           {"$addToSet": {"years": {"year": year,
                                                                    "startdate" : startdate,
                                                                    "lastdate" : lastdate,
                                                                    "office" : 0,
                                                                    "remote" : {
                                                                        "total" : 0,
                                                                        "locations" : {}
                                                                    },
                                                                    "vacation" : vacation,
                                                                    "holidays" : 0,
                                                                    "sick" : 0
                                                                    }}},
                                           upsert=True)
                
                return getVacation(user, year)
        
        if request.method == "PUT":
            if userData:
                if vacation > userData["vacation"] or vacation < 0:
                    return jsonify({"error": "Invalid vacation days given"}), 400
                
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                  
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
                            if (userData["lastdate"] - startdate).days < 0:
                                return jsonify({"error": "Invalid dates given"}), 400
                        
                    if startdate and lastdate:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.vacation":vacation,
                                                             "years.$.startdate":startdate,
                                                             "years.$.lastdate":lastdate}},
                                                   upsert=True)
                    elif startdate:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.vacation":vacation,
                                                             "years.$.startdate":startdate}},
                                                   upsert=True)
                    else:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.vacation":vacation,
                                                             "years.$.lastdate":lastdate}},
                                                   upsert=True)
                
                else:  
                    mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                             {"$set": {"years.$.vacation":vacation}},
                                             upsert=True)
                
                return getVacation(user, year)
            
            return jsonify({"error": "No data found for year given"}), 404
        
    return jsonify({"error": "Not logged in"}), 403


@app.route('/user/<user>/year/<year>/holidays', methods=['GET'])
def getHolidays(user="",year=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        data = getYearFromDatabase(user, year)
        
        if data:
            return jsonify({"holidays": data["holidays"],
                            "startdate": data["startdate"],
                           "lastdate": data["lastdate"]})
        
        return jsonify({"error": "No data found for year given"}), 404
    return jsonify({"error": "Not logged in"}), 403


@app.route('/user/<user>/year/<year>/holidays/<holidays>', methods=['POST','PUT'])
def modifyHolidays(user="",year=None,holidays=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        try:
            holidays = int(holidays)
        except:
            return jsonify({"error": "Invalid holidays given"}), 400
        
        data = request.get_json()
        
        userData = getYearFromDatabase(user, year)
        
        if request.method == "POST":
            if userData:
                if holidays < 0 or userData["holidays"] + holidays > (userData["lastdate"] - userData["startdate"]).days:
                    return jsonify({"error": "Invalid holidays given"}), 400
                
                lastdate = datetime.datetime.utcnow()
                if year < lastdate.year:
                    lastdate = datetime.datetime(year,12,31)
                elif year > lastdate.year:
                    lastdate = datetime.datetime(year,1,1)
                    
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                    
                mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                           {"$set": {"years.$.holidays":userData["holidays"]+holidays,
                                                     "years.$.lastdate":lastdate}},
                                           upsert=True)
                
                return getHolidays(user, year)
            else:
                
                if holidays < 0:
                    return jsonify({"error": "Invalid holidays given"}), 400
                
                lastdate = datetime.datetime.utcnow()
                if year < lastdate.year:
                    startdate = datetime.datetime(year,1,1)
                    lastdate = datetime.datetime(year,12,31)
                elif year > lastdate.year:
                    startdate = datetime.datetime(year,1,1)
                    lastdate = startdate
                else:
                    startdate = lastdate
                
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                
                mongoLog.db.log.update_one({"_id": userCred["user_id"]},
                                           {"$addToSet": {"years": {"year": year,
                                                                    "startdate" : startdate,
                                                                    "lastdate" : lastdate,
                                                                    "office" : 0,
                                                                    "remote" : {
                                                                        "total" : 0,
                                                                        "locations" : {}
                                                                    },
                                                                    "vacation" : 0,
                                                                    "holidays" : holidays,
                                                                    "sick" : 0
                                                                    }}},
                                           upsert=True)
                
                return getHolidays(user, year)
        
        if request.method == "PUT":
            if userData:
                if holidays > userData["holidays"] or holidays < 0:
                    return jsonify({"error": "Invalid holidays given"}), 400
                
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                    
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
                            if (userData["lastdate"] - startdate).days < 0:
                                return jsonify({"error": "Invalid dates given"}), 400
                        
                    if startdate and lastdate:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.holidays":holidays,
                                                             "years.$.startdate":startdate,
                                                             "years.$.lastdate":lastdate}},
                                                   upsert=True)
                    elif startdate:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.holidays":holidays,
                                                             "years.$.startdate":startdate}},
                                                   upsert=True)
                    else:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.holidays":holidays,
                                                             "years.$.lastdate":lastdate}},
                                                   upsert=True)
                
                else:
                    mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                               {"$set": {"years.$.holidays":holidays}},
                                               upsert=True)
                
                return getHolidays(user, year)
            
            return jsonify({"error": "No data found for year given"}), 404
    
    return jsonify({"error": "Not logged in"}), 403

@app.route('/user/<user>/year/<year>/sick', methods=['GET'])
def getSick(user="",year=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        data = getYearFromDatabase(user, year)
        
        if data:
            return jsonify({"sick": data["sick"],
                            "startdate": data["startdate"],
                           "lastdate": data["lastdate"]})
        
        return jsonify({"error": "No data found for year given"}), 404
    return jsonify({"error": "Not logged in"}), 403


@app.route('/user/<user>/year/<year>/sick/<sick>', methods=['POST','PUT'])
def modifySick(user="",year=None,sick=None):
    if isLoggedIn(user):
        try:
            year = int(year)
        except:
            return jsonify({"error": "Invalid year given"}), 400
        
        try:
            sick = int(sick)
        except:
            return jsonify({"error": "Invalid sick days given"}), 400
        
        data = request.get_json()
        
        userData = getYearFromDatabase(user, year)
        
        if request.method == "POST":
            if userData:
                if sick < 0 or userData["sick"] + sick > (userData["lastdate"] - userData["startdate"]).days:
                    return jsonify({"error": "Invalid sick days given"}), 400
                
                lastdate = datetime.datetime.utcnow()
                if year < lastdate.year:
                    lastdate = datetime.datetime(year,12,31)
                elif year > lastdate.year:
                    lastdate = datetime.datetime(year,1,1)
                    
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                    
                mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                           {"$set": {"years.$.sick":userData["sick"]+sick,
                                                     "years.$.lastdate":lastdate}},
                                           upsert=True)
                
                return getSick(user, year)
            else:
                
                if sick < 0:
                    return jsonify({"error": "Invalid sick days given"}), 400
                
                lastdate = datetime.datetime.utcnow()
                if year < lastdate.year:
                    startdate = datetime.datetime(year,1,1)
                    lastdate = datetime.datetime(year,12,31)
                elif year > lastdate.year:
                    startdate = datetime.datetime(year,1,1)
                    lastdate = startdate
                else:
                    startdate = lastdate
                
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                
                mongoLog.db.log.update_one({"_id": userCred["user_id"]},
                                           {"$addToSet": {"years": {"year": year,
                                                                    "startdate" : startdate,
                                                                    "lastdate" : lastdate,
                                                                    "office" : 0,
                                                                    "remote" : {
                                                                        "total" : 0,
                                                                        "locations" : {}
                                                                    },
                                                                    "vacation" : 0,
                                                                    "holidays" : 0,
                                                                    "sick" : sick
                                                                    }}},
                                           upsert=True)
                
                return getSick(user, year)
        
        if request.method == "PUT":
            if userData:
                if sick > userData["sick"] or sick < 0:
                    return jsonify({"error": "Invalid sick days given"}), 400
                
                userCred = mongoCredentials.db.credentials.find_one({"username": user})
                
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
                            if (userData["lastdate"] - startdate).days < 0:
                                return jsonify({"error": "Invalid dates given"}), 400
                        
                    if startdate and lastdate:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.sick":sick,
                                                             "years.$.startdate":startdate,
                                                             "years.$.lastdate":lastdate}},
                                                   upsert=True)
                    elif startdate:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.sick":sick,
                                                             "years.$.startdate":startdate}},
                                                   upsert=True)
                    else:
                        mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                                   {"$set": {"years.$.sick":sick,
                                                             "years.$.lastdate":lastdate}},
                                                   upsert=True)
                
                else:
                    mongoLog.db.log.update_one({"_id": userCred["user_id"],"years.year":year},
                                               {"$set": {"years.$.sick":sick}},
                                               upsert=True)
                
                return getSick(user, year)
            
            return jsonify({"error": "No data found for year given"}), 404
    
    return jsonify({"error": "Not logged in"}), 403

'''
Log Data Helper Functions
'''

def getYearFromDatabase(user,year):
    userCred = mongoCredentials.db.credentials.find_one({"username": user})
        
    log = mongoLog.db.log.find_one({"_id": userCred["user_id"]})
        
    if log:
        for data in log["years"]:
            if data["year"] == year:
                return data
    return None

def start():
    app.run(debug=True,host='0.0.0.0')
    
if __name__ == '__main__':
    start()
