/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 *
 */

var restman = restman || {};
restman.ui = restman.ui || {};

(function() {
    'use strict';

    restman.ui.headers = {
        /*
         * Collects the data from the headers table.
         * @table: table id.
         */
        collect: function(table) {
            var headers = {}
            $(table).children("li").each(function (index){
                var inputs = $(this).find("input");
                var header = $.trim(inputs[0].value);
                var value = inputs[1].type == "file" ? inputs[1].files[0] : inputs[1].value;
                if (header && value) {
                    headers[header] = value;
                }
            });
            return headers;
        }
    };
})();
