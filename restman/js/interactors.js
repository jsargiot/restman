//
//

var editor = CodeMirror.fromTextArea(document.getElementById("ResponseContent"), {
      lineNumbers: true,
      matchBrackets: true,
      readOnly: true,
      htmlMode: true
    });

$("#send").click(function() {
    request = new Request()
    
    request.get(
        $("#url").val(),
        function(data, textStatus, jqXHR, duration) {
            $('#ResponseStatus').text(jqXHR.status + " " + jqXHR.statusText).addClass("code" + jqXHR.status);

            content_type = jqXHR.getResponseHeader("Content-type");
            content_simple_type = "htmlmixed"; // By default, assume XML, HTML
            if (content_type.indexOf("application/json") >= 0) {
                content_simple_type = "javascript";
            }
            
            // Calculate length of response
            content_length = jqXHR.getResponseHeader("Content-Length");
            if (content_length == null) {
                content_length = data.length
            }
            $('#ResponseType').text(content_type);
            $('#ResponseSize').text(content_length + " bytes");

            $('#ResponseTime').text(parseFloat(duration).toFixed(2) + " ms");
            
            //$('#ResponseContent').text(data);
            output = html_beautify(data);
            
            editor.setOption("mode", content_simple_type);
            editor.setValue(output);

        }
    );
    
    $('#ResponseCode').each(function(i, e) {hljs.highlightBlock(e)});
    
})
