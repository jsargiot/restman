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

    restman.ui.history = {
        // History list container
        HISTORY_LIST: '#HistoryList',

        /*
         * Adds a history item to the History section.
         *
         * The new item is always inserted at the beggining (newer)
         */
        dialog: {
            add: function (item) {
                var new_item = restman.ui.dynamic_list.add_item(restman.ui.history.HISTORY_LIST, true);
                // Set id
                new_item.attr('data-history-item', item.timestamp);
                // Set values
                new_item.children('.history-method').text(item.method);
                new_item.children('.history-url').text(item.url);
                new_item.children('.history-url').attr('title', item.url);
                new_item.removeClass('template-item');
            },

            reload: function () {
                // Clean non-template items
                $(restman.ui.history.HISTORY_LIST + ' > li:not([data-clone-template])').remove();
                // Re-populate history.
                restman.storage.getAllRequests(function(items) {
                    for (var i in items) {
                        restman.ui.history.dialog.add(items[i]);
                    }
                });
            }
        }
    };
})();


$(document).ready(function(event) {
    
    /* Remove all history items. */
    $('#ClearHistory').click(function (event) {
        $('#HistoryList li [data-delete-item]').click();
    });

    /* Remove a history item. */
    $('#HistoryList li [data-delete-item]').click(function(event) {
        // We just take care of the delete of the history item since the delete
        // of the row will be taken care by the first [data-delete-item] click
        // event.

        // Remove history entry
        var id = $(this).parent().attr('data-history-item');
        restman.storage.deleteRequest(parseInt(id), function (e) {});

        // Avoid going to href
        return false;
    });

    /* Load history item. */
    $('[data-history-item]').click(function (event) {
        // Load history item.
        restman.storage.getRequest(parseInt($(this).attr('data-history-item')), function (item){
            $('#Method').val(item.method);
            $('#Url').val(item.url);

            // Cleanup headers
            $('#HeadersTable > li:not([data-clone-template])').remove();
            // Add headers
            for (var d in item.headers) {
                var row = restman.ui.dynamic_list.add_item($('#HeadersTable'));
                row.find('input.key').val(d);
                row.find('input.value').val(item.headers[d]);
            }
            if (!('type' in item.body)) {
                item.body.type = 'raw';
            }

            // Cleanup body (form and raw)
            var raw_value = '', form_value = [];

            // Load Body
            if (item.body.type == 'raw') {
                raw_value = item.body.content;
                $('a[href="#PanelRaw"]').click();
            }

            if (item.body.type == 'form') {
                form_value = item.body.content;
                $('a[href="#PanelForm"]').click();
            }

            // Load raw value (if set)
            restman.ui.editors.get("#RequestContent").setValue(raw_value);
            // Load form items (if any)
            $('#FormData > li:not([data-clone-template])').remove();
            for (var d in form_value) {
                var row = restman.ui.dynamic_list.add_item($('#FormData'), true);
                row.find('input.key').val(d);
                row.find('input.value').val(item.body.content[d]);
            }
        });
        return false;
    });

    restman.ui.history.dialog.reload();
});