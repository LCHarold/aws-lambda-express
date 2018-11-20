import {ServerResponse} from "http";
import {reduce, set} from "lodash";

const ExpressRequest = require("express/lib/request");
const ExpressResponse = require("express/lib/response");
const { compileETag } = require("express/lib/utils");

// Emulate express application settings behavior
const app = {
    get: (key) => {
        switch (key) {
            case 'etag fn': return compileETag('weak');
            default: return undefined
        }
    }
};

export function Request(event) {
    const request = Object.create(ExpressRequest, {
        // Enumerable must be false to avoid circular reference issues
        app: { configurable: true, enumerable: false, writable: true, value: app },
        res: { configurable: true, enumerable: false, writable: true, value: {} },
    });

    Object.assign(request, {
        // HTTP Method
        method: event.httpMethod ? event.httpMethod : "",
        // Headers converted to lowercase
        headers: reduce(event.headers, (h, v, k) => set(h, k.toLowerCase(), v), {}),
        // Path
        url: event.path || '/',
        // Route parameters
        params: event.pathParameters || {},
        // Request context
        requestContext: event.requestContext || {},
        // API Gateway resource definition
        resource: event.resource || '/',
        // Transformed query parameters
        query: event.queryStringParameters || {},
        // Stage variables
        stage: event.stageVariables || {},
        // Body
        body: event.body,
    })

    return request
}

export function Response(request) {
    const nodeResponse = new ServerResponse(request);
    const response = Object.create(ExpressResponse, {
        // Enumerable must be false to avoid circular reference issues
        app: { configurable: true, enumerable: false, writable: true, value: app },
        req: { configurable: true, enumerable: false, writable: true, value: request },
    });

    Object.assign(response, nodeResponse);

    response.send = (body) => {
        const ret = ExpressResponse.send.call(response, body);
        for (let callback of response.outputCallbacks) {
            if (typeof callback === 'function') {
                callback();
            }
        }
        return ret;
    };

    // Convert to API Gateway object
    response.toJSON = () => {
        // If headers sent, buffer contains headers line in first index
        if (response.headersSent) delete response.output[0];

        const r = {
            // Response Status Code
            statusCode: response.statusCode,
            // Response Headers
            headers: response.headers,
            body: JSON.parse(reduce(response.output, (body, buffer) => {
                // Buffer may be undefined
                if (buffer) {
                    body += buffer.toString()
                }
                return body;
            }, ''))
        };

        return r;
    };

    return response;
}