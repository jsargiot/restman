//
//

function collect_headers(table) {
    headers = {}
    $(table).children("li").each(function (index){
        var inputs = $(this).find("input");
        var header = $.trim(inputs[0].value);
        var value = inputs[1].type == "file" ? inputs[1].files[0] : inputs[1].value;
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
    request = new Request();

    $(".shouldwait").addClass('loading');

    var method = $("#Method").val();
    var url = $("#Url").val();
    var headers = collect_headers("#HeadersTable");
    var ctype = $("#ContentType").val();
    var body = {};
    var data = null;

    if (method !== "GET") {
        if (ctype == "raw") {
            body.type = "raw";
            body.content = editors["#RequestContent"].getValue().replace(/\n/g, "\r\n") + "\r\n";
            data = body.content;
        }
        if (ctype == "form") {
            data = new FormData();
            body.type = "form";
            body.content = collect_headers("#FormData");
            for (var i in body.content) {
                data.append(i, body.content[i]);
            }
        }
    }

    // Save request for loading later.
    restman.storage.saveRequest(method, url, headers, body);

    request.send(
        url,
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
        data,
        onProgressHandler
    );
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
 * FILE DROP ON TEXT INPUTS (Only for the FormData form)
 *
 * Turn a normal `input[type="text"]` component into a drop-zone for files. When
 * a file is dropped over the input element, it will be converted to a
 * `type="file" element`. This will allow an user to drop a file over the
 * 'value' input element to add a file to the form data.
 *
 */
$('#FormData input[type="text"]').on("dragover drop", function(e) {
    return e.preventDefault();
}).on("drop", function(e) {
    // Change type of this input to file
    target = $(e.target);
    target.attr("type", "file");
    target.prop("files", e.originalEvent.dataTransfer.files);
    return $();
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
 *     <select data-tab data-tab-select>
 *         <option value="value1" data-tab-panel="#panel1">Raw</option>
 *         <option value="value2" data-tab-panel="#panel2">Form data</option>
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
$("[data-tab-select]").change(function (event) {
    self = $(event.target);
    panel = self.children("option:selected").attr('data-tab-panel');

    self.children = function (until, selector) {
        return $('<a href="' + panel + '">Hi</a>');
    };
    Foundation.libs.tab.toggle_active_tab(self);
});