/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 *
 * This module provides functionality to save and get settings.
 */
var restman = restman || {};

(function() {
    'use strict';

    restman.settings = {

        defaults: {
            theme: 'light',
            layout: 'stack'
        },

        save: function(theme, layout, ok_callback) {
            // Save settings
            chrome.storage.local.set({theme: theme, layout: layout}, ok_callback);
        },

        load: function(on_complete) {
            // Load settings and run the callback
            if (chrome.storage) {
                chrome.storage.local.get(['theme', 'layout'], on_complete);
            } else {
                on_complete(restman.settings.defaults);
            }
        },

    };
})();

