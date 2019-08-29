DROP TABLE device;
CREATE TABLE device (
   id VARCHAR (100) PRIMARY KEY,
   sensorId VARCHAR(100) NOT NULL,
   providerId VARCHAR(100),
   networkType VARCHAR(50),
   originTime BIGINT,
   lastUpdateTime BIGINT,
   deviceType VARCHAR (100),
   Lat REAL,
   Lon REAL
);
CREATE INDEX ON device (sensorId);
CREATE INDEX ON device (providerId);
