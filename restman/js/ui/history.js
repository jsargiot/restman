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

    var self = restman.ui.history = {
        // History list container
        _$list: $('#HistoryList'),
        _$popup: $('#HistoryPopup'),

        selected: null,

        items: null,

        init: function ($input, $list_container, $popup_container) {
            var $input = $input;

            self._$list = $list_container;
            self._$popup = $popup_container;

            self._$popup.on('mousedown', function (event) { event.preventDefault(); });

            $input.on('focus input', self._input);
            $input.on('blur', self._blur);
            $input.on('keydown', self._keydown);

            self._$list.children('li').on('selected', self._onSelected);
            self._$list.children('li').on('unselected', self._onUnselected);

            $list_container.on('mousedown', self._mousedown);
        },

        _onSelected: function (event) {
            var elem = event.target;
            elem.setAttribute('selected', 'true');
            // Make sure item is not hidden by scroll
            var ebcr = elem.getBoundingClientRect();
            var pbcr = elem.parentElement.getBoundingClientRect();
            if (ebcr.top < pbcr.top)
                elem.scrollIntoView(true);
            if (ebcr.bottom > pbcr.bottom)
                elem.scrollIntoView(false);
        },

        _onUnselected: function (event) {
            event.target.setAttribute('selected', 'false');
        },

        _input: function (event) {
            self._$list.children('li:not([data-clone-template])').map(function (i, e) {
                var text = event.target.value;
                var $elem = $(e);
                if ($elem.is(':contains("' + text + '")')) {
                    $elem.show();
                }else{
                    $elem.hide();
                }
            });
            self.items = self._$list.children('li:not([data-clone-template]):visible');
            self.moveSelection(0); // reset cursor
            self.dialog.show();
        },

        _blur: function (event) {
            self.dialog.hide();
        },

        _keydown: function (event) {
            // If pressed escape, hide hints
            if (event.which == 27) {
                self._blur();
            }
            // If enter is pressed, do nothing, unless there is a hint selected
            if (event.which == 13) {
                if (self.selected != null) {
                    // Enter selected
                    event.preventDefault();
                    self.items[self.selected].click();
                    // restart cursor position
                    self.moveSelection(0);
                }
                self._blur();
            }

            // If pressed up/down select the appropriate entry
            if (event.which == 38 || event.which == 40) {
                event.preventDefault();
                var direction = -1; // down
                if (event.which == 40) {
                    direction = 1; // up
                }
                self.moveSelection(direction);
            }
        },

        /*
         * Moves the selection cursor.
         *
         * Direction can be: -1 for up, 1 for down and 0 to reset position.
         */
        moveSelection: function (direction) {
            // Imagine you have an invisible item at the beginning of the list
            // to simulate going back to the input
            var count = self.items.length + 1;
            var position = 0;  // in input by default

            if (self.selected != null) {
                // unselect previous item
                try{
                    self.items[self.selected].dispatchEvent(new Event('unselected'));
                } catch (Exception) {
                    // Ignore if element doesn't exists
                }
                // translate current selected item to our "list"
                position = self.selected + 1;
            }
            // Calculate new position
            position = (((position + direction) % count) + count) % count;
            // Translate our position to selected element
            if (position > 0 && direction != 0) {
                self.selected = position - 1;
                self.items[self.selected].dispatchEvent(new Event('selected'));
            } else {
                // back to input
                self.selected = null;
            }
        },

        _mousedown: function (event) {
            event.preventDefault();
        },

        /*
         * Adds a history item to the History section.
         *
         * The new item is always inserted at the beginning (newer)
         */
        dialog: {
            add: function (item) {
                var new_item = restman.ui.dynamic_list.add_item(self._$list, true);
                // Set id
                new_item.attr('data-history-item', item.timestamp);
                // Set values
                new_item.children('.history-method').text(item.method);
                new_item.children('.history-url').text(item.url);
                new_item.children('.history-url').attr('title', item.url);
                new_item.removeClass('template-item');
                new_item.addClass('history-method-' + item.method)
            },

            reload: function () {
                // Clean non-template items
                restman.ui.dynamic_list.clear(self._$list);
                // Re-populate history.
                restman.storage.getAllRequests(function(items) {
                    for (var i in items) {
                        self.dialog.add(items[i]);
                    }
                });
            },

            show: function () {
                self._$popup.addClass('history-popup-open');
            },

            hide: function () {
                self._$popup.removeClass('history-popup-open');
            }
        }
    };
})();


$(document).ready(function(event) {
    restman.ui.history.init($('#Url'), $('#HistoryList'), $('#HistoryPopup'));

    /* Remove all history items. */
    $('#ClearHistory').click(function (event) {
        restman.ui.dynamic_list.remove_all('#HistoryList');
        return false;
    });

    $('#CloseHistory').click(function (event) {
        restman.ui.history.dialog.hide();
        return false;
    })

    /* Remove a history item. */
    $('#HistoryList li [data-delete-item]').click(function(event) {
        // We just take care of the delete of the history item since the delete
        // of the row will be taken care by the first [data-delete-item] click
        // event.

        // Remove history entry
        var id = $(this).parent().attr('data-history-item');
        restman.storage.deleteRequest(parseInt(id), function (e) {});

        event.preventDefault();

        return false;
    });

    /* Share a history item. */
    $('#HistoryList li [data-share-item]').click(function(event) {
        // Remove history entry
        var id = $(this).parent().attr('data-history-item');
        restman.storage.getRequest(parseInt(id), function (item){
            restman.ui.editors.setValue("#ShareRequestEditor", JSON.stringify(item, null, 4) || "");

            // Show dialog
            $("#ShareRequestForm").foundation('reveal', 'open');
            // Refresh editor after 200ms
            setTimeout(function() {
                restman.ui.editors.get("#ShareRequestEditor").refresh();
            }, 200);

        });


        return false;
    });

    /* Load history item. */
    $('[data-history-item]').click(function (event) {
        // Load history item.
        restman.storage.getRequest(parseInt($(this).attr('data-history-item')), function (item){
            restman.ui.request.load(item);
        });
        restman.ui.history.dialog.hide();
        return false;
    });

    restman.ui.history.dialog.reload();
});
