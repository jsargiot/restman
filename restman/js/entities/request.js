function Request (url) {
    this.url = url;
}

Request.prototype.send = function (url, method, callback, headers, body, download_progress_handler) {
    // Start timing request
    initial_time = 0;
    
    // Create request object
    var xhr = new XMLHttpRequest;
    xhr.responseType = "text";
    xhr.timeout = 0;

    xhr.onreadystatechange = function (progress) {
        if (xhr.readyState == 1) {
            initial_time = progress.timeStamp;
        }
        if (xhr.readyState == 4) {
            end_time = progress.timeStamp;
            callback(xhr.responseText, xhr.statusText, xhr, end_time - initial_time);
        }
    }

    // Use "_" and "_" as user/pass to avoid bug in opera.
    // http://codereaper.com/bugspray/javascript/xmlhttprequest/httpauthentication/
    // https://code.google.com/p/chromium/issues/detail?id=31582
    //
    xhr.open(method, url, true);
    
    // Set progress handler
    if (download_progress_handler)
        xhr.addEventListener('progress', download_progress_handler, false);

    /*
        Set headers in request.
        
        Invalid headers (controlled by the user agent, cannot overwrite) :
            Accept-Charset
            Accept-Encoding
            Access-Control-Request-Headers
            Access-Control-Request-Method
            Connection
            Content-Length
            Cookie
            Cookie2
            Date
            DNT
            Expect
            Host
            Keep-Alive
            Origin
            Referer
            TE
            Trailer
            Transfer-Encoding
            Upgrade
            User-Agent
            Via
        http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader()-method
    */
    for (var key in headers) {
        if (key){
            xhr.setRequestHeader(key, headers[key]);
        }
    }

    xhr.send(body);
}
