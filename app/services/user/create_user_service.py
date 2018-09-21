'''
Created on Sep 18, 2018

@author: MaxShapiro32@ibm.com

Service for creating a new user in the database
'''

from app.services import utils
from flask import jsonify

def createUser(user,password):
    userCred = utils.getUserCredentials(user)
    
    if userCred:
        return jsonify({"error":"User already exists"}),400
    
    userCred = utils.createUserInDatabase(user, password)
    
    if userCred:
        return jsonify({"success":"User "+ user + " created"})
    
    return None