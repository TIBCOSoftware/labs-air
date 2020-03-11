
export class PropertyValue {
  type: string;
  readWrite: string;
  minimum: string;
  maximum: string;
  defaultValue: string;
  size: string;
  word: string;
  lsb: string;
  mask: string;
  shift: string;
  scale: string;
  offset: string;
  base: string;
  assertion: string;
  signed: string;
  precision: string;
}

export class PropertyUnit {
  type: string;
  readWrite: string;
  defaultValue: string;
}

export class ResourceProperty {
  value: PropertyValue;
  units: PropertyUnit;
}

export class ResourceAttribute {
  Interface: string;
  Pin_Num: string;
  Type: string;
  Visualization?: string
}

export class Resource {
  description: string;
  name: string;
  tag: string;
  properties: ResourceProperty;
  attributes: ResourceAttribute;
}

export class CommandResponse {
  code: string;
  description: string;
  expectedValues: string[];
}

export class CommandOp {
  path: string;
  responses: CommandResponse[];
  parameterNames: string[];
}

export class Command {
  id: string;
  name: string;
  get: CommandOp;
  put: CommandOp;
}

export class Profile {
  created: number;
  modified: number;
  name: string;
  description: string;
  id: string;
  manufacturer: string;
  model: string;
  deviceResources: Resource[];
  deviceCommands: Command[];
}

export class Service {
  created: string;
  description: string;
  name: string;
}


export class Device {
  created: string;
  modified: string;
  origin: string;
  description: string;
  id: string;
  name: string;
  adminState: string;
  operatingState: string;
  location: string;
  labels: string[];
  profile: Profile;
  service: Service;
}

export class Subscription {
  uid: number;
  origin: number;
  created: number;
  modified: number;
  name: string;
  consumer: string;
  publisher: string;
  destination: string;
  protocol: string;
  method: string;
  address: string;
  port: number;
  path: string;
  format: string;
  enabled: boolean;
  user: string;
  password: string;
  topic: string;
  encryptionAlgorithm: string;
  encryptionKey: string;
  initializingVector: string;
  compression: string;
  deviceIdentifierFilter: string;
  valueDescriptorFilter: string;
}

export class Publisher {
  uid: number;
  created: number;
  modified: number;
  name: string;
  protocol: string;
  hostname: string;
  port: string;
  topic: string;
}
export class Protocol {
  uid: number;
}

export class MQTTProtocol extends Protocol{
  uid: number;
  brokerURL: string;
  topic: string;
  consumerGroupId: string;
  connectionTimeout: string;
  sessionTimeout: string;
  initialOffset: string;
  retryBackoff: string;
  fetchMinBytes: string;
  fetchMaxWait: string;
  commitInterval: string;
  heartbeatInterval: string;
  authenticationMode: string;
  username: string;
  password: string;
  clientCertificate: string;
  serverCertificate: string;
  clientKey: string;
}

export class DataStore {
  uid: number;
}

export class PostgresDataStore extends DataStore {
  host: string;
  port: string;
  databaseName: string;
  username: string;
  password: string;
}

export class Pipeline {
  uid: number;
  created: number;
  modified: number;
  name: string;
  protocolType: string;
  protocol: any;
  dataStoreType: string;
  dataStore: any;
  status: string;
}

export class NVPair {
  name: string;
  value: string;
}

export class ObjectProperties {
  properties: NVPair[];
}

export class Addressable {
  created: number;
  modified: number;
  origin: number;
  id: string;
  name: string;
  protocol: string;
  method: string;
  address: string;
  port: number;
  path: string;
  baseURL: string;
  url: string;
  user: string;
  password: string;
}

export class Gateway {
  uid: number;
  description: string;
  createdts: number;
  updatedts: number;
  uuid: string;
  address: string;
  latitude: number;
  longitude: number;
  accessToken: string;
  subscriptions: Subscription[];
  publishers: Publisher[];
  pipelines: Pipeline[];
}


export class GetCommandResponse {
  device: string;
  origin: number;
  readings: Reading[];
}

export class Reading {
  origin: number;
  device: string;
  name: string;
  value: string;
}

export class Rule {
  uid: number;
  created: number;
  modified: number;
  uuid: string;
  name: string;
  description: string;
  condDevice: string;
  condResource: string;
  condCompareNewMetricToValue: boolean;
  condCompareNewMetricToValueOp: string;
  condCompareNewMetricValue: string;
  condCompareNewMetricToLastMetric: boolean;
  condCompareNewMetricToLastMetricOp: string;
  condCompareLastMetricToValue: boolean;
  condCompareLastMetricToValueOp: string;
  condCompareLastMetricValue: string;
  actionSendNotification: boolean;
  actionNotification: string;
  actionSendCommand: boolean;
  actionDevice: string;
  actionResource: string;
  actionValue: string;
}

export class Notification {
  uid: number;
  uuid: string;
  created: number;
  notifySource: string;
  notifyDevice: string;
  notifyResource: string;
  notifyLevel: string;
  gateway: string;
  value: string;
  description: string;
}

// TSReading - Time series reading.
export class TSReading {
  value: string;
  created: number;
}

export class ChartTSData {
  x: string;
  y: number;

  constructor(x: string, y: number) {
    this.x = x;
    this.y = y;
  }

}

export class DataStoreMetadata {
  gateway: Gateway;
  devices: Device[];
}