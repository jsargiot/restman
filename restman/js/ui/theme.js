/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 */

var restman = restman || {};

(function() {
    'use strict';

    restman.ui.theme = {

        update: function(theme, layout) {
            var $body = $('body');

            if (theme == 'light') {
                $body.removeClass('dark-restman');
                $('.CodeMirror').removeClass('cm-s-monokai').addClass('cm-s-default');
            } else {
                $body.addClass('dark-restman');
                $('.CodeMirror').removeClass('cm-s-default').addClass('cm-s-monokai');
            }

            var $container = $('#MainEditors');
            if (layout == 'side') {
                $container.removeClass('flex-columns');
            } else {
                $container.addClass('flex-columns');
            }
        }
    };
})();
