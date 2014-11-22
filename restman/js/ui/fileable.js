/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 *
 * Turns a normal `input[type="text"]` component into a drop-zone for files.
 * When a file is dropped over the input element, it will be converted to a
 * `type="file" element`.
 *
 * Example:
 * <input type="text" placeholder="Write text or drop file..." data-fileable />
 *
 */

$(document).ready(function(event) {

    $('input[type="text"][data-fileable]').on("dragover drop", function(e) {
        return e.preventDefault();
    }).on("drop", function(e) {
        // Change type of this input to file
        target = $(e.target);
        target.attr("type", "file");
        target.prop("files", e.originalEvent.dataTransfer.files);
        return $(this);
    });

});