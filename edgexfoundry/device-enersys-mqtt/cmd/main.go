// -*- Mode: Go; indent-tabs-mode: t -*-
//
// Copyright (C) 2018 IOTech Ltd
//
// SPDX-License-Identifier: Apache-2.0

package main

import (
	device_enersys_mqtt "github.com/TIBCOSoftware/labs-air/edgexfoundry/device-enersys-mqtt"
	"github.com/TIBCOSoftware/labs-air/edgexfoundry/device-enersys-mqtt/internal/driver"
	"github.com/edgexfoundry/device-sdk-go/pkg/startup"
)

const (
	serviceName string = "edgex-enersys-mqtt"
)

func main() {
	sd := driver.NewProtocolDriver()
	startup.Bootstrap(serviceName, device_enersys_mqtt.Version, sd)
}
