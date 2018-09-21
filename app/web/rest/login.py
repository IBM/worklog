'''
Created on Sep 17, 2018

@author: MaxShapiro32@ibm.com

Login restful end point handling
'''

from flask import Blueprint, request
from app.services.user import login_service

login_v1_blueprint = Blueprint('login_v1_api', __name__)

@login_v1_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    return login_service.login(data['username'], data['password'])