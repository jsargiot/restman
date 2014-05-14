//
//

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
    
    var method = $("#Method").val();

    if (method == "GET") {
        request.get(
            $("#url").val(),
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

            }
        );
    }else{
        request.post(
            $("#url").val(),
            editors["#RequestContent"].getValue(),
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

            }
        );
    }
    //$('#ResponseCode').each(function(i, e) {hljs.highlightBlock(e)});
    
})


$("a.switch-xml").click(function(event) {
    /* Act on the event */
    var textarea = $(this).attr("href");
    editor = editors[textarea];
    editor.setOption("mode", "htmlmixed");

    $(this).parent().parent().children("dd.active").removeClass('active');
    $(this).parent().addClass('active');
});

$("a.switch-json").click(function(event) {
    /* Act on the event */
    var textarea = $(this).attr("href");
    editor = editors[textarea];
    editor.setOption("mode", "javascript");

    $(this).parent().parent().children("dd.active").removeClass('active');
    $(this).parent().addClass('active');
});

$("a.switch-plain").click(function(event) {
    /* Act on the event */
    var textarea = $(this).attr("href");
    editor = editors[textarea];
    editor.setOption("mode", "text");

    $(this).parent().parent().children("dd.active").removeClass('active');
    $(this).parent().addClass('active');
});
