/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 */
$(document).ready(function(event) {
    var version = chrome.app.getDetails()['version'] || "N/A";
    $('#VersionNumber').text("v" + version);
});
