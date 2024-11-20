/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 *
 * Requires: shortcut.js, jquery
 */
$(document).ready(function(event) {
    // Press Ctrl+Enter to execute request
    shortcut.add("ctrl+enter", function() {
        $("#Send").click();
    });
});
