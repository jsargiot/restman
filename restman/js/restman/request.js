/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 *
 * This module provides functionality to send http requests.
 *
 * Note: Some headers cannot be modified because of security measures
 * in the browser, check:
 * http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader()-method
 */
var restman = restman || {};

(function() {
    'use strict';

    restman.request = {

        raw_request: function(method, url, headers, body, on_complete, on_progress) {
            // Create request object
            var timestart, timecomplete;
            var xhr = new XMLHttpRequest();
            xhr.responseType = "text";
            xhr.timeout = 0;
            // Open url
            xhr.open(method, url, true);
            // Set progress handler
            if (on_progress)
                xhr.addEventListener('progress', on_progress, false);
            // Set headers
            for (var key in headers) {
                if (key){
                    xhr.setRequestHeader(key, headers[key]);
                }
            }
            // Se onload
            xhr.onload = function (event) {
                timecomplete = window.performance.now();
                on_complete(xhr.responseText, xhr.statusText, xhr, timecomplete - timestart);
            };
            // Trigger request
            timestart = window.performance.now();
            return xhr.send(body);
        },

        get: function(url, headers, on_complete, on_progress) {
            return restman.request.raw_request('GET', url, headers, null, on_complete, on_progress);
        },

        post: function(url, headers, body, on_complete, on_progress) {
            return restman.request.raw_request('POST', url, headers, body, on_complete, on_progress);
        },
    };
})();
