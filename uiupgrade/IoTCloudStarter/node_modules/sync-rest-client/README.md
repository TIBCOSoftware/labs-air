[![Build Status](https://travis-ci.org/ujc/sync-rest-client.svg?branch=master)](https://travis-ci.org/ujc/sync-rest-client)

# sync-rest-client
a very basic, **synchronous**, **non-blocking**, rest\http client with retries, timeouts, and graceful error handling


---
## Why ?
originally I tried using the existing [sync-request](https://www.npmjs.com/package/sync-request) module - *which works really great for most stuff!* - but I ended up having some thread-blocking issues when running both **a standard async module AND sync-request on the same thread**.

I created this module using [deasync](https://www.npmjs.com/package/deasync) on top of [request](https://www.npmjs.com/package/request) to solve that.


---
## Install
```
npm install sync-rest-client
```


---
## Usage
```javascript
const syncClient = require('sync-rest-client');

var response = syncClient.get('https://www.google.com');

// that's it (;
```


---
## The Response Object
***for the most part, the **`response`** object is the same as the object that the original [request](https://www.npmjs.com/package/request) module passes as the 2nd **`response`** argument to it's callbacks***

**`body`** if the response was a JSON-string, it will be parsed and **`body`** will be that JSON. otherwise, **`body`** will be a string


**`statusCode`** if no errors were thrown, the http status code returned by the server. otherwise, **`statusCode`** will be undefined (this is one way to tell that there was an error - normally a timeout)


**`retriesCount`** the number of retries that were used to complete the request.
you can set this either globally for all requests using **`.setGlobalRetry(maxRetries)`** API, or by providing a **`retries`** key to the **`options`** object when sending a new request. **default is 3 retries**


**`headers`** the response headers


**`code`** if an error occurred while making the request, the error code will be populated onto this **`code`** property *(such as **`ETIMEDOUT`** etc.)*





---
## Errors
things like **`500`** status-code (Internal Server Error) - or server timeouts (the request never reached the server) etc.

these kind of errors are captured by the internal retry mechanism (configurable), and are populated on the response object on either the **`response.statusCode`** *(when a status-code is available)* or on **`response.code`** when the server didn't respond with a proper HTTP status code (timeout, unreachable etc..)

all other HTTP status codes are reported through the **`response.statusCode`** property (404s etc) - together with the "healthy" status codes (200 OK \ 301 etc).

**when **`response.statusCode`** isn't available, the response will not have a **`body`** or **`headers`**** *(i.e. the server did not respond, so there's no HTTP data)*





---
## Retries
by default, each "failed" request will be retried 3 times before giving up. you can configure this either per request by providing the **`retries`** key to the **`options`** object when sending a request - or - if you want a global retry setting, you can use the **`.setGlobalRetry()`** API

to disable the retry mechanism (so that the request will give up after the first attempt) simply set the retries count to 0 (zero);

the **`response.retriesCount`** property shows how many retries were made for a given request



---
## API

**HTTP Methods**

**`syncClient.<verb>(url, [options])`**

the basic syntax for sending a request is to use the corresponding *verb* method, passing in the **`url`** and an optional **`options`** object

```javascript
syncClient.get('https://www.google.com')

// - or -

syncClient.post('https://www.google.com', {payload:'hello world'})

// etc..
```

the following *verbs* are supported:
* **`get`**
* **`post`**
* **`put`**
* **`patch`**
* **`del`** *(not "delete")*
* **`head`**
* **`options`**

**note:** when using **`head`**, **`response.body`** will always be empty



**The **`options`** object**

**`timeout`** **in seconds**, the time to wait before giving up on a request **default is 60 seconds**

**`retries`** the number of retries before giving up on a request **default is 3 retries**

**`interval`** **in seconds**, the time to wait between each retry attempt

**`headers`** an object of headers to add to the request. if global headers (see below) are configured, they will be mergerd and sent together with headers that you pass in

**`payload`** the payload to be sent with the request. can either be a **`string`** or a **`json`**



**Global Module Settings**

you can use the following API to configure global settings that will apply for **all requests**

**note:** options that are set using the **`options`** object take precedence over global configurations

**`setGlobalRetry(numberOfRetries)`** set the number of retries to use before giving up on a request

**`setGlobalInterval(seconds)`** set the number of seconds to wait before each retry. **default is 1 second**

**`setGlobalTimeout(seconds)`** set the number of seconds to wait before giving up on a request

**`addGlobalHeader(name, value)`** adds a global header that will be send with all requests. if at a later point the same header name is passed with the **`options.headers`** object for a specific request - the value of the header will be taken from there - ignoring the global header configuration

**`removeGlobalHeader(name)`** removes a global header from being sent with all requests

**`clearGlobalHeaders()`** an easy way to remove all global headers

**`getGlobalHeaders()`** returns a copy of the global headers object *(not the internal one that is actually used, that one is protected on purpose)*

**note:** no headers are added by default



---
## Test
```
npm run test
```


---
## Related
* [sync-request](https://www.npmjs.com/package/sync-request)
* [deasync](https://www.npmjs.com/package/deasync)
* [request](https://www.npmjs.com/package/request)


