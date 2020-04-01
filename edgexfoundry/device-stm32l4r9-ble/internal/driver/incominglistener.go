// -*- Mode: Go; indent-tabs-mode: t -*-
//
// Copyright (C) 2018-2019 IOTech Ltd
//
// SPDX-License-Identifier: Apache-2.0

package driver

import (
	"fmt"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type ReportData struct {
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	Pressure    float64 `json:"pressure"`
	Proximity   int     `json:"proximity"`
	Accx        int     `json:"acc_x"`
	Accy        int     `json:"acc_y"`
	Accz        int     `json:"acc_z"`
	Gyrx        int     `json:"gyr_x"`
	Gyry        int     `json:"gyr_y"`
	Gyrz        int     `json:"gyr_z"`
	Magx        int     `json:"mag_x"`
	Magy        int     `json:"mag_y"`
	Magz        int     `json:"mag_z"`
	Ts          int64   `json:"ts"`
	Mac         string  `json:"mac"`
}

type Report struct {
	Reported ReportData `json:"reported"`
}

type Stmsg struct {
	State Report `json:"state"`
}

func startIncomingListening() error {
	// var scheme = driver.Config.IncomingSchema
	// var brokerUrl = driver.Config.IncomingHost
	// var brokerPort = driver.Config.IncomingPort
	// var username = driver.Config.IncomingUser
	// var password = driver.Config.IncomingPassword
	// var mqttClientId = driver.Config.IncomingClientId
	// var qos = byte(driver.Config.IncomingQos)
	// var keepAlive = driver.Config.IncomingKeepAlive
	// var topic = driver.Config.IncomingTopic

	// uri := &url.URL{
	// 	Scheme: strings.ToLower(scheme),
	// 	Host:   fmt.Sprintf("%s:%d", brokerUrl, brokerPort),
	// 	User:   url.UserPassword(username, password),
	// }

	// client, err := createClient(mqttClientId, uri, keepAlive)
	// if err != nil {
	// 	return err
	// }

	// defer func() {
	// 	if client.IsConnected() {
	// 		client.Disconnect(5000)
	// 	}
	// }()

	// token := client.Subscribe(topic, qos, onIncomingDataReceived)
	// if token.Wait() && token.Error() != nil {
	// 	driver.Logger.Info(fmt.Sprintf("[Incoming listener] Stop incoming data listening. Cause:%v", token.Error()))
	// 	return token.Error()
	// }

	driver.Logger.Info("[Incoming listener] Start incoming data listening. ")
	select {}
}

func onIncomingDataReceived(client mqtt.Client, message mqtt.Message) {
	// driver.Logger.Debug(fmt.Sprintf("[Incoming listener] Incoming reading received: topic=%v msg=%v", message.Topic(), string(message.Payload())))

	// data := Stmsg{}
	// json.Unmarshal(message.Payload(), &data)

	// driver.Logger.Debug(fmt.Sprintf("Datanew =%+v", data))

	// deviceName := "ST_" + data.State.Reported.Mac
	// deviceResource := ""
	// reading := ""
	// tms := data.State.Reported.Ts * 1000

	// service := sdk.RunningService()

	// // Process Temperature reading
	// deviceResource = "Temperature"
	// deviceObject, ok := service.DeviceResource(deviceName, deviceResource, "get")
	// if !ok {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. No DeviceObject found : topic=%v msg=%v", message.Topic(), string(message.Payload())))
	// 	return
	// }

	// req := sdkModel.CommandRequest{
	// 	DeviceResourceName: deviceResource,
	// 	Type:               sdkModel.ParseValueType("String"),
	// }

	// result, err := newResult(req, data.State.Reported.Temperature, tms)

	// if err != nil {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored.   topic=%v msg=%v error=%v", message.Topic(), string(message.Payload()), err))
	// 	return
	// }

	// asyncValues := &sdkModel.AsyncValues{
	// 	DeviceName:    deviceName,
	// 	CommandValues: []*sdkModel.CommandValue{result},
	// }

	// driver.AsyncCh <- asyncValues

	// // Process Humidity reading
	// deviceResource = "Humidity"
	// deviceObject, ok = service.DeviceResource(deviceName, deviceResource, "get")
	// if !ok {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. No DeviceObject found : topic=%v msg=%v", message.Topic(), string(message.Payload())))
	// 	return
	// }

	// req = sdkModel.CommandRequest{
	// 	DeviceResourceName: deviceResource,
	// 	Type:               sdkModel.ParseValueType("String"),
	// }

	// result, err = newResult(req, data.State.Reported.Humidity, tms)

	// if err != nil {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored.   topic=%v msg=%v error=%v", message.Topic(), string(message.Payload()), err))
	// 	return
	// }

	// asyncValues = &sdkModel.AsyncValues{
	// 	DeviceName:    deviceName,
	// 	CommandValues: []*sdkModel.CommandValue{result},
	// }

	// driver.AsyncCh <- asyncValues

	// // Process Pressure reading
	// deviceResource = "Pressure"
	// deviceObject, ok = service.DeviceResource(deviceName, deviceResource, "get")
	// if !ok {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. No DeviceObject found : topic=%v msg=%v", message.Topic(), string(message.Payload())))
	// 	return
	// }

	// req = sdkModel.CommandRequest{
	// 	DeviceResourceName: deviceResource,
	// 	Type:               sdkModel.ParseValueType("String"),
	// }

	// result, err = newResult(req, data.State.Reported.Pressure, tms)

	// if err != nil {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored.   topic=%v msg=%v error=%v", message.Topic(), string(message.Payload()), err))
	// 	return
	// }

	// asyncValues = &sdkModel.AsyncValues{
	// 	DeviceName:    deviceName,
	// 	CommandValues: []*sdkModel.CommandValue{result},
	// }

	// driver.AsyncCh <- asyncValues

	// // Process Proximity reading
	// deviceResource = "Proximity"
	// deviceObject, ok = service.DeviceResource(deviceName, deviceResource, "get")
	// if !ok {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. No DeviceObject found : topic=%v msg=%v", message.Topic(), string(message.Payload())))
	// 	return
	// }

	// req = sdkModel.CommandRequest{
	// 	DeviceResourceName: deviceResource,
	// 	Type:               sdkModel.ParseValueType(deviceObject.Properties.Value.Type),
	// }

	// result, err = newResult(req, data.State.Reported.Proximity, tms)

	// if err != nil {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored.   topic=%v msg=%v error=%v", message.Topic(), string(message.Payload()), err))
	// 	return
	// }

	// asyncValues = &sdkModel.AsyncValues{
	// 	DeviceName:    deviceName,
	// 	CommandValues: []*sdkModel.CommandValue{result},
	// }

	// driver.AsyncCh <- asyncValues

	// // Process Magnetometer reading
	// deviceResource = "Magnetometer"
	// deviceObject, ok = service.DeviceResource(deviceName, deviceResource, "get")
	// if !ok {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. No DeviceObject found : topic=%v msg=%v", message.Topic(), string(message.Payload())))
	// 	return
	// }

	// req = sdkModel.CommandRequest{
	// 	DeviceResourceName: deviceResource,
	// 	Type:               sdkModel.ParseValueType(deviceObject.Properties.Value.Type),
	// }

	// reading = strconv.Itoa(data.State.Reported.Magx) + "," + strconv.Itoa(data.State.Reported.Magy) + "," + strconv.Itoa(data.State.Reported.Magy)
	// result, err = newResult(req, reading, tms)

	// if err != nil {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored.   topic=%v msg=%v error=%v", message.Topic(), string(message.Payload()), err))
	// 	return
	// }

	// asyncValues = &sdkModel.AsyncValues{
	// 	DeviceName:    deviceName,
	// 	CommandValues: []*sdkModel.CommandValue{result},
	// }

	// driver.AsyncCh <- asyncValues

	// // Process Gyroscope reading
	// deviceResource = "Gyroscope"
	// deviceObject, ok = service.DeviceResource(deviceName, deviceResource, "get")
	// if !ok {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. No DeviceObject found : topic=%v msg=%v", message.Topic(), string(message.Payload())))
	// 	return
	// }

	// req = sdkModel.CommandRequest{
	// 	DeviceResourceName: deviceResource,
	// 	Type:               sdkModel.ParseValueType(deviceObject.Properties.Value.Type),
	// }

	// reading = strconv.Itoa(data.State.Reported.Gyrx) + "," + strconv.Itoa(data.State.Reported.Gyry) + "," + strconv.Itoa(data.State.Reported.Gyry)
	// result, err = newResult(req, reading, tms)

	// if err != nil {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored.   topic=%v msg=%v error=%v", message.Topic(), string(message.Payload()), err))
	// 	return
	// }

	// asyncValues = &sdkModel.AsyncValues{
	// 	DeviceName:    deviceName,
	// 	CommandValues: []*sdkModel.CommandValue{result},
	// }

	// driver.AsyncCh <- asyncValues

	// // Process Accelerometer reading
	// deviceResource = "Accelerometer"
	// deviceObject, ok = service.DeviceResource(deviceName, deviceResource, "get")
	// if !ok {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. No DeviceObject found : topic=%v msg=%v", message.Topic(), string(message.Payload())))
	// 	return
	// }

	// req = sdkModel.CommandRequest{
	// 	DeviceResourceName: deviceResource,
	// 	Type:               sdkModel.ParseValueType(deviceObject.Properties.Value.Type),
	// }

	// reading = strconv.Itoa(data.State.Reported.Accx) + "," + strconv.Itoa(data.State.Reported.Accy) + "," + strconv.Itoa(data.State.Reported.Accz)
	// result, err = newResult(req, reading, tms)
	// if err != nil {
	// 	driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored.   topic=%v msg=%v error=%v", message.Topic(), string(message.Payload()), err))
	// 	return
	// }

	// asyncValues = &sdkModel.AsyncValues{
	// 	DeviceName:    deviceName,
	// 	CommandValues: []*sdkModel.CommandValue{result},
	// }

	// driver.AsyncCh <- asyncValues

}

func checkDataWithKey(data map[string]interface{}, key string) bool {
	val, ok := data[key]
	if !ok {
		driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. No %v found : msg=%v", key, data))
		return false
	}

	switch val.(type) {
	case string:
		return true
	default:
		driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. %v should be string : msg=%v", key, data))
		return false
	}
}
