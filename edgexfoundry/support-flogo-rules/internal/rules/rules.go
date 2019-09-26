package rules

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/TIBCOSoftware/labs-air/edgexfoundry/support-flogo-rules/internal/transforms"
	"github.com/edgexfoundry/go-mod-core-contracts/models"
	"github.com/project-flogo/rules/common/model"
	"github.com/project-flogo/rules/config"
	"github.com/project-flogo/rules/ruleapi"
)

type ledBody struct {
	Led string
}

// RuleDefStruct - rule definition data
type RuleDefStruct struct {
	Name                                 string `json:"name"`
	Description                          string `json:"description"`
	ConditionDevice                      string `json:"conditionDevice"`
	ConditionResource                    string `json:"conditionResource"`
	ConditionCompareToValue              bool   `json:"conditionCompareToValue"`
	ConditionCompareToValueOperation     string `json:"conditionCompareToValueOperation"`
	ConditionValue                       string `json:"conditionValue"`
	ConditionCompareToLastValue          bool   `json:"conditionCompareToLastValue"`
	ConditionCompareToLastValueOperation string `json:"conditionCompareToLastValueOperation"`
	ActionSendNotification               bool   `json:"actionSendNotification"`
	ActionNotification                   string `json:"actionNotification"`
	ActionSendCommand                    bool   `json:"actionSendCommand"`
	ActionDevice                         string `json:"actionDevice"`
	ActionResource                       string `json:"actionResource"`
	ActionValue                          string `json:"actionValue"`
}

// conditionCtxStruct - structure use to pass context to conditions
type conditionCtxStruct struct {
	Device             string
	Resource           string
	CompareToValue     bool
	Operation          string
	Value              string
	CompareToLastValue bool
	LastValueOperation string
}

type notificationCtxStruct struct {
	Created     int64  `json:"created"`
	UUID        string `json:"uuid"`
	Source      string `json:"source"`
	Gateway     string `json:"gateway"`
	Device      string `json:"device"`
	Resource    string `json:"resource"`
	Value       string `json:"value"`
	Description string `json:"description"`
	Level       string `json:"level"`
}

var mqttSender *transforms.MQTTSender

// SetMQTTSender - sets the mqtt sender
func SetMQTTSender(hostname string, port int, publisher string, username string, password string, topic string) {
	addressable := models.Addressable{
		Address:   hostname,
		Port:      port,
		Protocol:  "tcp",
		Publisher: publisher,
		User:      username,
		Password:  password,
		Topic:     topic,
	}

	mqttConfig := transforms.NewMqttConfig()

	// pair := transforms.KeyCertPair{
	// 	KeyFile:  "PATH_TO_YOUR_KEY_FILE",
	// 	CertFile: "PATH_TO_YOUR_CERT_FILE",
	// }

	mqttSender = transforms.NewMQTTSender(LoggingClient, addressable, nil, mqttConfig)
}

// AddRule - add rule
func AddRule(rs model.RuleSession, ruleDef RuleDefStruct) {
	fmt.Printf("Inside AddRule\n")
	fmt.Printf("Raw Object: %+v\n", ruleDef)
	fmt.Printf("Rule struct request device: %s\n", ruleDef.ConditionDevice)
	fmt.Printf("Rule struct request resource: %s\n", ruleDef.ConditionResource)

	condContext := conditionCtxStruct{
		Device:             ruleDef.ConditionDevice,
		Resource:           ruleDef.ConditionResource,
		CompareToValue:     ruleDef.ConditionCompareToValue,
		Operation:          ruleDef.ConditionCompareToValueOperation,
		Value:              ruleDef.ConditionValue,
		CompareToLastValue: ruleDef.ConditionCompareToLastValue,
		LastValueOperation: ruleDef.ConditionCompareToLastValueOperation,
	}

	var condContextJSON []byte
	condContextJSON, err := json.Marshal(condContext)

	if err != nil {
		fmt.Printf("Rule request ERROR\n")
	}

	fmt.Printf("Marshalled condContext: %s\n", string(condContextJSON))

	rule := ruleapi.NewRule(ruleDef.Name)
	rule.AddCondition("compareValuesCond", []string{"ReadingEvent", "ResourceConcept"}, compareValuesCond, string(condContextJSON))
	rule.SetAction(compareValuesAction)
	rule.SetContext(ruleDef.ActionNotification)
	rule.SetPriority(1)
	rs.AddRule(rule)

	updateRuleName := "Update" + ruleDef.Name
	rule1 := ruleapi.NewRule(updateRuleName)
	rule1.AddCondition("updateCond", []string{"ReadingEvent", "ResourceConcept"}, updateCond, string(condContextJSON))
	rule1.SetAction(updateAction)
	rule1.SetContext("Update")
	rule1.SetPriority(9)
	rs.AddRule(rule1)

}

// DeleteRule - remove rule
func DeleteRule(rs model.RuleSession, ruleName string) {
	fmt.Printf("Inside DeleteRule\n")

	rs.DeleteRule(ruleName)

	updateRuleName := "Update" + ruleName
	rs.DeleteRule(updateRuleName)

}

// RegisterConditionsAndActions - register rule conditions and actions
func RegisterConditionsAndActions() {

	LoggingClient.Info(fmt.Sprintf("Register Conditions and actions\n"))

	config.RegisterConditionEvaluator("updateCond", updateCond)
	config.RegisterActionFunction("updateAction", updateAction)

	config.RegisterConditionEvaluator("compareValuesCond", compareValuesCond)
	config.RegisterActionFunction("compareValuesAction", compareValuesAction)
}

func sendDeviceComand(value string) {

	data := ledBody{
		Led: value,
	}

	d, err := json.Marshal(data)

	if err != nil {
		LoggingClient.Error(fmt.Sprintf("json.Marshal() failed with '%s'\n", err.Error()))
	}

	client := &http.Client{}
	client.Timeout = time.Second * 15

	// uri := "http://localhost:49982/api/v1/device/all/Led"
	uri := "http://localhost:49982/api/v1/device/name/mesh-argon-10/Led"
	body := bytes.NewBuffer(d)
	req, err := http.NewRequest(http.MethodPut, uri, body)
	if err != nil {
		LoggingClient.Error(fmt.Sprintf("http.NewRequest() failed with '%s'\n", err.Error()))
	}

	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	resp, err := client.Do(req)
	if err != nil {
		LoggingClient.Error(fmt.Sprintf("client.Do() failed with '%s'\n", err.Error()))
	}

	defer resp.Body.Close()
	d, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		LoggingClient.Error(fmt.Sprintf("ioutil.ReadAll() failed with '%s'\n", err.Error()))
	}

	LoggingClient.Info(fmt.Sprintf("Response status code: %d, text:\n%s\n", resp.StatusCode, string(d)))

}

// GetOrCreateTuple - Gets or create an assertedtuple
func GetOrCreateTuple(rs model.RuleSession, device, instrument, value string) model.MutableTuple {

	// Check if tuple already asserted
	tupleType := model.TupleType(instrument)
	tk, _ := model.NewTupleKeyWithKeyValues(tupleType, device)

	conceptOld := rs.GetAssertedTuple(tk)

	if conceptOld == nil {
		concept, _ := model.NewTupleWithKeyValues(tupleType, device)

		switch instrument {
		case "LightSensor", "RotaryAngleSensor":
			concept.SetInt(nil, "value", -999)
		case "Button", "Led":
			newVal, _ := strconv.ParseBool(value)
			concept.SetBool(nil, "value", newVal)
		default:
			concept.SetString(nil, "value", "")
		}

		err := rs.Assert(nil, concept)

		if err != nil {
			LoggingClient.Error(fmt.Sprintf("Assert failed for device-instrument: [%s]-[%s]\n", device, instrument))
		}

		return concept
	} else {
		concept := conceptOld.(model.MutableTuple)

		return concept
	}

}

// GetOrCreateResourceTuple - Gets or Creates an assertedtuple (resources are stateful concepts)
func GetOrCreateResourceTuple(rs model.RuleSession, device, resource, value string) model.MutableTuple {

	LoggingClient.Debug(fmt.Sprintf("In GetOrCreateResourceTuple: [%s]-[%s]\n", device, resource))

	// Check if tuple already asserted
	key := device + "_" + resource
	tupleType := model.TupleType("ResourceConcept")
	tk, err := model.NewTupleKeyWithKeyValues(tupleType, key)

	if err != nil {
		LoggingClient.Error(fmt.Sprintf("NewTupleKeyWithKeyValues failed for device-resource: [%s]-[%s]\n", device, resource))
	}

	LoggingClient.Debug(fmt.Sprintf("In GetOrCreateResourceTuple Keys created: [%s]\n", tk.String()))

	conceptOld := rs.GetAssertedTuple(tk)

	if conceptOld == nil {
		LoggingClient.Debug(fmt.Sprintf("No concept found for: [%s]-[%s]\n", device, resource))
		concept, cerr := model.NewTupleWithKeyValues(tupleType, key)

		if cerr != nil {
			LoggingClient.Error(fmt.Sprintf("Creating failed for device-resource: [%s]-[%s] - %s\n", device, resource, cerr))
		}

		concept.SetString(nil, "id", key)
		concept.SetString(nil, "device", device)
		concept.SetString(nil, "resource", resource)
		concept.SetString(nil, "value", value)
		err := rs.Assert(nil, concept)

		if err != nil {
			LoggingClient.Error(fmt.Sprintf("Assert failed for device-resource: [%s]-[%s] - %s\n", device, resource, err))
		}

		assertedTuple := rs.GetAssertedTuple(concept.GetKey())
		if assertedTuple == concept {
			LoggingClient.Error(fmt.Sprintf("Tuple with key [%s] already asserted", concept.GetKey().String()))
		} else if assertedTuple != nil {
			LoggingClient.Error(fmt.Sprintf("Tuple with key [%s] already asserted", concept.GetKey().String()))
		} else {
			LoggingClient.Error(fmt.Sprintf("Tuple with key [%s] not asserted", concept.GetKey().String()))
		}

		return concept
	} else {
		LoggingClient.Debug(fmt.Sprintf("Concept found for: [%s]-[%s]\n", device, resource))
		concept := conceptOld.(model.MutableTuple)
		err := rs.Assert(nil, concept)

		if err != nil {
			LoggingClient.Error(fmt.Sprintf("Assert failed for device-resource: [%s]-[%s] - %s\n", device, resource, err))
		}

		return concept
	}

}

// GetTuple - gets an asserted tuple
func GetTuple(rs model.RuleSession, device, resource string) model.MutableTuple {

	LoggingClient.Debug(fmt.Sprintf("Get Concept for device-resource: [%s]-[%s]\n", device, resource))

	tupleType := model.TupleType(resource)
	tk, _ := model.NewTupleKeyWithKeyValues(tupleType, device)

	concept := rs.GetAssertedTuple(tk)

	if concept == nil {
		LoggingClient.Debug(fmt.Sprintf("Concept not found for device-resource: [%s]-[%s]\n", device, resource))
		return nil
	}

	return concept.(model.MutableTuple)

}

// Check if a concept needs to be updated with the latest reading
func updateCond(ruleName string, condName string, tuples map[model.TupleType]model.Tuple, ctx model.RuleContext) bool {
	LoggingClient.Debug(fmt.Sprintf("Condition Evaluated: [%s]-[%s]\n", ruleName, condName))

	condResult := false

	readingTuple := tuples["ReadingEvent"]
	resourceTuple := tuples["ResourceConcept"]

	if readingTuple == nil || resourceTuple == nil || ctx == nil {
		LoggingClient.Error("Should not get a nil Reading tuple or no context in compareValuesCond! This is an error")
		return false
	}

	strCtx := ctx.(string)
	condCtx := conditionCtxStruct{}

	if err := json.Unmarshal([]byte(strCtx), &condCtx); err != nil {
		fmt.Printf("Processing config request ERROR\n")
	}

	readingTupleDevice, _ := readingTuple.GetString("device")
	readingTupleResource, _ := readingTuple.GetString("resource")
	resourceTupleDevice, _ := resourceTuple.GetString("device")
	resourceTupleResource, _ := resourceTuple.GetString("resource")

	if readingTupleResource == condCtx.Resource && readingTupleDevice == condCtx.Device &&
		resourceTupleResource == condCtx.Resource && resourceTupleDevice == condCtx.Device {
		condResult = true
	}

	return condResult

}

// Update a concept with the latest reading
func updateAction(ctx context.Context, rs model.RuleSession, ruleName string, tuples map[model.TupleType]model.Tuple, ruleCtx model.RuleContext) {
	LoggingClient.Debug(fmt.Sprintf("Rule fired: [%s]\n", ruleName))

	readingTuple := tuples["ReadingEvent"]
	resourceTuple := tuples["ResourceConcept"].(model.MutableTuple)

	readingTupleDevice, _ := readingTuple.GetString("device")
	readingTupleResource, _ := readingTuple.GetString("resource")
	LoggingClient.Info(fmt.Sprintf("Updating Device: [%s] Resource: [%s]\n", readingTupleDevice, readingTupleResource))

	// Update Value
	rtValue, _ := readingTuple.GetString("value")
	resourceTuple.SetString(nil, "value", rtValue)
}

// Condition to compare previous stored in a concept with the new reading value
func compareValuesCond(ruleName string, condName string, tuples map[model.TupleType]model.Tuple, ctx model.RuleContext) bool {
	LoggingClient.Debug(fmt.Sprintf("Condition Evaluated: [%s]-[%s]\n", ruleName, condName))

	condResult := false

	readingTuple := tuples["ReadingEvent"]
	resourceTuple := tuples["ResourceConcept"]

	if readingTuple == nil || resourceTuple == nil || ctx == nil {
		LoggingClient.Error("Should not get a nil Reading tuple or no context in compareValuesCond! This is an error")
		return false
	}

	strCtx := ctx.(string)
	condCtx := conditionCtxStruct{}

	if err := json.Unmarshal([]byte(strCtx), &condCtx); err != nil {
		fmt.Printf("Processing config request ERROR\n")
	}

	readingTupleDevice, _ := readingTuple.GetString("device")
	readingTupleResource, _ := readingTuple.GetString("resource")
	resourceTupleDevice, _ := resourceTuple.GetString("device")
	resourceTupleResource, _ := resourceTuple.GetString("resource")

	if readingTupleResource == condCtx.Resource && readingTupleDevice == condCtx.Device &&
		resourceTupleResource == condCtx.Resource && resourceTupleDevice == condCtx.Device {
		readingTupleValue, _ := readingTuple.GetDouble("value")

		if condCtx.CompareToValue {
			value, _ := strconv.ParseFloat(condCtx.Value, 64)

			switch condCtx.Operation {
			case ">=":
				condResult = readingTupleValue > value
			case ">":
				condResult = readingTupleValue >= value
			case "<=":
				condResult = readingTupleValue <= value
			case "<":
				condResult = readingTupleValue < value
			case "==":
				condResult = readingTupleValue == value
			case "!=":
				condResult = readingTupleValue != value
			default:
				condResult = false
			}
		}

		if condResult && condCtx.CompareToLastValue {
			resourceTupleValue, _ := resourceTuple.GetDouble("value")

			switch condCtx.LastValueOperation {
			case ">=":
				condResult = readingTupleValue > resourceTupleValue
			case ">":
				condResult = readingTupleValue >= resourceTupleValue
			case "<=":
				condResult = readingTupleValue <= resourceTupleValue
			case "<":
				condResult = readingTupleValue < resourceTupleValue
			case "==":
				condResult = readingTupleValue == resourceTupleValue
			case "!=":
				condResult = readingTupleValue != resourceTupleValue
			default:
				condResult = false
			}
		}

	}

	LoggingClient.Debug(fmt.Sprintf("Condition Evaluated: [%s]-[%s]-[%t]\n", ruleName, condName, condResult))

	return condResult
}

// Send notification whenever a compare value condition is true
func compareValuesAction(ctx context.Context, rs model.RuleSession, ruleName string, tuples map[model.TupleType]model.Tuple, ruleCtx model.RuleContext) {
	LoggingClient.Debug(fmt.Sprintf("Rule fired: [%s]\n", ruleName))

	readingTuple := tuples["ReadingEvent"]
	resourceTuple := tuples["ResourceConcept"]

	if readingTuple == nil || resourceTuple == nil {
		LoggingClient.Info("Should not get a nil tuple in FilterCondition! This is an error")
		return
	}

	value, _ := readingTuple.GetString("value")
	device, _ := readingTuple.GetString("device")
	resource, _ := readingTuple.GetString("resource")
	ts := time.Now().UnixNano() / 1e6
	uuid := strconv.FormatInt(ts, 10)

	LoggingClient.Debug(fmt.Sprintf("Action for: device = [%s], resource = [%s], value = [%s] \n", device, resource, value))

	notificationContext := notificationCtxStruct{
		Created:     ts,
		UUID:        uuid,
		Source:      ruleName,
		Gateway:     "",
		Device:      device,
		Resource:    resource,
		Value:       value,
		Description: ruleCtx.(string),
		Level:       "info",
	}

	var notificationContextJSON []byte
	notificationContextJSON, err := json.Marshal(notificationContext)

	LoggingClient.Debug(fmt.Sprintf("Marshalled notificationContext: %s \n", string(notificationContextJSON)))

	if err != nil {
		fmt.Printf("Rule Action ERROR\n")
	}

	// Send Notification
	mqttSender.MQTTSend(LoggingClient, string(notificationContextJSON))
}
