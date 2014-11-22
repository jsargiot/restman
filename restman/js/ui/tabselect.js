/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 *
 * Turn a normal select into a Foundation tab switcher. This works by invoking
 * the "toggle_active_tab" when the select changes. The code needed is like
 * the following:
 *
 *     <select data-tab data-tab-select>
 *         <option value="value1" data-tab-panel="#panel1">Raw</option>
 *         <option value="value2" data-tab-panel="#panel2">Form data</option>
 *     </select>
 *     <div class="tabs-content">
 *         <div class="content active" id="panel1">
 *             <h2>Title Panel1</h2>
 *         </div>
 *         <div class="content" id="panel2">
 *             <h2>Title Panel2</h2>
 *         </div>
 *     </div>
 *
 * Requires: Foundation > 5.4
 */
$(document).ready(function(event) {
    $("[data-tab-select]").change(function (event) {
        self = $(event.target);
        panel = self.children("option:selected").attr('data-tab-panel');

        self.children = function (until, selector) {
            return $('<a href="' + panel + '">Hi</a>');
        };
        Foundation.libs.tab.toggle_active_tab(self);
    });
});