// -*- Mode: Go; indent-tabs-mode: t -*-
//
// Copyright (C) 2018 IOTech Ltd
//
// SPDX-License-Identifier: Apache-2.0

package main

import (
	device "github.com/TIBCOSoftware/labs-air/edgexfoundry/device-stm32l4r9-ble"
	"github.com/TIBCOSoftware/labs-air/edgexfoundry/device-stm32l4r9-ble/internal/driver"
	"github.com/edgexfoundry/device-sdk-go/pkg/startup"
)

const (
	serviceName string = "device-stm32l4r9-ble"
)

func main() {
	sd := driver.NewProtocolDriver()
	startup.Bootstrap(serviceName, device.Version, sd)
}
