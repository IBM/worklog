'''
Created on Sep 7, 2018

@author: MaxShapiro32@ibm.com

Automated test bed for testing app
'''

import unittest
import app.web
from app.services import utils
import docker
from pymongo import MongoClient
import json

class TestScenarios(unittest.TestCase):
    def setUp(self):
        utils.mongoCredentials = MongoClient("mongodb://localhost:27017/credentials")
        utils.mongoLog = MongoClient("mongodb://localhost:27017/log")
        self.app = app.web.create_app().test_client()
        self.app.testing = True
        
        self.client = docker.from_env()
        cont = self.client.containers.list(all=True)
        for c in cont:
            if c.name == 'mongo':
                c.kill()
                c.remove()
        self.container = self.client.containers.run('mongo',
                                                    name='mongo',
                                                    ports={'27017':'27017'},
                                                    restart_policy={'Name':'always'},
                                                    detach=True)
        
    def tearDown(self):
        self.container.kill()
        self.container.remove(v=True)
        self.client.close()
    
    def test_create_user(self):
        
        print("Test Create User")
        
        '''Create New User'''
        response = self.app.put('http://localhost:5000/api/v1/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 200)
        
        '''Creating New User with Existing User Name'''
        response = self.app.put('http://localhost:5000/api/v1/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid User Creating'''
        response = self.app.put('http://localhost:5000/api/v1/user/create',
                                data=json.dumps({"password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 400)
        
    def test_delete_user(self):
        
        print("Test Delete User")
        
        '''Create New User'''
        self.app.put('http://localhost:5000/api/v1/user/create',
                     data=json.dumps({"username": "test", "password": "abc"}),
                     content_type='application/json')
        
        '''User Not Deleted'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test')
        self.assertEqual(response.status_code, 404)
        
        '''Delete User'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test?deleteuser=true')
        self.assertEqual(response.status_code, 200)
        
        '''Invalid Delete User'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test')
        self.assertEqual(response.status_code, 403)
        
    def test_login(self):
        
        print("Test Login")
        
        '''Create New User'''
        self.app.put('http://localhost:5000/api/v1/user/create',
                     data=json.dumps({"username": "test", "password": "abc"}),
                     content_type='application/json')
        
        '''Successful Login'''
        response = self.app.post('http://localhost:5000/api/v1/login',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 200)
        
        '''Invalid Login'''
        response = self.app.post('http://localhost:5000/api/v1/login',
                                data=json.dumps({"username": "test", "password": "123"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 400)
        
    def test_reset_password(self):
        
        print("Test Reset Password")
        
        '''Create New User'''
        self.app.put('http://localhost:5000/api/v1/user/create',
                     data=json.dumps({"username": "test", "password": "abc"}),
                     content_type='application/json')
        
        '''Successful Password Reset'''
        response = self.app.put('http://localhost:5000/api/v1/user/test/reset',
                                data=json.dumps({"new_password": "123", "password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 200)
        
        '''Failed Password Reset'''
        response = self.app.put('http://localhost:5000/api/v1/user/test/reset',
                                data=json.dumps({"new_password": "123", "password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 403)
        
    def test_all_work_log_data(self):
        
        print("Test All Work Log Data")
        
        '''Create New User'''
        self.app.put('http://localhost:5000/api/v1/user/create',
                     data=json.dumps({"username": "test", "password": "abc"}),
                     content_type='application/json')
        
        '''Create Test Data'''
        self.app.post('http://localhost:5000/api/v1/user/test?date=2017-01-01&type=office')
        
        self.app.post('http://localhost:5000/api/v1/user/test?date=2018-01-01&type=office')
        
        '''View All Work Log Data'''
        response = self.app.get('http://localhost:5000/api/v1/user/test')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.get_json()['years']),2)
        
        '''Not Logged In'''
        response = self.app.get('http://localhost:5000/api/v1/user/test2')
        self.assertEqual(response.status_code, 403)
        
        '''Invalid Delete All Work Log Data'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test')
        self.assertEqual(response.status_code, 404)
        
        '''Delete All Work Log Data'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test?deleteall=true')
        self.assertEqual(response.status_code, 200)
        
        '''Not Logged In'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test2')
        self.assertEqual(response.status_code, 403)
        
    def test_year(self):
        
        print("Test Year")
        
        '''Create New User'''
        self.app.put('http://localhost:5000/api/v1/user/create',
                     data=json.dumps({"username": "test", "password": "abc"}),
                     content_type='application/json')
        
        '''Create Test Data'''
        self.app.post('http://localhost:5000/api/v1/user/test?date=2018-01-01&type=office')
        
        '''View Year Data'''
        response = self.app.get('http://localhost:5000/api/v1/user/test?year=2018')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['year'],2018)
        
        '''Year Data Does Not Exist'''
        response = self.app.get('http://localhost:5000/api/v1/user/test?year=2017')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.get('http://localhost:5000/api/v1/user/test?year=not2018')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.get('http://localhost:5000/api/v1/user/test2?year=2018')
        self.assertEqual(response.status_code, 403)
        
        '''Year Data Not Deleted'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test?deleteyear=true')
        self.assertEqual(response.status_code, 404)
        
        '''Delete Year'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test?year=2018&deleteyear=true')
        self.assertEqual(response.status_code, 200)
        
        '''Invalid Year'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test?year=not2018&deleteyear=true')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test2?year=2018&deleteyear=true')
        self.assertEqual(response.status_code, 403)
    
        
    def test_entry(self):
        
        print("Test Entry")
        
        '''Create New User'''
        self.app.put('http://localhost:5000/api/v1/user/create',
                     data=json.dumps({"username": "test", "password": "abc"}),
                     content_type='application/json')
        
        '''Create Entry'''
        
        '''Create Office Entry'''
        response = self.app.post('http://localhost:5000/api/v1/user/test?date=2018-01-01&type=office')
        self.assertEqual(response.status_code, 200)
        
        '''Create Remote Entry'''
        response = self.app.post('http://localhost:5000/api/v1/user/test?date=2018-01-02&type=remote&location=New York')
        self.assertEqual(response.status_code, 200)
        
        '''Create Vacation Entry'''
        response = self.app.post('http://localhost:5000/api/v1/user/test?date=2018-01-03&type=vacation')
        self.assertEqual(response.status_code, 200)
        
        '''Create Holidays Entry'''
        response = self.app.post('http://localhost:5000/api/v1/user/test?date=2018-01-04&type=holidays')
        self.assertEqual(response.status_code, 200)
        
        '''Create Sick Entry'''
        response = self.app.post('http://localhost:5000/api/v1/user/test?date=2018-01-05&type=sick')
        self.assertEqual(response.status_code, 200)
        
        '''Entry for Date Already Exists'''
        response = self.app.post('http://localhost:5000/api/v1/user/test?date=2018-01-01&type=office')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Date'''
        response = self.app.post('http://localhost:5000/api/v1/user/test?date=2018-40-01&type=office')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Type'''
        response = self.app.post('http://localhost:5000/api/v1/user/test?date=2018-01-09&type=notoffice')
        self.assertEqual(response.status_code, 400)
        
        '''No Date Specified'''
        response = self.app.post('http://localhost:5000/api/v1/user/test?type=office')
        self.assertEqual(response.status_code, 400)
        
        '''No Type Specified'''
        response = self.app.post('http://localhost:5000/api/v1/user/test?date=2018-01-09')
        self.assertEqual(response.status_code, 400)
        
        '''No Location Specified'''
        response = self.app.post('http://localhost:5000/api/v1/user/test?date=2018-01-09&type=remote')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.post('http://localhost:5000/api/v1/user/test2?date=2018-01-01&type=office')
        self.assertEqual(response.status_code, 403)
        
        '''Update Entry'''
        
        '''Successful Update Entry'''
        response = self.app.put('http://localhost:5000/api/v1/user/test?date=2018-01-02&type=office')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['type'],"office")
        
        '''Invalid Date'''
        response = self.app.put('http://localhost:5000/api/v1/user/test?date=2018-40-01&type=office')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Type'''
        response = self.app.put('http://localhost:5000/api/v1/user/test?date=2018-01-02&type=notoffice')
        self.assertEqual(response.status_code, 400)
        
        '''No Date Specified'''
        response = self.app.put('http://localhost:5000/api/v1/user/test?type=office')
        self.assertEqual(response.status_code, 400)
        
        '''No Type Specified'''
        response = self.app.put('http://localhost:5000/api/v1/user/test?date=2018-01-02')
        self.assertEqual(response.status_code, 400)
        
        '''No Location Specified'''
        response = self.app.put('http://localhost:5000/api/v1/user/test?date=2018-01-02&type=remote')
        self.assertEqual(response.status_code, 400)
        
        '''No Date Found'''
        response = self.app.put('http://localhost:5000/api/v1/user/test?date=2018-02-01&type=office')
        self.assertEqual(response.status_code, 404)
        
        '''Not Logged In'''
        response = self.app.put('http://localhost:5000/api/v1/user/test2?date=2018-01-01&type=office')
        self.assertEqual(response.status_code, 403)
        
        '''View Entry'''
        
        '''Successful View Entry'''
        response = self.app.get('http://localhost:5000/api/v1/user/test?date=2018-01-01')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['type'],"office")
        
        '''No Date Found'''
        response = self.app.get('http://localhost:5000/api/v1/user/test?date=2018-02-01')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Date'''
        response = self.app.get('http://localhost:5000/api/v1/user/test?date=2018-40-01')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.get('http://localhost:5000/api/v1/user/test2?date=2018-01-01&type=office')
        self.assertEqual(response.status_code, 403)
        
        '''Delete Entry'''
        
        '''Invalid Date'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test?date=2018-40-01')
        self.assertEqual(response.status_code, 400)
        
        '''No Date Specified'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test')
        self.assertEqual(response.status_code, 404)
        
        '''No Date Data Deleted'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test?date=2018-02-01')
        self.assertEqual(response.status_code, 404)
        
        '''Successful Delete Entry'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test?date=2018-01-01')
        self.assertEqual(response.status_code, 200)
        
        '''Not Logged In'''
        response = self.app.delete('http://localhost:5000/api/v1/user/test2?date=2018-01-01')
        self.assertEqual(response.status_code, 403)

if __name__ == "__main__":
    unittest.main()