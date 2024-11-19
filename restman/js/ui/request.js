/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 */
var restman = restman || {};
restman.ui = restman.ui || {};


(function() {
    'use strict';

    var self = restman.ui.request = {
        /*
         * Adds a history item to the History section.
         *
         * The new item is always inserted at the beginning (newer)
         */
        load: function (item) {
            $('#Method').val(item.method);
            $('#Url').val(item.url);

            // Cleanup headers
            $('#HeadersTable > li:not([data-clone-template])').remove();
            // Add headers
            for (var d in item.headers) {
                var row = restman.ui.dynamic_list.add_item($('#HeadersTable'));
                row.find('input.key').val(d);
                row.find('input.value').val(item.headers[d]);
            }
            if (!('type' in item.body)) {
                item.body.type = 'raw';
            }

            // Cleanup body (form and raw)
            var raw_value = '', form_value = [];

            // Load Body
            if (item.body.type == 'raw') {
                raw_value = item.body.content;
                $('a[href="#PanelRaw"]').click();
            }

            if (item.body.type == 'form') {
                form_value = item.body.content;
                $('a[href="#PanelForm"]').click();
            }

            // Load raw value (if set)
            restman.ui.editors.setValue("#RequestContent", raw_value || "");
            // Load form items (if any)
            $('#FormData > li:not([data-clone-template])').remove();
            for (var d in form_value) {
                var row = restman.ui.dynamic_list.add_item($('#FormData'), true);
                row.find('input.key').val(d);
                row.find('input.value').val(item.body.content[d]);
            }
        }
    };
})();

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
            $('#progress').get(0).value = Math.ceil(howmuch);
        }
    }

    var onErrorHandler = function(event) {
        $(".shouldwait").removeClass('loading');
        $('#ResponseStatus').text("CONNECTION ERROR");
        $('#ResponseType').text(" - ");
        $('#ResponseSize').text(" - ");
        $('#ResponseTime').text(" - ");
        $('#progress').get(0).value = 0;
    }

    $("#Send").click(function(event) {
        $(".shouldwait").addClass('loading');
        $('#progress').get(0).value = 0;

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
                restman.ui.editors.setValue("#ResponseContentText", data);
                var iframe = $('#ResponseContentHtml > iframe');
                try {
                    iframe.contents().find('html').html(data);
                } catch (e) {
                    // An error is thrown if the html links images or scripts
                    // outside of the permissions of the extension
                    console.info('Ignoring non-available resources, probably because of security restrictions')
                }
                $('[data-target="#ResponseContentText"][data-switch-type="' + content_simple_type + '"]').click()

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
                $('#progress').get(0).value = 0;
                $(".shouldwait").removeClass('loading');
            },
            onProgressHandler,
            onErrorHandler
        );
    })

});
