'''
Created on Sep 7, 2018

@author: MaxShapiro32@ibm.com
'''

import unittest
from web import app
import docker
from flask_pymongo import PyMongo
import json

class TestScenarios(unittest.TestCase):
    def setUp(self):
        app.mongoCredentials = PyMongo(app.app, uri="mongodb://localhost:27017/credentials")
        app.mongoLog = PyMongo(app.app, uri="mongodb://localhost:27017/log")
        self.app = app.app.test_client()
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
        response = self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 200)
        
        '''Creating New User with Existing User Name'''
        response = self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid User Creating'''
        response = self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 400)
        
    def test_login(self):
        
        print("Test Login")
        
        '''Create New User'''
        self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        
        '''Successful Login'''
        response = self.app.post('http://localhost:5000/login',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 200)
        
        '''Invalid Login'''
        response = self.app.post('http://localhost:5000/login',
                                data=json.dumps({"username": "test", "password": "123"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 400)
        
    def test_reset_password(self):
        
        print("Test Reset Password")
        
        '''Create New User'''
        self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        
        '''Successful Password Reset'''
        response = self.app.put('http://localhost:5000/user/test/password/reset',
                                data=json.dumps({"new_password": "123", "password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 200)
        
        '''Failed Password Reset'''
        response = self.app.put('http://localhost:5000//user/test/password/reset',
                                data=json.dumps({"new_password": "123", "password": "abc"}),
                                content_type='application/json')
        self.assertEqual(response.status_code, 403)
        
    def test_year(self):
        
        print("Test Year")
        
        '''Create New User'''
        self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        
        '''Create Test Data'''
        self.app.post('http://localhost:5000/user/test/year/2018/office/1')
        
        '''Year Data Exists'''
        response = self.app.get('http://localhost:5000/user/test/year/2018')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['office'],1)
        
        '''Year Data Does Not Exist'''
        response = self.app.get('http://localhost:5000/user/test/year/2017')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.get('http://localhost:5000/user/test/year/not2018')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.get('http://localhost:5000/user/test2/year/2018')
        self.assertEqual(response.status_code, 403)
        
    def test_total(self):
        
        print("Test Total")
        
        '''Create New User'''
        self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        
        '''Create Test Data'''
        self.app.post('http://localhost:5000/user/test/year/2018/office/1')
        
        '''Total Data Exists'''
        response = self.app.get('http://localhost:5000/user/test/year/2018/total')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['total'],1)
        
        '''Total Data Does Not Exist'''
        response = self.app.get('http://localhost:5000/user/test/year/2017/total')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.get('http://localhost:5000/user/test/year/not2018/total')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.get('http://localhost:5000/user/test2/year/2018/total')
        self.assertEqual(response.status_code, 403)

    def test_office(self):
        
        print("Test Office")

        '''Updating Office'''

        '''Create New User'''
        self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        
        '''Create Test Data'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/office/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['office'],1)
        
        '''Update Test Data'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/office/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['office'],2)
        
        '''Invalid Year'''
        response = self.app.post('http://localhost:5000/user/test/year/not2017/office/1')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Office Total'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/office/400')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.post('http://localhost:5000/user/test2/year/2017/office/1')
        self.assertEqual(response.status_code, 403)
        
        '''Viewing Office'''
        
        '''Office Data Exists'''
        response = self.app.get('http://localhost:5000/user/test/year/2017/office')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['office'],2)
        
        '''No Year Found'''
        response = self.app.get('http://localhost:5000/user/test/year/2018/office')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.get('http://localhost:5000/user/test/year/not2017/office')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.get('http://localhost:5000/user/test2/year/2017/office')
        self.assertEqual(response.status_code, 403)
        
        '''Reset Office'''
        
        '''Reset Test Data'''
        response = self.app.put('http://localhost:5000/user/test/year/2017/office/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['office'],1)
        
        '''No Year Found'''
        response = self.app.put('http://localhost:5000/user/test/year/2018/office/1')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.put('http://localhost:5000/user/test/year/not2017/office/1')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Office Total'''
        response = self.app.put('http://localhost:5000/user/test/year/2017/office/400')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.put('http://localhost:5000/user/test2/year/2017/office/1')
        self.assertEqual(response.status_code, 403)
        
    def test_remote(self):
        
        print("Test Remote")

        '''Updating Remote'''

        '''Create New User'''
        self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        
        '''Create Test Data'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/remote/location/New York/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['remote']['locations']['New York'],1)
        
        '''Update Test Data'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/remote/location/New York/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['remote']['locations']['New York'],2)
        
        '''Invalid Year'''
        response = self.app.post('http://localhost:5000/user/test/year/not2017/remote/location/New York/1')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Remote Total'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/remote/location/New York/400')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.post('http://localhost:5000/user/test2/year/2017/remote/location/New York/1')
        self.assertEqual(response.status_code, 403)
        
        '''Viewing Remote'''
        
        '''Office Data Exists'''
        response = self.app.get('http://localhost:5000/user/test/year/2017/remote')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['remote']['total'],2)
        
        '''No Year Found'''
        response = self.app.get('http://localhost:5000/user/test/year/2018/remote')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.get('http://localhost:5000/user/test/year/not2017/remote')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.get('http://localhost:5000/user/test2/year/2017/remote')
        self.assertEqual(response.status_code, 403)
        
        '''Reset Remote'''
        
        '''Reset Test Data'''
        response = self.app.put('http://localhost:5000/user/test/year/2017/remote/location/New York/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['remote']['locations']['New York'],1)
        
        '''No Year Found'''
        response = self.app.put('http://localhost:5000/user/test/year/2018/remote/location/New York/1')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.put('http://localhost:5000/user/test/year/not2017/remote/location/New York/1')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Remote Total'''
        response = self.app.put('http://localhost:5000/user/test/year/2017/remote/location/New York/400')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.put('http://localhost:5000/user/test2/year/2017/remote/location/New York/1')
        self.assertEqual(response.status_code, 403)
    
    def test_vacation(self):
        
        print("Test Vacation")

        '''Updating Vacation'''

        '''Create New User'''
        self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        
        '''Create Test Data'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/vacation/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['vacation'],1)
        
        '''Update Test Data'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/vacation/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['vacation'],2)
        
        '''Invalid Year'''
        response = self.app.post('http://localhost:5000/user/test/year/not2017/vacation/1')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Vacation Total'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/vacation/400')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.post('http://localhost:5000/user/test2/year/2017/vacation/1')
        self.assertEqual(response.status_code, 403)
        
        '''Viewing Vacation'''
        
        '''Vacation Data Exists'''
        response = self.app.get('http://localhost:5000/user/test/year/2017/vacation')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['vacation'],2)
        
        '''No Year Found'''
        response = self.app.get('http://localhost:5000/user/test/year/2018/vacation')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.get('http://localhost:5000/user/test/year/not2017/vacation')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.get('http://localhost:5000/user/test2/year/2017/vacation')
        self.assertEqual(response.status_code, 403)
        
        '''Reset Vacation'''
        
        '''Reset Test Data'''
        response = self.app.put('http://localhost:5000/user/test/year/2017/vacation/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['vacation'],1)
        
        '''No Year Found'''
        response = self.app.put('http://localhost:5000/user/test/year/2018/vacation/1')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.put('http://localhost:5000/user/test/year/not2017/vacation/1')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Vacation Total'''
        response = self.app.put('http://localhost:5000/user/test/year/2017/vacation/400')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.put('http://localhost:5000/user/test2/year/2017/vacation/1')
        self.assertEqual(response.status_code, 403)
        
    def test_holidays(self):
        
        print("Test Holidays")

        '''Updating Holidays'''

        '''Create New User'''
        self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        
        '''Create Test Data'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/holidays/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['holidays'],1)
        
        '''Update Test Data'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/holidays/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['holidays'],2)
        
        '''Invalid Year'''
        response = self.app.post('http://localhost:5000/user/test/year/not2017/holidays/1')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Holidays Total'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/holidays/400')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.post('http://localhost:5000/user/test2/year/2017/holidays/1')
        self.assertEqual(response.status_code, 403)
        
        '''Viewing Holidays'''
        
        '''Holidays Data Exists'''
        response = self.app.get('http://localhost:5000/user/test/year/2017/holidays')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['holidays'],2)
        
        '''No Year Found'''
        response = self.app.get('http://localhost:5000/user/test/year/2018/holidays')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.get('http://localhost:5000/user/test/year/not2017/holidays')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.get('http://localhost:5000/user/test2/year/2017/holidays')
        self.assertEqual(response.status_code, 403)
        
        '''Reset Holidays'''
        
        '''Reset Test Data'''
        response = self.app.put('http://localhost:5000/user/test/year/2017/holidays/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['holidays'],1)
        
        '''No Year Found'''
        response = self.app.put('http://localhost:5000/user/test/year/2018/holidays/1')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.put('http://localhost:5000/user/test/year/not2017/holidays/1')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Holidays Total'''
        response = self.app.put('http://localhost:5000/user/test/year/2017/holidays/400')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.put('http://localhost:5000/user/test2/year/2017/holidays/1')
        self.assertEqual(response.status_code, 403)
        
    def test_sick(self):
        
        print("Test Sick")

        '''Updating Sick'''

        '''Create New User'''
        self.app.put('http://localhost:5000/user/create',
                                data=json.dumps({"username": "test", "password": "abc"}),
                                content_type='application/json')
        
        '''Create Test Data'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/sick/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['sick'],1)
        
        '''Update Test Data'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/sick/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['sick'],2)
        
        '''Invalid Year'''
        response = self.app.post('http://localhost:5000/user/test/year/not2017/sick/1')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Sick Total'''
        response = self.app.post('http://localhost:5000/user/test/year/2017/sick/400')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.post('http://localhost:5000/user/test2/year/2017/sick/1')
        self.assertEqual(response.status_code, 403)
        
        '''Viewing Sick'''
        
        '''Sick Data Exists'''
        response = self.app.get('http://localhost:5000/user/test/year/2017/sick')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['sick'],2)
        
        '''No Year Found'''
        response = self.app.get('http://localhost:5000/user/test/year/2018/sick')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.get('http://localhost:5000/user/test/year/not2017/sick')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.get('http://localhost:5000/user/test2/year/2017/sick')
        self.assertEqual(response.status_code, 403)
        
        '''Reset Sick'''
        
        '''Reset Test Data'''
        response = self.app.put('http://localhost:5000/user/test/year/2017/sick/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['sick'],1)
        
        '''No Year Found'''
        response = self.app.put('http://localhost:5000/user/test/year/2018/sick/1')
        self.assertEqual(response.status_code, 404)
        
        '''Invalid Year'''
        response = self.app.put('http://localhost:5000/user/test/year/not2017/sick/1')
        self.assertEqual(response.status_code, 400)
        
        '''Invalid Sick Total'''
        response = self.app.put('http://localhost:5000/user/test/year/2017/sick/400')
        self.assertEqual(response.status_code, 400)
        
        '''Not Logged In'''
        response = self.app.put('http://localhost:5000/user/test2/year/2017/sick/1')
        self.assertEqual(response.status_code, 403)

if __name__ == "__main__":
    unittest.main()