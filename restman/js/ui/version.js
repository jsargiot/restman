/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 */


$(document).ready(function(event) {
    var details = chrome.runtime.requestUpdateCheck(),
        version;

    version = details
        ? details["version"]
        : "N/A";

    $('#VersionNumber').text("v" + version);
});
