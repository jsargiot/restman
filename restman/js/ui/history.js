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
                restman.storage.getAllRequests(function(item) {
                    restman.ui.history.dialog.add(item);
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
        // of the row will be taken care by the first a.delete-parent click
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
            // Load Body
            if (item.body.type == 'raw') {
                restman.ui.editors.get("#RequestContent").setValue(item.body.content || '');
            }
            if (item.body.type == 'form') {
                // Cleanup form
                $('#FormData > li:not([data-clone-template])').remove();
                // Load form items
                for (var d in item.body.content) {
                    var row = restman.ui.dynamic_list.add_item($('#FormData'), true);
                    row.find('input.key').val(d);
                    row.find('input.value').val(item.body.content[d]);
                }
            }
        });
        return false;
    });

    restman.ui.history.dialog.reload();
});