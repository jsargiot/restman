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
        }
    };
})();

$(document).ready(function(event) {
    // Create editor for raw body
    restman.ui.editors.create('#RequestContent', false);
    // Create editor for request response
    restman.ui.editors.create('#ResponseContent', true);

    // Prepare switches
    $("*[data-switch-type]").click(function(event) {
        var beautifiers = {
            "json": js_beautify,
            "htmlmixed": html_beautify,
            "text": null
        };

        var button = $(this);
        var source_type = button.attr('data-switch-type');

        editor = restman.ui.editors.get(button.attr("data-target"));
        editor.setOption("mode", source_type);

        var value = editor.getValue();
        if (beautifiers[source_type]) {
            value = beautifiers[source_type](value);
        }
        editor.setValue(value);

        button.parent().parent().children(".active").removeClass('active');
        button.parent().addClass('active');
    });

    // Fix for bug where CodeMirror won't show the gutter properly when
    // it's created hidden.
    function refreshCodeMirror(event) {
        restman.ui.editors.get("#RequestContent").refresh();
        // Remove handler, we only need one refresh
        $('#PanelRaw').off("toggled");
    };
    // As soon as the panel is shown, trigger the fix.
    $('#PanelRaw').on("toggled", refreshCodeMirror);
});