'''
Created on Sep 17, 2018

@author: MaxShapiro32@ibm.com

Utility functions for restful end points
'''

from decorator import decorator
from flask import jsonify
import datetime
from app.services import utils

@decorator
def logged_in(func, *args, **kwargs):
    userCred = utils.getUserCredentials(args[0])
    if userCred and (datetime.datetime.utcnow() - userCred["sessionend"]) < datetime.timedelta(minutes=20):
        return func(*args,**kwargs)
    else:
        return jsonify({"error": "Not logged in"}), 403