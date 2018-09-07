'''
Created on Sep 7, 2018

@author: MaxShapiro32@ibm.com
'''
import unittest
import requests

class TestScenarios(unittest.TestCase):
    
    def test_users(self):
        
        print("Test Create User")
        '''Create New User'''
        response = requests.request('PUT','http://localhost:5000/user/create', headers={"Content-Type": "application/json"},json='{"username": "test", "password": "abc"}')
        self.assertEqual(response.status_code,200)
        
        '''Creating New User with Existing User Name'''
        response = requests.request('PUT','http://localhost:5000/user/create', headers={"Content-Type": "application/json"},json='{"username": "test", "password": "abc"}')
        self.assertEqual(response.status_code,400)
        
        '''Invalid User Creating'''
        response = requests.request('PUT','http://localhost:5000/user/create', headers={"Content-Type": "application/json"},json='{"password": "abc"}')
        self.assertEqual(response.status_code,400)
        
        print("Test Login")
        #response = requests.request('GET','http://localhost:5000/user/max/year/2018')
        #self.assertEqual(response.status_code,403)
        
        


if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()