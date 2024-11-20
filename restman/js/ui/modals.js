/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 */
$(document).ready(function(event) {
    /* Save Authorization header */
    $('#BasicAuthForm .save-modal').click(function (event) {
        var user = $('#BasicAuthForm input[name="user"]').val();
        var pass = $('#BasicAuthForm input[name="pass"]').val();

        var item = restman.ui.dynamic_list.add_item('#HeadersTable');
        item.find('input.key').val('Authorization');
        item.find('input.value').val('Basic ' + btoa(user + ':' + pass));

        $('#BasicAuthForm').foundation('reveal', 'close')
    });

    /* Save Options */
    $('#OptionsForm .save-modal').click(function (event) {
        var theme = $('input[name=theme]:checked', '#OptionsForm').val();
        var layout = $('input[name=layout]:checked', '#OptionsForm').val();
        restman.settings.save(theme, layout, function(algo) {
            restman.ui.theme.update(theme, layout)
            $('#OptionsForm').foundation('reveal', 'close')
        });

    });

    $('#ImportRequestForm .save-modal').click(function (event) {
        var value = restman.ui.editors.get('#ImportRequestEditor').getValue();
        // Parse value entered by user
        obj = JSON.parse(value);

        // Load it up in the UI
        restman.ui.request.load(obj);

        // Close modal
        $('#ImportRequestForm').foundation('reveal', 'close')
    });

    /* Cancel buttons for modals */
    $('.reveal-modal .close-modal').click(function (event) {
        $(this).parent().parent().foundation('reveal', 'close')
    });

    /* Load saved settings and set the values in the options form */
    restman.settings.load(function(settings) {
        /* Set default values */
        if (!settings.theme)
            settings.theme = 'light';
        if (!settings.layout)
            settings.layout = 'stack';

        $('input[name=theme][value=' + settings.theme + ']').prop('checked', true);
        $('input[name=layout][value=' + settings.layout + ']').prop('checked', true);
        if (settings.theme && settings.layout) {
            restman.ui.theme.update(settings.theme, settings.layout);
        }
    })
});
