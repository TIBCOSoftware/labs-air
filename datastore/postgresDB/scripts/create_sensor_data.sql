DROP TABLE sensor_data1;
CREATE TABLE sensor_data1 (
   id VARCHAR (100) PRIMARY KEY,
   sensorId VARCHAR(100) NOT NULL,
   deviceid VARCHAR(100),
   providerId VARCHAR(100),
   channel VARCHAR(50),
   batteryLife INT,
   originTime BIGINT,
   lastUpdateTime BIGINT,
   attrname VARCHAR (100),
   attrtype VARCHAR (50),
   attrvalue VARCHAR (100)
);
CREATE INDEX ON sensor_data1 (sensorId);
CREATE INDEX ON sensor_data1 (providerId);
alter table sensor_data1 add constraint sensor_data1_device_fkey FOREIGN KEY (deviceId) REFERENCES device (id);
