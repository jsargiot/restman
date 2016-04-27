/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 */

/*
 * Clones the children with the data-clone-template attribute and appends it
 * to the target item. Returns the cloned item, false otherwise.
 */

var restman = restman || {};
restman.ui = restman.ui || {};

(function() {
    'use strict';

    restman.ui.dynamic_list = {
        /*
         * Creates a new item list from template and inserts it into the list.
         * If prepend is true, the new item is inserted at the beginning,
         * otherwise, it's appended. Default behaviour is: append.
         */
        add_item: function(target, prepend) {
            // Get the template child to clone
            var original = $(target).children("[data-clone-template]");

            // Clone and clean
            if (original) {
                // Clone template (with data and events!)
                var cloned = original.clone(true);
                // Remove id for the clones
                cloned.each(function(index, elem) { elem.id = ""; });
                cloned.removeAttr('data-clone-template');

                // Add the new born to the container
                if (prepend) {
                    $(target).prepend(cloned)
                } else {
                    $(target).append(cloned);
                }
                return cloned;
            }
            return false;
        },

        /*
         * Deletes item from list.
         */
        del_item: function(target) {
            $(target).remove();
        },

        /*
         * Clears all the rows in the target, but doesn't remove elements
         */
        clear: function(target) {
            $(target).find('li:not([data-clone-template])').remove();
        },

        /*
         * Removes all elements of the list by clicking on each element's
         * data-delete-item item.
         */
        remove_all: function(target) {
            $(target).find('li:not([data-clone-template])').find('[data-delete-item]').click();
        }
    };
})();


$(document).ready(function(event) {

    $("[data-clone-item]").click(function(event) {
        var id = $(this).attr('data-clone-item');
        var target = $(id);
        // Clone template on target
        restman.ui.dynamic_list.add_item(target);
        return false;
    });

    $("[data-delete-item]").on('click', function(event) {
        var target = $(this).parent();
        restman.ui.dynamic_list.del_item(target);
        return false;
    }).on('keypress', function (event) {
        if (event.which == 13) {
            event.preventDefault();
            // Redirect "enter" to click event
            event.target.click();
        }
    });


    $("[data-clear-all]").click(function(event) {
        var id = $(this).attr('data-clear-all');
        restman.ui.dynamic_list.clear(id);
        return false;
    });
});