/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 */
$(document).ready(function(event) {

    /*
     * Trigger send button everytime someone presses "enter" on the url input.
     * Fixes: #3
     */
    $("#Url").keypress(function(e) {
        if(e.which == 13) {
            $("#Send").click();
        }
    });

    var onProgressHandler = function(event) {
        if(event.lengthComputable) {
            var howmuch = (event.loaded / event.total) * 100;
            document.querySelector('#progress').value = Math.ceil(howmuch);
        }
    }

    $("#Send").click(function(event) {
        $(".shouldwait").addClass('loading');
        document.querySelector('#progress').value = 0;

        var method = $("#Method").val();
        var url = $("#Url").val();
        var headers = restman.ui.headers.collect("#HeadersTable");
        var body = {};
        var data = null;

        if (method !== "GET") {
            if ($("#PanelRaw").hasClass('active')) {
                body.type = "raw";
                body.content = restman.ui.editors.get("#RequestContent").getValue();
                data = body.content;
            }
            if ($("#PanelForm").hasClass('active')) {
                data = new FormData();
                body.type = "form";
                body.content = restman.ui.headers.collect("#FormData");
                for (var i in body.content) {
                    data.append(i, body.content[i]);
                }
            }
        }

        // Save request for loading later.
        restman.storage.saveRequest(method, url, headers, body, function (item){
            restman.ui.history.dialog.add(item);
        });

        restman.request.raw_request(
            method,
            url,
            headers,
            data,
            function(data, textStatus, jqXHR, duration) {
                $('#ResponseStatus').text(jqXHR.status + " " + jqXHR.statusText).addClass("code" + jqXHR.status);

                content_type = jqXHR.getResponseHeader("Content-type");
                content_simple_type = "text"; // By default, assume text
                if (content_type != null) {
                    if (content_type.indexOf("application/json") >= 0 || content_type.indexOf("application/javascript") >= 0) {
                        content_simple_type = "javascript";
                        data = js_beautify(data);
                    } else if (content_type.indexOf("text/html") >= 0 || content_type.indexOf("application/xhtml+xml") >= 0 || content_type.indexOf("application/xml") >= 0) {
                        content_simple_type = "htmlmixed";
                        data = html_beautify(data);
                    }
                }

                // Calculate length of response
                content_length = jqXHR.getResponseHeader("Content-Length");
                if (content_length == null) {
                    content_length = data.length
                }

                $('#ResponseType').text(content_type);
                $('#ResponseSize').text(content_length + " bytes");
                $('#ResponseTime').text(parseFloat(duration).toFixed(2) + " ms");

                // Set body
                restman.ui.editors.setValue("#ResponseContent", data);
                $('[data-target="#ResponseContent"][data-switch-type="' + content_simple_type + '"]').click()

                // Set response headers
                var response_headers = jqXHR.getAllResponseHeaders().split("\n");
                $('#ResponseHeaders > li:not([data-clone-template])').remove();
                for (var i in response_headers) {
                    var headervalue = response_headers[i];
                    var sep = headervalue.indexOf(":");

                    var key = headervalue.substring(0, sep).trim();
                    var value = headervalue.substring(sep + 1).trim();

                    if (key !== "") {
                        var row = restman.ui.dynamic_list.add_item($('#ResponseHeaders'));
                        row.find('.key').text(key);
                        row.find('.value').text(value);
                    }
                }
                document.querySelector('#progress').value = 0;
                $(".shouldwait").removeClass('loading');
            },
            onProgressHandler
        );
    })

});
