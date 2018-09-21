'''
Created on Sep 18, 2018

@author: MaxShapiro32@ibm.com

Service for verifying and logging user into their account to use app
'''

from app.services import utils
import datetime
from flask import jsonify

def login(user,password):
    userCred = utils.getUserCredentials(user)
    if userCred and password == utils.decryptPassword(userCred["password"]):
        utils.updateUserCredentials(user, {"sessionend":datetime.datetime.utcnow()})
        return jsonify({"success":"Successfully logged in"})
    return jsonify({"error":"Did not log in"}),400