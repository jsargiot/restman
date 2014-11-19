/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 */
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

/*
 * Adds a history item to the History section.
 *
 * The new item is always inserted at the beggining (newer)
 */
function add_history_item (item) {
    var clone = $('#HistoryList .template-item').clone(true);
    // Set id
    var a = clone.children('a');
    a.attr('data-history-item', item.timestamp);
    a.children('.history-method').text(item.method);
    a.children('.history-url').text(item.url);
    clone.removeClass('template-item');
    $('#HistoryList').prepend(clone);
}

function reload_history() {
    // Clean history
    $('#HistoryList > li:not(.template-item)').remove();
    // Re-populate history.
    var history = restman.storage.getAllRequests(function(item) {
        add_history_item(item);
    });
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
    $(".shouldwait").addClass('loading');
    document.querySelector('#progress').value = 0;

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
    restman.storage.saveRequest(method, url, headers, body, function (item){
        add_history_item(item);
    });

    restman.request.raw_request(
        method,
        url,
        headers,
        data,
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
            // Set body
            editors["#ResponseContent"].setValue(data);

            // Set response headers
            var response_headers = jqXHR.getAllResponseHeaders().split("\n");
            $('#ResponseHeaders > li:not(.template-item)').remove();
            for (var i in response_headers) {
                var headervalue = response_headers[i];
                var sep = headervalue.indexOf(":");

                var key = headervalue.substring(0, sep).trim();
                var value = headervalue.substring(sep + 1).trim();

                if (key !== "") {
                    var row = cloneListItem($('#ResponseHeaders'));
                    row.find('span.key').text(key);
                    row.find('span.value').text(value);
                }
            }
            $(".shouldwait").removeClass('loading');
        },
        onProgressHandler
    );
})


$("a.switch-xml").click(function(event) {
    /* Act on the event */
    var textarea = $(this).attr("href");
    editor = editors[textarea];
    editor.setOption("mode", "htmlmixed");

    var beautified = html_beautify(editor.getValue())
    editor.setValue(beautified);

    $(this).parent().parent().children(".active").removeClass('active');
    $(this).parent().addClass('active');
});

$("a.switch-json").click(function(event) {
    /* Act on the event */
    var textarea = $(this).attr("href");
    editor = editors[textarea];
    editor.setOption("mode", "javascript");

    var beautified = js_beautify(editor.getValue())
    editor.setValue(beautified);

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

    cloneListItem(parent);
    // Avoid going to href
    return false;
});

/*
 * CHILD TEMPLATE ITEM
 *
 * This works for things that have a template item and should clone it on
 * demand and append it to the target object.
 *
 */
function cloneListItem(target) {
    // Get the template child to clone
    var original = $(target).children(".template-item");

    // Clone and clean
    if (original) {
        // Clone template (with data and events!)
        var cloned = original.clone(true);
        // Remove id for the clones
        cloned.each(function(index, elem) { elem.id = ""; });
        cloned.removeClass("template-item");

        // Add the new born to the container
        $(target).append(cloned);
        return cloned;
    }
    return false;
}

/*
 * FILE DROP ON TEXT INPUTS (Only for the FormData form)
 *
 * Turn a normal `input[type="text"]` component into a drop-zone for files. When
 * a file is dropped over the input element, it will be converted to a
 * `type="file" element`. This will allow an user to drop a file over the
 * 'value' input element to add a file to the form data.
 *
 */
$('input[type="text"][data-fileable]').on("dragover drop", function(e) {
    return e.preventDefault();
}).on("drop", function(e) {
    // Change type of this input to file
    target = $(e.target);
    target.attr("type", "file");
    target.prop("files", e.originalEvent.dataTransfer.files);
    return $(this);
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

/*
 * SAVE AUTHORIZATION HEADER
 */
$('#BasicAuthForm .save-modal').click(function (event) {
    var user = $('#BasicAuthForm input[name="user"]').val();
    var pass = $('#BasicAuthForm input[name="pass"]').val();

    // TODO: Delete Authorization header if exists
    var item = cloneListItem('#HeadersTable');
    item.find('input.key').val('Authorization');
    item.find('input.value').val('Basic ' + btoa(user + ':' + pass));

    $('#BasicAuthForm').foundation('reveal', 'close')
});

$(document).ready(function(event) {
    /*
     * LOAD HISTORY ITEM
     *
     * <a href="#" data-history-item="1411588114901">Cargar</a>
     *
     */
    $('[data-history-item]').click(function (event) {
        // Load history item.
        restman.storage.getRequest(parseInt($(this).attr('data-history-item')), function (item){
            $('#Method').val(item.method);
            $('#Url').val(item.url);

            // Load Headers
            // Cleanup headers
            $('#HeadersTable > li:not(.template-item)').remove();
            for (var d in item.headers) {
                var row = cloneListItem($('#HeadersTable'));
                row.find('label input.key').val(d);
                row.find('label input.value').val(item.headers[d]);
            }

            if (!('type' in item.body)) {
                item.body.type = 'raw';
            }
            // Load Body
            if (item.body.type == 'raw') {
                editors["#RequestContent"].setValue(item.body.content || '');
            }
            if (item.body.type == 'form') {
                // Cleanup form
                $('#FormData > li:not(.template-item)').remove();
                for (var d in item.body.content) {
                    var row = cloneListItem($('#FormData'));
                    row.find('label input.key').val(d);
                    row.find('label input.value').val(item.body.content[d]);
                }
            }
            $('#ContentType').val(item.body.type).change();
        });
        return false;
    });

    $('#ClearHistory').click(function (event) {
        restman.storage.getAll('requests', function (obj) {
            restman.storage.deleteRequest(obj.timestamp, function (e) {});
        });
    });

    $('#HistoryList a.delete-parent').click(function(event) {
        // We just take care of the delete of the history item since the delete
        // of the row will be taken care by the first a.delete-parent click
        // event.

        // Remove history entry
        var id = $(this).attr('data-history-item');
        restman.storage.deleteRequest(parseInt(id), function (e) {});

        // Avoid going to href
        return false;
    });

    reload_history();
});