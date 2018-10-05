'''
Created on Sep 17, 2018

@author: Max Shapiro (MaxShapiro32@ibm.com)

Initializer for the work log application
'''

from flask import Flask
from flasgger import Swagger
import yaml
from flask_cors import CORS
import os

def create_app():
    worklog_app = Flask(__name__)
    
    from app.web.rest.login import login_v1_blueprint
    from app.web.rest.user import user_v1_blueprint
    
    worklog_app.register_blueprint(login_v1_blueprint, url_prefix="/api/v1")
    worklog_app.register_blueprint(user_v1_blueprint, url_prefix="/api/v1")
    
    with open("app/web/swagger.yaml") as stream:
        swagger = yaml.safe_load(stream)

    swagger["host"] = os.getenv("HOST_IP", "localhost:5000")
    
    if swagger["host"] == "localhost:5000":
        swagger["schemes"] = ["http"]

    Swagger(worklog_app, template=swagger, config=getSwaggerConfig())
    
    CORS(worklog_app)
    
    return worklog_app

def getSwaggerConfig():
    return {
        "headers":[
        ], 
        "specs":[
            {
                "endpoint":'apispec', 
                "route":'/apispec.json', 
                "rule_filter":lambda rule:True, # all in
                "model_filter":lambda tag:True, # all in
            }
        ], 
        "static_url_path":"/flasgger_static", 
        # "static_folder": "static",  # must be set by user
        "swagger_ui":True, 
        "specs_route":"/api/"
    }