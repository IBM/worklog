'''
Created on Feb 1, 2018

@author: Max Shapiro (MaxShapiro32@ibm.com)

Parent application that loads and runs child application
'''

def run_app():
    from app.web import create_app
    
    create_app().run(host='0.0.0.0')

if __name__ == "__main__":
    run_app()