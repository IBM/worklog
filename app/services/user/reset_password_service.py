'''
Created on Sep 18, 2018

@author: MaxShapiro32@ibm.com

Service for user to change their account password
'''

from app.services import utils
from flask import jsonify

def resetPassword(user,password,newPassword):
    userCred = utils.getUserCredentials(user)
        
    if userCred and password == utils.decryptPassword(userCred["password"]):
        utils.updateUserCredentials(user, {"password": utils.encryptPassword(newPassword)})

        userCred = utils.getUserCredentials(user)
            
        if userCred and newPassword == utils.decryptPassword(userCred["password"]):
            return jsonify({"success":"Password reset"})
        
    return None