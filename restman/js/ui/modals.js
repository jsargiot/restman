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

    /* Cancel buttons for modals */
    $('.reveal-modal .close-modal').click(function (event) {
        $(this).parent().parent().foundation('reveal', 'close')
    });
});