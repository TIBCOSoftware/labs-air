DROP TABLE INSTRUMENT;
create TABLE INSTRUMENT (
	ID VARCHAR(100) NOT NULL,
	DEVICEID VARCHAR(100) NOT NULL,
    DEVICENAME VARCHAR(100) NOT NULL,
	PROFILEID VARCHAR(100) NOT NULL,
    PROFILENAME VARCHAR(100) NOT NULL,
	GATEWAYID VARCHAR(100) NOT NULL,
	DESCRIPTION VARCHAR(1024),
	VALUETYPE VARCHAR(100),
	VALUEREADWRITE VARCHAR(20),
	MINIMUMVALUE VARCHAR(20),
	MAXIMUMVALUE VARCHAR(20),
	DEFAULTVALUE VARCHAR(20),
	UNITTYPE VARCHAR(20),
	UNITREADWRITE VARCHAR(20),
	UNITDEFAULTVALUE VARCHAR(20),
	CREATED TIMESTAMP,
	UPDATED TIMESTAMP,
	PRIMARY KEY (ID, DEVICEID, PROFILEID, GATEWAYID)
);
CREATE INDEX ON INSTRUMENT (ID);
CREATE INDEX ON INSTRUMENT (DEVICEID);
CREATE INDEX ON INSTRUMENT (PROFILEID);
CREATE INDEX ON INSTRUMENT (GATEWAYID);

DROP TABLE DEVICE;
create TABLE DEVICE (
	ID VARCHAR(100) PRIMARY KEY,
    GATEWAYID VARCHAR(100) NOT NULL,
	PROFILEID VARCHAR(100) NOT NULL,
    NAME VARCHAR(100),
	DESCRIPTION VARCHAR(1024),
    OPERATINGSTATE VARCHAR(50),
    ADMINSTATE VARCHAR(50),
	CREATED TIMESTAMP,
	UPDATED TIMESTAMP
);
CREATE INDEX ON DEVICE (GATEWAYID);
CREATE INDEX ON DEVICE (PROFILEID);

DROP TABLE PROFILE;
create TABLE PROFILE (
	ID VARCHAR(100) PRIMARY KEY,
    NAME VARCHAR(100),
	DESCRIPTION VARCHAR(1024),
    MANUFACTURER VARCHAR(100),
    MODEL VARCHAR(100),
    LABELS VARCHAR(100),
	CREATED TIMESTAMP,
	UPDATED TIMESTAMP
);
CREATE INDEX ON PROFILE (MANUFACTURER);

DROP TABLE GATEWAY;
create TABLE GATEWAY (
	ID VARCHAR(100) PRIMARY KEY,
	DESCRIPTION VARCHAR(1024),
    LATITUDE REAL,
    LONGITUDE REAL,
	CREATED TIMESTAMP,
	UPDATED TIMESTAMP
);

DROP TABLE READINGS;
create TABLE READINGS (
	ID VARCHAR(100) PRIMARY KEY,
    CREATED TIMESTAMP NOT NULL,
    GATEWAYID VARCHAR(100) NOT NULL,
    DEVICEID VARCHAR(100) NOT NULL,
	RESOURCEID VARCHAR(100) NOT NULL,
    VALUE VARCHAR(100) NOT NULL
);

CREATE INDEX ON READINGS (ID);
CREATE INDEX ON READINGS (GATEWAYID);
CREATE INDEX ON READINGS (DEVICEID);
CREATE INDEX ON READINGS (RESOURCEID);


DROP TABLE READINGS_NUMERIC;
create TABLE READINGS_NUMERIC (
	ID VARCHAR(100) PRIMARY KEY,
    CREATED TIMESTAMP NOT NULL,
    GATEWAYID VARCHAR(100) NOT NULL,
    DEVICEID VARCHAR(100) NOT NULL,
	RESOURCEID VARCHAR(100) NOT NULL,
    VALUE NUMERIC NOT NULL
);

CREATE INDEX ON READINGS_NUMERIC (ID);
CREATE INDEX ON READINGS_NUMERIC (GATEWAYID);
CREATE INDEX ON READINGS_NUMERIC (DEVICEID);
CREATE INDEX ON READINGS_NUMERIC (RESOURCEID);


DROP TABLE READINGS_STRING;
create TABLE READINGS_STRING (
	ID VARCHAR(100),
    CREATED TIMESTAMP NOT NULL,
    GATEWAYID VARCHAR(100),
    DEVICEID VARCHAR(100),
	RESOURCEID VARCHAR(100),
    VALUE TEXT NOT NULL,
	PRIMARY KEY (ID, GATEWAYID, DEVICEID, RESOURCEID)
);

CREATE INDEX ON READINGS_STRING (ID);
CREATE INDEX ON READINGS_STRING (GATEWAYID);
CREATE INDEX ON READINGS_STRING (DEVICEID);
CREATE INDEX ON READINGS_STRING (RESOURCEID);
