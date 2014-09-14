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

/*
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
}*/





















request = {
    url:"",
    urlParams:{},
    name:"",
    description:"",
    bodyParams:{},
    headers:[],
    method:"GET",
    dataMode:"params",
    isFromCollection:false,
    collectionRequestId:"",
    methodsWithBody:["POST", "PUT", "PATCH", "DELETE"],
    areListenersAdded:false,
    startTime:0,
    endTime:0,
    xhr:null,

    body:{
        mode:"params",
        data:"",
        isEditorInitialized:false,
        codeMirror:false,

        init:function () {
            this.initFormDataEditor();
            this.initUrlEncodedEditor();
            this.initEditorListeners();
        },

        hide:function () {
            request.body.closeFormDataEditor();
            request.body.closeUrlEncodedEditor();
            $("#data").css("display", "none");
        },

        getRawData:function () {
            if (request.body.isEditorInitialized) {
                return request.body.codeMirror.getValue();
            }
            else {
                return "";
            }
        },

        loadRawData:function (data) {
            var body = request.body;

            if (body.isEditorInitialized === true) {
                console.log("Blah__" + data + "____");
                body.codeMirror.setValue(data);
                body.codeMirror.refresh();
            }
        },

        initCodeMirrorEditor:function () {
            request.body.isEditorInitialized = true;
            var bodyTextarea = document.getElementById("body");
            request.body.codeMirror = CodeMirror.fromTextArea(bodyTextarea,
                {
                    mode:"htmlmixed",
                    lineNumbers:true,
                    theme:'eclipse'
                });
            $("#request .CodeMirror-scroll").css("height", "200px");
            request.body.codeMirror.refresh();
        },

        setEditorMode:function (mode, language) {
            var displayMode = $("#body-editor-mode-selector a[data-language='" + language + "']").html();
            $('#body-editor-mode-item-selected').html(displayMode);

            if (request.body.isEditorInitialized) {
                if (mode === "javascript") {
                    request.body.codeMirror.setOption("mode", {"name":"javascript", "json":true});
                }
                else {
                    request.body.codeMirror.setOption("mode", mode);
                }

                request.body.codeMirror.refresh();
            }

        },

        initFormDataEditor:function () {
            var editorId = "#formdata-keyvaleditor";

            var params = {
                placeHolderKey:"Key",
                placeHolderValue:"Value",
                valueTypes:["text", "file"],
                deleteButton:'<img class="deleteButton" src="img/delete.png">',
                onDeleteRow:function () {
                },

                onBlurElement:function () {
                }
            };

            $(editorId).keyvalueeditor('init', params);
        },

        initUrlEncodedEditor:function () {
            var editorId = "#urlencoded-keyvaleditor";

            var params = {
                placeHolderKey:"Key",
                placeHolderValue:"Value",
                valueTypes:["text"],
                deleteButton:'<img class="deleteButton" src="img/delete.png">',
                onDeleteRow:function () {
                },

                onBlurElement:function () {
                }
            };

            $(editorId).keyvalueeditor('init', params);
        },

        initEditorListeners:function () {
            $('#body-editor-mode-selector .dropdown-menu').on("click", "a", function (event) {
                var editorMode = $(event.target).attr("data-editor-mode");
                var language = $(event.target).attr("data-language");
                request.body.setEditorMode(editorMode, language);
            });
        },

        openFormDataEditor:function () {
            var containerId = "#formdata-keyvaleditor-container";
            $(containerId).css("display", "block");

            var editorId = "#formdata-keyvaleditor";
            var params = $(editorId).keyvalueeditor('getValues');
            var newParams = [];
            for (var i = 0; i < params.length; i++) {
                var param = {
                    key:params[i].key,
                    value:params[i].value
                };

                newParams.push(param);
            }
        },

        closeFormDataEditor:function () {
            var containerId = "#formdata-keyvaleditor-container";
            $(containerId).css("display", "none");
        },

        openUrlEncodedEditor:function () {
            var containerId = "#urlencoded-keyvaleditor-container";
            $(containerId).css("display", "block");

            var editorId = "#urlencoded-keyvaleditor";
            var params = $(editorId).keyvalueeditor('getValues');
            var newParams = [];
            for (var i = 0; i < params.length; i++) {
                var param = {
                    key:params[i].key,
                    value:params[i].value
                };

                newParams.push(param);
            }
        },

        closeUrlEncodedEditor:function () {
            var containerId = "#urlencoded-keyvaleditor-container";
            $(containerId).css("display", "none");
        },

        setDataMode:function (mode) {
            request.dataMode = mode;
            request.body.mode = mode;
            $('#data-mode-selector a').removeClass("active");
            $('#data-mode-selector a[data-mode="' + mode + '"]').addClass("active");

            $("#body-editor-mode-selector").css("display", "none");
            if (mode === "params") {
                request.body.openFormDataEditor();
                request.body.closeUrlEncodedEditor();
                $('#body-data-container').css("display", "none");
            }
            else if (mode === "raw") {
                request.body.closeUrlEncodedEditor();
                request.body.closeFormDataEditor();
                $('#body-data-container').css("display", "block");

                if (request.body.isEditorInitialized === false) {
                    request.body.initCodeMirrorEditor();
                }
                else {
                    request.body.codeMirror.refresh();
                }
                $("#body-editor-mode-selector").css("display", "block");
            }
            else if (mode === "urlencoded") {
                request.body.closeFormDataEditor();
                request.body.openUrlEncodedEditor();
                $('#body-data-container').css("display", "none");
            }
        },

        getDataMode:function () {
            return request.body.mode;
        },

        getData:function () {
            var data;
            var mode = request.body.mode;
            var params;
            var newParams;
            var param;
            var i;

            if (mode === "params") {
                params = $('#formdata-keyvaleditor').keyvalueeditor('getValues');
                newParams = [];
                for (i = 0; i < params.length; i++) {
                    param = {
                        key:params[i].key,
                        value:params[i].value
                    };

                    newParams.push(param);
                }
                data = request.getBodyParamString(newParams);
            }
            else if (mode === "raw") {
                data = request.body.getRawData();
            }
            else if (mode === "urlencoded") {
                params = $('#urlencoded-keyvaleditor').keyvalueeditor('getValues');
                newParams = [];
                for (i = 0; i < params.length; i++) {
                    param = {
                        key:params[i].key,
                        value:params[i].value
                    };

                    newParams.push(param);
                }
                data = request.getBodyParamString(newParams);
            }

            return data;
        },

        loadData:function (mode, data) {
            var body = request.body;
            body.setDataMode(mode);

            body.data = data;

            var params;
            if (mode === "params") {
                params = getUrlVars(data, false);
                $('#formdata-keyvaleditor').keyvalueeditor('reset', params);
            }
            else if (mode === "raw") {
                body.loadRawData(data);
            }
            else if (mode === "urlencoded") {
                params = getUrlVars(data, false);
                $('#urlencoded-keyvaleditor').keyvalueeditor('reset', params);
            }
        },
    },


    init:function () {
        this.url = "";
        this.urlParams = {};
        this.body.data = "";
        this.bodyParams = {};

        this.headers = [];

        this.method = "GET";
        this.dataMode = "params";

        if (!this.areListenersAdded) {
            this.areListenersAdded = true;
            this.initializeHeaderEditor();
            this.initializeUrlEditor();
            this.body.init();
            this.addListeners();
        }

    },

    setHeaderValue:function (key, value) {
        var headers = request.headers;
        var origKey = key;
        key = key.toLowerCase();
        var found = false;
        for (var i = 0, count = headers.length; i < count; i++) {
            var headerKey = headers[i].key.toLowerCase();

            if (headerKey === key && value !== "text") {
                headers[i].value = value;
                found = true;
            }
        }

        var editorId = "#headers-keyvaleditor";
        if (!found && value !== "text") {
            var header = {
                "key":origKey,
                "value":value
            };
            headers.push(header);
        }

        $(editorId).keyvalueeditor('reset', headers);
    },

    getHeaderValue:function (key) {
        var headers = request.headers;
        key = key.toLowerCase();
        for (var i = 0, count = headers.length; i < count; i++) {
            var headerKey = headers[i].key.toLowerCase();

            if (headerKey === key) {
                return headers[i].value;
            }
        }

        return false;
    },

    getHeaderEditorParams:function () {
        var hs = $('#headers-keyvaleditor').keyvalueeditor('getValues');
        var newHeaders = [];
        for (var i = 0; i < hs.length; i++) {
            var header = {
                key:hs[i].key,
                value:hs[i].value,
                name:hs[i].key
            };

            newHeaders.push(header);
        }
        return newHeaders;
    },

    initializeHeaderEditor:function () {
        var params = {
            placeHolderKey:"Header",
            placeHolderValue:"Value",
            deleteButton:'<img class="deleteButton" src="img/delete.png">',
            onInit:function () {
            },

            onAddedParam:function () {
                $("#headers-keyvaleditor .keyvalueeditor-key").autocomplete({
                    source:chromeHeaders,
                    delay:50
                });
            },

            onDeleteRow:function () {
                request.headers = request.getHeaderEditorParams();
                $('#headers-keyvaleditor-actions-open .headers-count').html(request.headers.length);
            },

            onFocusElement:function () {
                $("#headers-keyvaleditor .keyvalueeditor-key").autocomplete({
                    source:chromeHeaders,
                    delay:50
                });
            },

            onBlurElement:function () {
                $("#headers-keyvaleditor .keyvalueeditor-key").autocomplete({
                    source:chromeHeaders,
                    delay:50
                });
                request.headers = request.getHeaderEditorParams();
                $('#headers-keyvaleditor-actions-open .headers-count').html(request.headers.length);
            },

            onReset:function () {
                var hs = $('#headers-keyvaleditor').keyvalueeditor('getValues');
                $('#headers-keyvaleditor-actions-open .headers-count').html(hs.length);
            }
        };

        $('#headers-keyvaleditor').keyvalueeditor('init', params);

        $('#headers-keyvaleditor-actions-close').on("click", function () {
            request.closeHeaderEditor();
        });

        $('#headers-keyvaleditor-actions-open').on("click", function () {
            request.openHeaderEditor();
        });
    },

    getAsJson:function () {
        var request = {
            url:$('#url').val(),
            data:request.body.getData(),
            headers:request.getPackedHeaders(),
            dataMode:request.dataMode,
            method:request.method
        };

        return JSON.stringify(request);
    },

    saveCurrentRequestToLocalStorage:function () {
        
    },

    openHeaderEditor:function () {
        var containerId = "#headers-keyvaleditor-container";
        $(containerId).css("display", "block");
    },

    closeHeaderEditor:function () {
        var containerId = "#headers-keyvaleditor-container";
        $(containerId).css("display", "none");
    },

    getUrlEditorParams:function () {
        var editorId = "#url-keyvaleditor";
        var params = $(editorId).keyvalueeditor('getValues');
        var newParams = [];
        for (var i = 0; i < params.length; i++) {
            var param = {
                key:params[i].key,
                value:params[i].value
            };

            newParams.push(param);
        }

        return newParams;
    },

    initializeUrlEditor:function () {
        var editorId = "#url-keyvaleditor";

        var params = {
            placeHolderKey:"URL Parameter Key",
            placeHolderValue:"Value",
            deleteButton:'<img class="deleteButton" src="img/delete.png">',
            onDeleteRow:function () {
                request.setUrlParamString(request.getUrlEditorParams());
            },

            onBlurElement:function () {
                request.setUrlParamString(request.getUrlEditorParams());
            }
        };

        $(editorId).keyvalueeditor('init', params);

        $('#url-keyvaleditor-actions-close').on("click", function () {
            request.closeUrlEditor();
        });

        $('#url-keyvaleditor-actions-open').on("click", function () {
            var newRows = getUrlVars($('#url').val(), false);
            $(editorId).keyvalueeditor('reset', newRows);
            request.openUrlEditor();
        });
    },

    openUrlEditor:function () {
        var containerId = "#url-keyvaleditor-container";
        $(containerId).css("display", "block");
    },

    closeUrlEditor:function () {
        var containerId = "#url-keyvaleditor-container";
        $(containerId).css("display", "none");
    },

    addListeners:function () {
        $('#data-mode-selector').on("click", "a", function () {
            var mode = $(this).attr("data-mode");
            request.body.setDataMode(mode);
        });

        $('.request-meta-actions-togglesize').on("click", function () {
            var action = $(this).attr('data-action');

            if (action === "minimize") {
                $(this).attr("data-action", "maximize");
                $('.request-meta-actions-togglesize img').attr('src', 'img/circle_plus.png');
                $("#request-description").slideUp(100);
            }
            else {
                $('.request-meta-actions-togglesize img').attr('src', 'img/circle_minus.png');
                $(this).attr("data-action", "minimize");
                $("#request-description").slideDown(100);
            }
        });

        $('#url').keyup(function () {
            var newRows = getUrlVars($('#url').val(), false);
            $('#url-keyvaleditor').keyvalueeditor('reset', newRows);
        });
    },

    getTotalTime:function () {
        this.totalTime = this.endTime - this.startTime;
        return this.totalTime;
    },

    response:{
        status:"",
        responseCode:[],
        time:0,
        headers:[],
        cookies:[],
        mime:"",
        text:"",

        state:{
            size:"normal"
        },
        previewType:"parsed",

        setMode:function (mode) {
            var text = request.response.text;
            request.response.setFormat(mode, text, "parsed", true);
        },

        changePreviewType:function (newType) {
            if (this.previewType === newType) {
                return;
            }

            
        },

        loadHeaders:function (data) {
            this.headers = request.unpackResponseHeaders(data);
            $('#response-headers').html("");
            this.headers = _.sortBy(this.headers, function (header) {
                return header.name;
            });

            $("#response-headers").append(Handlebars.templates.response_headers({"items":this.headers}));

            $('.response-header-name').popover();
        },

        clear:function () {
            this.startTime = 0;
            this.endTime = 0;
            this.totalTime = 0;
            this.status = "";
            this.time = 0;
            this.headers = {};
            this.mime = "";
            this.state.size = "normal";
            this.previewType = "parsed";
            $('#response').css("display", "none");
        },

        showScreen:function (screen) {
            $("#response").css("display", "block");
            var active_id = "#response-" + screen + "-container";
            var all_ids = ["#response-waiting-container",
                "#response-failed-container",
                "#response-success-container"];
            for (var i = 0; i < 3; i++) {
                $(all_ids[i]).css("display", "none");
            }

            $(active_id).css("display", "block");
        },

        load:function (response) {
            if (response.readyState == 4) {
                //Something went wrong
                if (response.status == 0) {
                    var errorUrl = request.url;
                    $('#connection-error-url').html(errorUrl);
                    request.response.showScreen("failed");
                    $('#submit-request').button("reset");
                    return false;
                }

                request.response.showScreen("success")
                request.response.showBody();

                var responseCode = {
                    'code':response.status,
                    'name':httpStatusCodes[response.status]['name'],
                    'detail':httpStatusCodes[response.status]['detail']
                };

                var responseData;
                if (response.responseType == "arraybuffer") {
                    responseData = response.response;
                }
                else {
                    this.text = response.responseText;
                }

                request.endTime = new Date().getTime();

                var diff = request.getTotalTime();

                request.response.time = diff;
                request.response.responseCode = responseCode;
                $('#response-status').html(Handlebars.templates.item_response_code(responseCode));
                $('.response-code').popover();

                //This sets request.response.headers
                this.loadHeaders(response.getAllResponseHeaders());

                $('.response-tabs li[data-section="headers"]').html("Headers (" + this.headers.length + ")");
                $("#response-data").css("display", "block");

                $("#loader").css("display", "none");

                $('#response-time .data').html(diff + " ms");

                var contentType = response.getResponseHeader("Content-Type");

                $('#response').css("display", "block");
                $('#submit-request').button("reset");
                $('#code-data').css("display", "block");

                var language = 'html';

                request.response.previewType = "parsed";

                var responsePreviewType = 'html';

                var url = request.url;

                //Sets request.response.cookies
                request.response.loadCookies(url);

                

                if (request.method === "HEAD") {
                    request.response.showHeaders()
                }

                if (request.isFromCollection === true) {
                    $("#response-collection-request-actions").css("display", "block");
                }
                else {
                    $("#response-collection-request-actions").css("display", "none");
                }
            }


            return true;
        },

        loadCookies:function (url) {
            chrome.cookies.getAll({url:url}, function (cookies) {
                var count;
                if (!cookies) {
                    count = 0;
                }
                else {
                    count = cookies.length;
                }


                if (count == 0) {
                    $("#response-tabs-cookies").html("Cookies");
                    $('#response-tabs-cookies').css("display", "none");
                }
                else {
                    $("#response-tabs-cookies").html("Cookies (" + count + ")");
                    $('#response-tabs-cookies').css("display", "block");
                    cookies = _.sortBy(cookies, function (cookie) {
                        return cookie.name;
                    });

                    for (var i = 0; i < count; i++) {
                        var cookie = cookies[i];
                        if ("expirationDate" in cookie) {
                            var date = new Date(cookie.expirationDate * 1000);
                            cookies[i].expires = date.toUTCString();
                        }
                    }

                    $('#response-cookies-items').html(Handlebars.templates.response_cookies({"items":cookies}));
                }

                request.response.cookies = cookies;
            });
        },

        setFormat:function (language, response, format, forceCreate) {
            //Keep CodeMirror div visible otherwise the response gets cut off
            $('#response-as-code').css("display", "block");
            $('#response-as-text').css("display", "none");

            $('#response-as-image').css("display", "none");
            $('#response-formatting').css("display", "block");
            $('#response-actions').css("display", "block");

            $('#response-formatting a').removeClass('active');
            $('#response-formatting a[data-type="' + format + '"]').addClass('active');
            $('#code-data').css("display", "none");
            $('#code-data').attr("data-mime", language);

            var codeDataArea = document.getElementById("code-data");
            var foldFunc;
            var mode;

            $('#response-language').css("display", "block");
            $('#response-language a').removeClass("active");
            //Use prettyprint here instead of stringify
            if (language === 'javascript') {
                try {
                    response = vkbeautify.json(response);
                    mode = 'javascript';
                    foldFunc = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
                }
                catch (e) {
                    mode = 'text';
                }
                $('#response-language a[data-mode="javascript"]').addClass("active");

            }
            else if (language === 'html') {
                response = vkbeautify.xml(response);
                mode = 'xml';
                foldFunc = CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
                $('#response-language a[data-mode="html"]').addClass("active");
            }
            else {
                mode = 'text';
            }

            


        },

        toggleBodySize:function () {
            if ($('#response').css("display") === "none") {
                return false;
            }

            $('a[rel="tooltip"]').tooltip('hide');
            if (this.state.size === "normal") {
                this.state.size = "maximized";
                $('#response-body-toggle img').attr("src", "img/full-screen-exit-alt-2.png");
                this.state.width = $('#response-data').width();
                this.state.height = $('#response-data').height();
                this.state.display = $('#response-data').css("display");
                this.state.position = $('#response-data').css("position");

                $('#response-data').css("position", "absolute");
                $('#response-data').css("left", 0);
                $('#response-data').css("top", "-15px");
                $('#response-data').css("width", $(document).width() - 20);
                $('#response-data').css("height", $(document).height());
                $('#response-data').css("z-index", 100);
                $('#response-data').css("background-color", "#fff");
                $('#response-data').css("padding", "10px");
            }
            else {
                this.state.size = "normal";
                $('#response-body-toggle img').attr("src", "img/full-screen-alt-4.png");
                $('#response-data').css("position", this.state.position);
                $('#response-data').css("left", 0);
                $('#response-data').css("top", 0);
                $('#response-data').css("width", this.state.width);
                $('#response-data').css("height", this.state.height);
                $('#response-data').css("z-index", 10);
                $('#response-data').css("background-color", "#fff");
                $('#response-data').css("padding", "0px");
            }
        },

        showHeaders:function () {
            $('.response-tabs li').removeClass("active");
            $('.response-tabs li[data-section="headers"]').addClass("active");
            $('#response-data-container').css("display", "none");
            $('#response-headers-container').css("display", "block");
            $('#response-cookies-container').css("display", "none");
        },

        showBody:function () {
            $('.response-tabs li').removeClass("active");
            $('.response-tabs li[data-section="body"]').addClass("active");
            $('#response-data-container').css("display", "block");
            $('#response-headers-container').css("display", "none");
            $('#response-cookies-container').css("display", "none");
        },

        showCookies:function () {
            $('.response-tabs li').removeClass("active");
            $('.response-tabs li[data-section="cookies"]').addClass("active");
            $('#response-data-container').css("display", "none");
            $('#response-headers-container').css("display", "none");
            $('#response-cookies-container').css("display", "block");
        },

        openInNewWindow:function (data) {
            var name = "response.html";
            var type = "text/html";
            
        }
    },

    startNew:function () {
        if (request.xhr !== null) {
            request.xhr.abort();
        }

        this.url = "";
        this.urlParams = {};
        this.body.data = "";
        this.bodyParams = {};
        this.name = "";
        this.description = "";
        this.headers = [];

        this.method = "GET";
        this.dataMode = "params";

        this.refreshLayout();
        $('#url-keyvaleditor').keyvalueeditor('reset');
        $('#headers-keyvaleditor').keyvalueeditor('reset');
        $('#formdata-keyvaleditor').keyvalueeditor('reset');
        $('#update-request-in-collection').css("display", "none");
        $('#url').val();
        $('#url').focus();
        this.response.clear();
    },

    cancel:function () {
        if (request.xhr !== null) {
            request.xhr.abort();
        }

        request.response.clear();
    },

    setMethod:function (method) {
        this.url = $('#url').val();
        this.method = method;
        this.refreshLayout();
    },

    refreshLayout:function () {
        $('#url').val(this.url);
        $('#request-method-selector').val(this.method);
        request.body.loadRawData(request.body.getData());
        $('#headers-keyvaleditor').keyvalueeditor('reset', this.headers);
        $('#headers-keyvaleditor-actions-open .headers-count').html(this.headers.length);
        $('#submit-request').button("reset");
        $('#data-mode-selector a').removeClass("active");
        $('#data-mode-selector a[data-mode="' + this.dataMode + '"]').addClass("active");

        if (this.isMethodWithBody(this.method)) {
            $("#data").css("display", "block");
            var mode = this.dataMode;
            request.body.setDataMode(mode);
        } else {
            request.body.hide();
        }

        if (this.name !== "") {
            $('#request-meta').css("display", "block");
            $('#request-name').css("display", "inline-block");
            if ($('#request-description').css("display") === "block") {
                $('#request-description').css("display", "block");
            }
            else {
                $('#request-description').css("display", "none");
            }
        }
        else {
            $('#request-meta').css("display", "none");
            $('#request-name').css("display", "none");
            $('#request-description').css("display", "none");
        }

        $('.request-help-actions-togglesize a').attr('data-action', 'minimize');
        $('.request-help-actions-togglesize img').attr('src', 'img/circle_minus.png');
    },

    loadRequestFromLink:function (link, headers) {
        this.startNew();
        this.url = link;
        this.method = "GET";

        request.isFromCollection = false;
            if (headers) {
                request.headers = headers;
            }
        

        this.refreshLayout();
    },

    isMethodWithBody:function (method) {
        method = method.toUpperCase();
        return $.inArray(method, request.methodsWithBody) >= 0;
    },

    packHeaders:function (headers) {
        var headersLength = headers.length;
        var paramString = "";
        for (var i = 0; i < headersLength; i++) {
            var h = headers[i];
            if (h.name && h.name !== "") {
                paramString += h.name + ": " + h.value + "\n";
            }
        }

        return paramString;
    },

    getPackedHeaders:function () {
        return this.packHeaders(this.headers);
    },

    unpackResponseHeaders:function (data) {
        if (data === null || data === "") {
            return [];
        }
        else {
            var vars = [], hash;
            var hashes = data.split('\n');
            var header;

            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i];
                var loc = hash.search(':');

                if (loc !== -1) {
                    var name = $.trim(hash.substr(0, loc));
                    var value = $.trim(hash.substr(loc + 1));

                    header = {
                        "name":name,
                        "key":name,
                        "value":value,
                        "description":headerDetails[name.toLowerCase()]
                    };

                    vars.push(header);
                }
            }

            return vars;
        }
    },

    unpackHeaders:function (data) {
        if (data === null || data === "") {
            return [];
        }
        else {
            var vars = [], hash;
            var hashes = data.split('\n');
            var header;

            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i];
                if (!hash) {
                    continue;
                }

                var loc = hash.search(':');

                if (loc !== -1) {
                    var name = $.trim(hash.substr(0, loc));
                    var value = $.trim(hash.substr(loc + 1));
                    header = {
                        "name":$.trim(name),
                        "key":$.trim(name),
                        "value":$.trim(value),
                        "description":headerDetails[$.trim(name).toLowerCase()]
                    };

                    vars.push(header);
                }
            }

            return vars;
        }
    },

    loadRequestInEditor:function (request, isFromCollection) {
        
        this.url = request.url;
        this.body.data = request.body;
        this.method = request.method.toUpperCase();

        if (isFromCollection) {
            $('#update-request-in-collection').css("display", "inline-block");
        }
        else {
            $('#update-request-in-collection').css("display", "none");
        }

        if (typeof request.headers !== "undefined") {
            this.headers = this.unpackHeaders(request.headers);
        }
        else {
            this.headers = [];
        }

        if (typeof request.name !== "undefined") {
            this.name = request.name;
            $('#request-meta').css("display", "block");
            $('#request-name').html(this.name);
            $('#request-name').css("display", "inline-block");
        }
        else {
            this.name = "";
            $('#request-meta').css("display", "none");
            $('#request-name').css("display", "none");
        }

        if (typeof request.description !== "undefined") {
            this.description = request.description;
            $('#request-description').html(this.description);
            $('#request-description').css("display", "block");
        }
        else {
            this.description = "";
            $('#request-description').css("display", "none");
        }

        $('.request-meta-actions-togglesize').attr('data-action', 'minimize');
        $('.request-meta-actions-togglesize img').attr('src', 'img/circle_minus.png');
        $('#headers-keyvaleditor-actions-open .headers-count').html(this.headers.length);

        $('#url').val(this.url);

        var newUrlParams = getUrlVars(this.url, false);

        //@todoSet params using keyvalueeditor function
        $('#url-keyvaleditor').keyvalueeditor('reset', newUrlParams);
        $('#headers-keyvaleditor').keyvalueeditor('reset', this.headers);

        this.response.clear();

        $('#request-method-selector').val(this.method);

        if (this.isMethodWithBody(this.method)) {
            this.dataMode = request.dataMode;
            $('#data').css("display", "block");
            request.body.loadData(request.dataMode, request.data);
        }
        else {
            $('#data').css("display", "none");
        }

        //Set raw body editor value if Content-Type is present
        var contentType = request.getHeaderValue("Content-Type");
        var mode;
        var language;
        if (contentType === false) {
            mode = 'text';
            language = 'text';
        }
        else if (contentType.search(/json/i) !== -1 || contentType.search(/javascript/i) !== -1) {
            mode = 'javascript';
            language = 'json';
        }
        else if (contentType.search(/xml/i) !== -1) {
            mode = 'xml';
            language = 'xml';
        }
        else if (contentType.search(/html/i) !== -1) {
            mode = 'xml';
            language = 'html';
        }
        else {
            language = 'text';
            contentType = 'text';
        }

        request.body.setEditorMode(mode, language);
        $('body').scrollTop(0);
    },

    getBodyParamString:function (params) {
        var paramsLength = params.length;
        var paramArr = [];
        for (var i = 0; i < paramsLength; i++) {
            var p = params[i];
            if (p.key && p.key !== "") {
                paramArr.push(p.key + "=" + p.value);
            }
        }
        return paramArr.join('&');
    },

    setUrlParamString:function (params) {
        this.url = $('#url').val();
        var url = this.url;

        var paramArr = [];

        for (var i = 0; i < params.length; i++) {
            var p = params[i];
            if (p.key && p.key !== "") {
                paramArr.push(p.key + "=" + p.value);
            }
        }

        var baseUrl = url.split("?")[0];
        if (paramArr.length > 0) {
            $('#url').val(baseUrl + "?" + paramArr.join('&'));
        }
        else {
            //Has key/val pair
            if (url.indexOf("?") > 0 && url.indexOf("=") > 0) {
                $('#url').val(baseUrl);
            }
            else {
                $('#url').val(url);
            }

        }
    },

    reset:function () {
    },

    encodeUrl:function (url) {
        var quesLocation = url.indexOf('?');

        if (quesLocation > 0) {
            var urlVars = getUrlVars(url);
            var baseUrl = url.substring(0, quesLocation);
            var urlVarsCount = urlVars.length;
            var newUrl = baseUrl + "?";
            for (var i = 0; i < urlVarsCount; i++) {
                newUrl += encodeURIComponent(urlVars[i].key) + "=" + encodeURIComponent(urlVars[i].value) + "&";
            }

            newUrl = newUrl.substr(0, newUrl.length - 1);
            return url;
        }
        else {
            return url;
        }
    },

    prepareHeadersForProxy:function (headers) {
        var count = headers.length;
        for (var i = 0; i < count; i++) {
            var key = headers[i].key.toLowerCase();
            
        }

        return headers;
    },

    //Send the current request
    send:function (responseType) {
        // Set state as if change event of input handlers was called
        request.setUrlParamString(request.getUrlEditorParams());
        request.headers = request.getHeaderEditorParams();
        $('#headers-keyvaleditor-actions-open .headers-count').html(request.headers.length);

        var i;
        this.url = $('#url').val();
        var url = this.url;
        this.body.data = request.body.getData();

        if (url === "") {
            return;
        }

        var xhr = new XMLHttpRequest();
        request.xhr = xhr;

        request.url = url;

        url = request.encodeUrl(url);

        var originalUrl = $('#url').val();
        var method = this.method.toUpperCase();
        var data = request.body.getRawData();
        var originalData = data;
        var finalBodyData;
        var headers = this.headers;

        request.startTime = new Date().getTime();

        xhr.onreadystatechange = function (event) {
            request.response.load(event.target);
        };

        if (!responseType) {
            responseType = "text";
        }

        xhr.responseType = responseType;
        xhr.open(method, url, true);

        for (i = 0; i < headers.length; i++) {
            var header = headers[i];
            if (!_.isEmpty(header.value)) {
                xhr.setRequestHeader(header.name, envManager.processString(header.value, envValues));
            }
        }

        var rows, count, j;
        var row, key, value;
        
        if (this.isMethodWithBody(method)) {
            if (this.dataMode === 'raw') {
                data = envManager.processString(data, envValues);
                finalBodyData = data;
                xhr.send(finalBodyData);
            }
            else if (this.dataMode === 'params') {
                finalBodyData = new FormData();

                rows = $('#formdata-keyvaleditor').keyvalueeditor('getElements');

                count = rows.length;

                for (j = 0; j < count; j++) {
                    row = rows[j];
                    key = row.keyElement.val();
                    var valueType = row.valueType;
                    var valueElement = row.valueElement;

                    if (valueType === "file") {
                        var domEl = valueElement.get(0);
                        var len = domEl.files.length;
                        for (i = 0; i < len; i++) {
                            finalBodyData.append(key, domEl.files[i]);
                        }
                    }
                    else {
                        value = valueElement.val();
                        value = envManager.processString(value, envValues);
                        finalBodyData.append(key, value);
                    }
                }

                if (count > 0) {
                    xhr.send(finalBodyData);
                }
                else {
                    xhr.send();
                }
            }
            else if (this.dataMode === 'urlencoded') {
                finalBodyData = "";
                rows = $('#urlencoded-keyvaleditor').keyvalueeditor('getElements');
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                count = rows.length;
                for (j = 0; j < count; j++) {
                    row = rows[j];
                    value = row.valueElement.val();
                    value = envManager.processString(value, envValues);
                    value = encodeURIComponent(value);
                    value = value.replace(/%20/g, '+');
                    key = encodeURIComponent(row.keyElement.val());
                    key = key.replace(/%20/g, '+');
                    finalBodyData += key + "=" + value + "&";
                }

                finalBodyData = finalBodyData.substr(0, finalBodyData.length - 1);

                if (count > 0) {
                    xhr.send(finalBodyData);
                }
                else {
                    xhr.send();
                }
            }
        } else {
            xhr.send();
        }

        
        $('#submit-request').button("loading");
        request.response.clear();
        request.response.showScreen("waiting");
    }
};