//
//

function collect_headers(table) {
    headers = {}
    $(table).children("li").each(function (index){
        var inputs = $(this).find("input");
        var header = $.trim(inputs[0].value);
        var value = $.trim(inputs[1].value);
        if (header && value) {
            headers[header] = value;
        }
    });
    return headers;
}

var onProgressHandler = function(event) {
    if(event.lengthComputable) {
        var howmuch = (event.loaded / event.total) * 100;
                document.querySelector('#progress').value = Math.ceil(howmuch);
    } else {
        console.log("Can't determine the size of the file.");
    }
}

var editors = {}
editors["#ResponseContent"] = CodeMirror.fromTextArea(document.getElementById("ResponseContent"), {
      lineNumbers: true,
      matchBrackets: true,
      readOnly: true
    });

editors["#RequestContent"] = CodeMirror.fromTextArea(document.getElementById("RequestContent"), {
      lineNumbers: true,
      matchBrackets: true
    });

$("#Send").click(function(event) {
    request = new Request()
    
    $(".shouldwait").addClass('loading');

    var method = $("#Method").val();
    var body = null;
    var headers = collect_headers("#HeadersTable");

    if (method == "GET") {
        request.send(
            $("#Url").val(),
            "GET",
            function(data, textStatus, jqXHR, duration) {
                $('#ResponseStatus').text(jqXHR.status + " " + jqXHR.statusText).addClass("code" + jqXHR.status);

                content_type = jqXHR.getResponseHeader("Content-type");
                content_simple_type = "htmlmixed"; // By default, assume XML, HTML
                if (content_type != null) {
                    if (content_type.indexOf("application/json") >= 0) {
                        data = js_beautify(data);
                    } else {
                        if (content_type.indexOf("text/html") >= 0) {
                        data = html_beautify(data);
                        }
                    }
                }

                /*
                // Populate headers table.
                headers = jqXHR.getAllResponseHeaders().split("\n");
                for (var hv in headers) {
                    htext = headers[hv];
                    divider = htext.indexOf(":");
                    header = htext.substr(0, divider);
                    value = htext.substr(divider + 2); // +2 because we ignore ": " (2 chars)
                    if (header) {
                        $("#ResponseHeadersTable").append(
                            $("<span class=\"label radius secondary\"><span class=\"name\">" + header + ": </span><strong class=\"value\">" + value + "</strong></span><br />")
                        );
                    }
                }
                */


                // Calculate length of response
                content_length = jqXHR.getResponseHeader("Content-Length");
                if (content_length == null) {
                    content_length = data.length
                }

                $('#ResponseType').text(content_type);
                $('#ResponseSize').text(content_length + " bytes");

                $('#ResponseTime').text(parseFloat(duration).toFixed(2) + " ms");
                
                output = data;
                editors["#ResponseContent"].setValue(output);
                $(".shouldwait").removeClass('loading');
            },
            headers,
            null,
            onProgressHandler
        );
    }else{
        var ctype = $("#ContentType").val();
        if (ctype == "raw") {
            body = editors["#RequestContent"].getValue().replace(/\n/g, "\r\n") + "\r\n"
        }
        if (ctype == "form") {
            body = new FormData();
            keyvalues = collect_headers("#FormData");
            for (var i in keyvalues) {
                body.append(i, keyvalues[i]);
            }
        }

        request.send(
            $("#Url").val(),
            method,
            function(data, textStatus, jqXHR, duration) {
                $('#ResponseStatus').text(jqXHR.status + " " + jqXHR.statusText).addClass("code" + jqXHR.status);

                content_type = jqXHR.getResponseHeader("Content-type");
                content_simple_type = "htmlmixed"; // By default, assume XML, HTML
                if (content_type != null) {
                    if (content_type.indexOf("application/json") >= 0) {
                        data = js_beautify(data);
                    } else {
                        if (content_type.indexOf("text/html") >= 0) {
                        data = html_beautify(data);
                        }
                    }
                } else {
                    content_type = "";
                }
                

                // Calculate length of response
                content_length = jqXHR.getResponseHeader("Content-Length");
                if (content_length == null) {
                    content_length = data.length
                }

                $('#ResponseType').text(content_type);
                $('#ResponseSize').text(content_length + " bytes");

                $('#ResponseTime').text(parseFloat(duration).toFixed(2) + " ms");
                
                output = data;
                editors["#ResponseContent"].setValue(output);
                $(".shouldwait").removeClass('loading');
            },
            headers,
            body,
            onProgressHandler
        );
    }
    //$('#ResponseCode').each(function(i, e) {hljs.highlightBlock(e)});
    
})


$("a.switch-xml").click(function(event) {
    /* Act on the event */
    var textarea = $(this).attr("href");
    editor = editors[textarea];
    editor.setOption("mode", "htmlmixed");

    $(this).parent().parent().children(".active").removeClass('active');
    $(this).parent().addClass('active');
});

$("a.switch-json").click(function(event) {
    /* Act on the event */
    var textarea = $(this).attr("href");
    editor = editors[textarea];
    editor.setOption("mode", "javascript");

    $(this).parent().parent().children(".active").removeClass('active');
    $(this).parent().addClass('active');
});

$("a.switch-plain").click(function(event) {
    /* Act on the event */
    var textarea = $(this).attr("href");
    editor = editors[textarea];
    editor.setOption("mode", "text");

    $(this).parent().parent().children(".active").removeClass('active');
    $(this).parent().addClass('active');
});


/*
 * HEADERS TABLE
 */
$("a.delete-parent").click(function(event) {
    /* Act on the event */
    var row = $(this).parent();
    row.remove();
    // Avoid going to href
    return false;
});

$("a.template-item-cloner").click(function(event) {
    // Get the id for the container
    var anchor = $(this)[0];
    var target = anchor.href.replace(anchor.baseURI, "");
    var parent = $(target);

    // Get the template child to clone
    var original = parent.children(".template-item");

    // Clone and clean
    if (original) {
        // Clone template (with data and events!)
        var cloned = original.clone(true);
        // Remove id for the clones
        cloned.each(function(index, elem) { elem.id = ""; });
        cloned.removeClass("template-item");

        // Add the new born to the container
        parent.append(cloned);
    }
    // Avoid going to href
    return false;
});

/*
 * EXPANDABLES
 */
$("section.expandable .expander").click(function(event) {
    /* Act on the event */
    var section = $(this).parent();
    
    if (section.hasClass("closed")) {
        section.removeClass("closed");
    } else {
        section.addClass("closed");
    }
    // Avoid going to href when coming from a link
    return false;
});

/*
 * TAB SELECT
 *
 * Turn a normal select into a tab switcher. This works by invoking the
 * "toggle_active_tab" when the select changes. The code needed is like
 * the following:
 *
 *     <select data-tab tab-select>
 *         <option value="value1" tab-panel="#panel1">Raw</option>
 *         <option value="value2" tab-panel="#panel2">Form data</option>
 *     </select>
 *     <div class="tabs-content">
 *         <div class="content active" id="panel1">
 *             <h2>Title Panel1</h2>
 *         </div>
 *         <div class="content" id="panel2">
 *             <h2>Title Panel2</h2>
 *         </div>
 *     </div>
 */
$("[tab-select]").change(function (event) {
    self = $(event.target);
    panel = self.children("option:selected").attr('tab-panel');

    self.children = function (until, selector) {
        return $('<a href="' + panel + '">Hi</a>');
    };
    Foundation.libs.tab.toggle_active_tab(self);
});