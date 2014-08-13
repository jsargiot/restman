//
//

function collect_headers(table) {
    headers = {}
    $("#HeadersTable tbody tr").each(function (index){
        var inputs = $(this).find("input")
        var inputs = $(this).find("input");
        headers[$.trim(inputs[0].value)] = $.trim(inputs[1].value);
    });
    return headers;
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

    headers = collect_headers();

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
            null);
    }else{
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
            editors["#RequestContent"].getValue());
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

$("a.delete-row").click(function(event) {
    /* Act on the event */
    var row = $(this).parent().parent();
    row.remove();
});

$("#AddHeader").click(function(event) {
    /* Act on the event */
    var original = $("#RowTemplate");
    var cloned = original.clone()[0];
    cloned.id = "";
    original.parent().append(cloned);
});
