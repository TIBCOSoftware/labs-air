//
// Copyright (c) 2019 Intel Corporation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

package transforms

import (
	"bytes"
	"fmt"
	"net/http"

	"github.com/edgexfoundry/app-functions-sdk-go/pkg/util"
	"github.com/edgexfoundry/go-mod-core-contracts/clients/logger"
)

// HTTPSender ...
type HTTPSender struct {
	URL            string
	MimeType       string
	PersistOnError bool
}

// NewHTTPSender creates, initializes and returns a new instance of HTTPSender
func NewHTTPSender(url string, mimeType string, persistOnError bool) *HTTPSender {
	return &HTTPSender{
		URL:            url,
		MimeType:       mimeType,
		PersistOnError: persistOnError,
	}
}

// HTTPPost will send data from the previous function to the specified Endpoint via http POST.
// If no previous function exists, then the event that triggered the pipeline will be used.
// An empty string for the mimetype will default to application/json.
func (sender HTTPSender) HTTPPost(logging logger.LoggingClient, msg string) (bool, interface{}) {

	if sender.MimeType == "" {
		sender.MimeType = "application/json"
	}
	exportData, err := util.CoerceType(msg)
	if err != nil {
		return false, err
	}

	response, err := http.Post(sender.URL, sender.MimeType, bytes.NewReader(exportData))
	if err != nil {
		logging.Debug(fmt.Sprintf("Error posting: %s", err))
		return false, err
	}

	defer response.Body.Close()
	logging.Debug(fmt.Sprintf("Response: %s", response.Status))

	return true, nil

}
