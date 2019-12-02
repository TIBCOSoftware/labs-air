CREATE DATABASE tibcolabs_air_v164 WITH OWNER=OTHER_USER;

DROP TABLE subscription;
CREATE TABLE subscription (
	uuid VARCHAR(100) PRIMARY KEY,
	subscription VARCHAR(100),
	type VARCHAR(100),
	name VARCHAR(100),
	created TIMESTAMP NOT NULL DEFAULT NOW(),
	updated TIMESTAMP NOT NULL DEFAULT NOW(),	destination VARCHAR(500),
	protocol VARCHAR(20),
	method VARCHAR(20),
	address VARCHAR(500),
	port VARCHAR(10),
	path VARCHAR(500),
	format VARCHAR(20),
	enabled BOOLEAN,
	username VARCHAR(50),
	password VARCHAR(50),
	topic VARCHAR(50),
	encryptionAlgorithm VARCHAR(20),
	encryptionKey VARCHAR(300),
	initializingVector VARCHAR(50),
	compression VARCHAR(20),
	deviceIdentifierFilter VARCHAR(200),
	valueDescriptorIdentifierFilter VARCHAR(200)
);
CREATE INDEX ON subscription (name);

DROP TABLE gateway;
CREATE TABLE gateway (
	uuid VARCHAR(100) PRIMARY KEY,
	subscriptionid VARCHAR(100),
	gateway VARCHAR(100),
	url VARCHAR(100),
	latitude REAL,
	longitude REAL,
	created TIMESTAMP NOT NULL DEFAULT NOW(),
	updated TIMESTAMP NOT NULL DEFAULT NOW()
);

DROP TABLE profile;
CREATE TABLE profile (
   profileid VARCHAR(100) PRIMARY KEY,
   name VARCHAR(50),
   description VARCHAR(500),
   manufacturer VARCHAR(100),
   created TIMESTAMP NOT NULL DEFAULT NOW(),
   updated TIMESTAMP NOT NULL DEFAULT NOW(),
   model VARCHAR(50),
   labels VARCHAR(100)
);
CREATE INDEX ON profile (manufacturer);

DROP TABLE device;
CREATE TABLE device (
   deviceid VARCHAR (100) PRIMARY KEY,
   gatewayid VARCHAR (100),
   profileid VARCHAR(100),
   subscriptionid VARCHAR(100),
   name VARCHAR(50),
   description VARCHAR (500),
   networktype VARCHAR(50),
   created TIMESTAMP NOT NULL DEFAULT NOW(),
   updated TIMESTAMP NOT NULL DEFAULT NOW(),
   devicetype VARCHAR (100),
   adminstate VARCHAR(50),
   operatingstate VARCHAR(50),
   batterylife REAL,
   latitude REAL,
   longitude REAL
);
CREATE INDEX ON device (gatewayid);
CREATE INDEX ON device (profileid);

DROP TABLE resource;
CREATE TABLE resource (
   resourceid VARCHAR(100),
   deviceid VARCHAR (100),
   name VARCHAR(50),
   description VARCHAR(500),
   created TIMESTAMP NOT NULL DEFAULT NOW(),
   updated TIMESTAMP NOT NULL DEFAULT NOW(),
   interface VARCHAR(10),
   pinnum VARCHAR(10),
   pintype VARCHAR(10),
   normalize BOOLEAN,
   PRIMARY KEY (resourceid, deviceid)
);
CREATE INDEX ON resource (resourceid);
CREATE INDEX ON resource (deviceid);

DROP TABLE instrument;
CREATE TABLE instrument (
	attrname VARCHAR(100),
	deviceid VARCHAR(100),
	resourceid VARCHAR(100),
	attrtype VARCHAR(50),
	created TIMESTAMP NOT NULL DEFAULT NOW(),
	updated TIMESTAMP NOT NULL DEFAULT NOW(),
	readwrite VARCHAR(10),
	minimum REAL,
	maximum REAL,
	defaultvalue REAL,
	scale BIGINT,
	unittype VARCHAR(20),
	unitreadwrite VARCHAR(10),
	unitdefaultvalue VARCHAR(50), 
	PRIMARY KEY (attrname, deviceid, resourceid)
);
CREATE INDEX ON instrument (attrname);
CREATE INDEX ON instrument (deviceid);
CREATE INDEX ON instrument (resourceid);

DROP TABLE sensor_data;
CREATE TABLE sensor_data (
	seqno BIGSERIAL PRIMARY KEY,
	id VARCHAR(100),
	gatewayid VARCHAR(50),
	deviceid VARCHAR(100),
	resourceid VARCHAR(100),
	channel VARCHAR(10),
	battery REAL,
	origin BIGINT,
	received BIGINT,
	attrname VARCHAR(100),
	attrtype VARCHAR(50),
	attrvalue VARCHAR(100)
);
CREATE INDEX ON sensor_data (id);
CREATE INDEX ON sensor_data (gatewayid);
CREATE INDEX ON sensor_data (deviceid);
CREATE INDEX ON sensor_data (resourceid);
CREATE INDEX ON sensor_data (attrname);

DROP TABLE pinmap;
CREATE TABLE pinmap (
   profileid VARCHAR(100),
   pinnum VARCHAR(10),
   x_coordinate REAL,
   y_coordinate REAL,
   created TIMESTAMP NOT NULL DEFAULT NOW(),
   updated TIMESTAMP NOT NULL DEFAULT NOW(),
   PRIMARY KEY (profileid, pinnum)
);
CREATE INDEX ON pinmap (profileid);
