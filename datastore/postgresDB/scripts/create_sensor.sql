DROP TABLE sensor;
CREATE TABLE sensor (
   deviceId VARCHAR (100),
   sensorId VARCHAR(100),
   providerId VARCHAR(100),
   lastupdatetime BIGINT,
   batteryLife INT,
   PRIMARY KEY (deviceId, sensorId)
);
CREATE INDEX ON sensor (sensorId);
CREATE INDEX ON sensor (deviceId);
