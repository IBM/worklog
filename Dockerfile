FROM python:3.7-alpine
MAINTAINER Max Shapiro "maxshapiro32@ibm.com"
RUN apk add gcc g++ make libffi-dev openssl-dev
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
ENTRYPOINT ["python"]
CMD ["-m", "app.__init__"]