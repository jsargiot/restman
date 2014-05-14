function Request (url) {
    this.url = url;
}

Request.prototype.get = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 10000 // 10 seconds

    function readResponse() {
        if (xhr.readyState == 1) {
            // Start timing request
            initial_time = performance.now()
        }
        if (xhr.readyState == 4) {
            end_time = performance.now()
            callback(xhr.responseText, xhr.statusText, xhr, end_time - initial_time);
        }
    }

    xhr.onreadystatechange = readResponse;

    try {
        xhr.open("GET", url, true);
        xhr.send("");
    } catch(e) {
    }
}


Request.prototype.post = function (url, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 10000 // 10 seconds

    function readResponse() {
        if (xhr.readyState == 1) {
            // Start timing request
            initial_time = performance.now()
        }
        if (xhr.readyState == 4) {
            end_time = performance.now()
            callback(xhr.responseText, xhr.statusText, xhr, end_time - initial_time);
        }
    }

    xhr.onreadystatechange = readResponse;

    try {
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(data);
    } catch(e) {
    }
}