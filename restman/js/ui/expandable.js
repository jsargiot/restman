/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 *
 * Example:
 *
 *  <div class="expandable">
 *      <h1 class="expander">Expander</h1>
 *      <p>
 *          ...Content...
 *      </p>
 *  </div>
 */

$(document).ready(function(event) {
    $(".expandable .expander").click(function(event) {
        /* Act on the event */
        var section = $(this).parent();
        
        if (section.hasClass("closed")) {
            section.removeClass("closed");
        } else {
            section.addClass("closed");
        }
        // Avoid going to href when coming from a link
        return false;
    });
});