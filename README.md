[![Build Status](https://travis-ci.com/IBM/worklog.svg?branch=master)](https://travis-ci.com/IBM/worklog)

# Work Log
In this Code Pattern, we will create a Work Log web application using Flask, MongoDB, and Kubernetes. The Work Log application is used to keep track of and log different types of days that are associated with work. The different types of days include:

* Working in the office
* Working remotely
* Vacation days
* Holidays
* Sick days

When the reader has completed this Code Pattern, they will understand how to:

* Create a Python Flask application
* Incorporate MongoDB into a Python application
* Deploy and run microservices on Kubernetes


![](readme_images/architecture.png)

## Architecture

1. User interacts with the App UI to initially create an account, login to account, or reset password for their account. Once User is logged in, they can view, add, and edit their work log data.
2. The functionality of the App UI that the User interacts with is handled by React. React is where the API calls are initialized.
3. The API calls are processed in the Flask API microservice on Kubernetes and are handled accordingly.
4. The data is stored, gathered, and/or modified in MongoDB depending on the API calls.
5. The response from the API calls are handled accordingly be the App UI.


## Included components

* [IBM Cloud Container Service](https://console.bluemix.net/docs/containers/container_index.html):  IBM Bluemix Container Service manages highly available apps inside Docker containers and Kubernetes clusters on the IBM Cloud.
* [Swagger](https://swagger.io/): A framework of API developer tools for the OpenAPI Specification that enables development across the entire API lifecycle.

<!--Update this section-->
## Featured technologies

* [Container Orchestration](https://www.ibm.com/cloud-computing/bluemix/containers): Automating the deployment, scaling and management of containerized applications.
* [Microservices](https://www.ibm.com/developerworks/community/blogs/5things/entry/5_things_to_know_about_microservices?lang=en): Collection of fine-grained, loosely coupled services using a lightweight protocol to provide building blocks in modern application composition in the cloud.
* [Python](https://www.python.org/): Python is a programming language that lets you work more quickly and integrate your systems more effectively.
* [Flask](http://flask.pocoo.org/): A microframework for Python for building APIs.
* [React](https://facebook.github.io/react/): JavaScript library for building User Interfaces.
* [MongoDB](https://www.mongodb.com/): A document NoSQL database.


# Steps

## Run the Application
Follow these steps to setup and run this code pattern locally and on the Cloud. The steps are described in detail below.

### Prerequisite

* [Docker](https://www.docker.com/products/docker-desktop)
* [IBM Cloud Kubernetes Service Provisioned](https://www.ibm.com/cloud/container-service)

For running these services locally without Docker containers, the following will be needed:

* [Python 3.7](https://www.python.org/downloads/release/python-370/)
* [Relevant Python Libraries](requirements.txt): Use `pip3.7 install`
* [MongoDB](https://www.mongodb.com/download-center/v2/community)
* [NPM](https://www.npmjs.com/get-npm)
* Relevant React Components: Use `npm install`


1. [Clone the repo](#1-clone-the-repo)
2. [Run the application](#2-run-the-application)
3. [Deploy to IBM Cloud](#3-deploy-to-ibm-cloud)

### 1. Clone the repo

Clone the `worklog` repo locally. In a terminal, run:

```
$ git clone https://github.com/IBM/worklog
```

### 2. Run the application
1. Start the application by running `docker-compose up --build` in the `/worklog` directory.
2. Once the containers are created and the application is running, use the Swagger at `http://localhost:5000/api` and [API.md](API.md) for instructions on how to use the APIs.
3. Use `http://localhost:3000` to access the React UI.

### 3. Deploy to IBM Cloud
1. Provision the [IBM Cloud Kubernetes Service](https://www.ibm.com/cloud/container-service) and follow the instructions for creating a Container and Cluster.
2. For making changes to either the Flask application or the React UI, a repo will need to be created on the [Docker Cloud](https://cloud.docker.com/) where the new modified containers will be pushed to. Once the repo is created and the account associated with the repo is logged into on the local machine, either navigate to `cd worklog` for changes made to the Flask application or `cd worklog/web/worklog` for changes made to the React UI. Once in the relevant directory, run `docker build -t <REPO_NAME> .` and `docker push <REPO_NAME>` to build and push the container to the repo.
3. If a new repo is used for the Docker containers, the container `image` will need to be modified to the name of the new repo used in [deploy-webapp.yml](deploy-webapp.yml) and/or [deploy-webappui.yml](deploy-webappui.yml).
4. Run `bx cs cluster-get <CLUSTER_NAME>` and locate the `Ingress Subdomain` and `Ingress Secret`. This is the domain of the URL that is to be used to access the UI and Flask Application on the Cloud. Update the `env` values in both [deploy-webapp.yml](deploy-webapp.yml) and [deploy-webappui.yml](deploy-webappui.yml) to the `Ingress Subdomain`. In addition, update the `host` and `secretName` in [ingress.yml](ingress.yml) to `Ingress Subdomain` and `Ingress Secret`.
5. From `cd worklog`, run `kubectl apply -f deploy-mongodb.yml`, `kubectl apply -f deploy-webapp.yml`, and `kubectl apply -f deploy-webappui.yml` to deploy the services to the IBM Cloud Kubernetes Service.
6. From `cd worklog`, run `kubectl apply -f ingress.yml` to update the protocol being used to `https`.
7. Use `https://<INGRESS_SUBDOMAIN>` to access the React UI at `https://<INGRESS_SUBDOMAIN>` and also the Swagger at `https://<INGRESS_SUBDOMAIN>/api` for instructions on how to make API calls.


# Links
* [Flask](http://flask.pocoo.org/)
* [Swagger Editor](https://editor.swagger.io/)


# Learn more
* **Container Code Patterns**: Enjoyed this Code Pattern? Check out our other [Container Code Patterns](https://developer.ibm.com/patterns/category/containers/).
* **Python Code Patterns**: Enjoyed this Code Pattern? Check out our other [Python Code Patterns](https://developer.ibm.com/patterns/category/python/).

# License
[Apache 2.0](LICENSE)
