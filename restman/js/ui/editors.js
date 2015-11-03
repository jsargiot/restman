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

    restman.ui.editors = {
        _editors: {},

        create: function(textareaId, readonly) {
            var options = { 'lineNumbers': true, 'matchBrackets': true }
            if (readonly) {
                options['readOnly'] = true;
            }
            restman.ui.editors._editors[textareaId] = CodeMirror.fromTextArea($(textareaId)[0], options);
            return textareaId;
        },

        get: function(id) {
            return restman.ui.editors._editors[id];
        },

        setValue: function(id, value) {
            var e = restman.ui.editors.get(id);
            e.setValue(value);
            e.refresh();
        }
    };
})();

function js_beautify(jsonVal) {
    try {
        obj = JSON.parse(jsonVal);
        return JSON.stringify(obj, null, "    ")
    } catch (e) {
        // pass
    }
    return jsonVal
}

$(document).ready(function(event) {
    // Create editor for raw body
    restman.ui.editors.create('#RequestContent', false);
    // Create editor for request response
    restman.ui.editors.create('#ResponseContent', true);

    // Prepare switches
    $("*[data-switch-type]").click(function(event) {
        var beautifiers = {
            "javascript": js_beautify,
            "html": null,
            "htmlmixed": html_beautify,
            "text": null
        };

        var button = $(this);
        var source_type = button.attr('data-switch-type');

        var editor_id = button.attr("data-target");
        editor = restman.ui.editors.get(editor_id);
        editor.setOption("mode", source_type);

        var value = editor.getValue();
        if (beautifiers[source_type]) {
            try {
                value = beautifiers[source_type](value);
            } catch (e) {
                // Ignore errors, just use value as is
            }
        }
        restman.ui.editors.setValue(editor_id, value);

        button.parent().parent().children(".active").removeClass('active');
        button.parent().addClass('active');
    });

    // Fix for bug where CodeMirror won't show the gutter properly when
    // it's created hidden.
    function refreshBodyCodeMirror(event, tab) {
        restman.ui.editors.get("#RequestContent").refresh();
    };
    // As soon as the panel is shown, trigger the fix.
    $('#PanelRaw').on("toggled", refreshBodyCodeMirror);
    $('#BodySection').on("expanded", refreshBodyCodeMirror);

    // Fix for bug where CodeMirror won't show the gutter properly when
    // it's created hidden.
    function refreshResponseCodeMirror(event, tab) {
        restman.ui.editors.get("#ResponseContent").refresh();
    };
    // As soon as the panel is shown, trigger the fix.
    $('#ResponsePanel').on("toggled", refreshResponseCodeMirror);
    $('#ResponseSection').on("expanded", refreshResponseCodeMirror);

});
