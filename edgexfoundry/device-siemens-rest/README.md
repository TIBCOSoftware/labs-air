# device-siemens-rest
EdgeX device service for REST protocol

This device service provides easy way for 3'rd party applications, such as Point of Sale, CV Analytics, etc., to push data into EdgeX via the REST protocol. 

## Runtime Requisite

- core-data
  - Mongo or Redis DB
- core-metadata

## REST Endpoints

This device service creates the additional parametrized `REST` endpoint:

```
/ap1/vi/device/{deviceName}/{resourceName}
```

- `deviceName` refers to the `device` defined in a `device profile` and the `configuration.toml`.
- `resourceName`refers to the `device resource` defined in the `device profile` that `deviceName` references.

The data posted to this endpoint is type validated and type casted to the type defined by the specified `device resource`. The resulting value is then sent into EdgeX via the Device SDK's `async values` channel. 

## Configuration

This device service use the standard configuration defined by the **Device SDK**. 

The `DeviceList` configuration is standard except that the `DeviceList.Protocols` can be empty. The following is a sample `DeviceList` that works with the sample device profiles shown below.

```toml
[[DeviceList]]
  Name = "sample-json"
  Profile = "sample-json"
  Description = "RESTful Device that sends in JSON data"
  Labels = [ "rest", "json" ]
  [DeviceList.Protocols]
    [DeviceList.Protocols.other]
[[DeviceList]]
  Name = "sample-numbers"
  Profile = "sample-numbers"
  Description = "RESTful Device that sends in number data"
  Labels = [ "rest", "float", "int" ]
  [DeviceList.Protocols]
    [DeviceList.Protocols.other]
```

## Device Profile

As with all device services the `device profile` is where the **Device Name**, **Device Resources** and **Device Commands** are define. The parameterized REST endpoint described above references these definitions. Each `Device` has it's own device profile. The following are the two sample device profiles that define the devices referenced in the above sample configuration.

**sample-json-device.ymal**:

```yaml
name: "sample-json"
manufacturer: "Intel Corp."
model: "Some 3rd party app sending JSON"
labels:
 - "rest"
 - "json"
description: "REST Device that sends in Json"

deviceResources:
  - name: json
    description: "JSON message containing the details"
    properties:
      value:
        { type: "String", readWrite: "W" , defaultValue: "" }
      units:
        { type: "String", readWrite: "R", defaultValue: "" }
deviceCommands:
  - name: jsonCmd
    get:
      - { operation: "get", object: "json" }
```

**sample-numbers-device.yaml:**

```yaml
name: "sample-numbers"
manufacturer: "Intel Corp."
model: "Some 3rd party App sending int & floats"
labels:
 - "rest"
 - "float64"
 - "int64"
description: "REST Device that sends in ints and floats"

deviceResources:
  - name: int
    description: "Int64 data"
    properties:
      value:
        { type: "Int64", readWrite: "W" , defaultValue: "" }
      units:
        { type: "String", readWrite: "R", defaultValue: "" }
  - name: float
    description: "Float64 data"
    properties:
      value:
        { type: "Float64", readWrite: "W" , defaultValue: "" }
      units:
        { type: "String", readWrite: "R", defaultValue: "" }
        
deviceCommands:
  - name: intCmd
    get:
      - { operation: "get", object: "int" }
  - name: floatCmd
    get:
      - { operation: "get", object: "float"}
```

> *Note: `coreCommands` section is omitted since this device service does not support Commanding. See below for details.* 

> *Note: `deviceCommands` section only requires the `get` operations.*

## Commanding

The current implementation is meant for one-way communication into EdgeX. If future use cases determine that `commanding`, i.e. two-communication, is desirable it can be added then.

## AutoEvents

Since `Commanding` is not implemented, specifying `AutoEvents` in the configuration will result in errors. Thus `AutoEvents` should not be specified in the configuration.

## Installation and Execution

```bash
make build
make run
```

## Build docker image

```bash
make docker
```

