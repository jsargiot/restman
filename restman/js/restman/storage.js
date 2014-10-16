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

    restman.storage = {
        db: undefined,

        /* Database name. */
        DB_NAME: 'restman',

        /* Database version. */
        DB_VERSION: 1,

        /*
         * Open storage store for reading/writing.
         */
        open: function(fn_onsuccess) {
            var idb = indexedDB.open(restman.storage.DB_NAME,
                                     restman.storage.DB_VERSION);

            idb.onupgradeneeded = function (evt) {
                var dbobject = evt.target.result;
                if (evt.oldVersion < 1) {
                    dbobject.createObjectStore('requests',
                                               {keyPath: 'timestamp'});
                }
            };

            idb.onsuccess = function (event) {
                if (restman.storage.db === undefined) {
                    restman.storage.db = event.target.result;
                }
                fn_onsuccess(restman.storage.db);
            };
        },

        getAll: function(storeId, fn_onsuccess) {
            restman.storage.open(function(dbobject) {
                var r_trans = dbobject.transaction(storeId, 'readonly');
                var store = r_trans.objectStore(storeId);
                var request = store.openCursor(IDBKeyRange.lowerBound(0),
                                               'next');

                request.onsuccess = function (successevent) {
                    var cursor = request.result;
                    if (cursor) {
                        fn_onsuccess(successevent.target.result.value);
                        // advance to the next result
                        cursor.continue();
                    }
                }
            });
        },

        getAllRequests: function(fn_onsuccess) {
            return restman.storage.getAll('requests', fn_onsuccess);
        },

        saveRequest: function(method, url, headers, body, fn_onsuccess) {
            restman.storage.open(function(dbobject) {
                // Open a transaction for writing
                var rw_trans = dbobject.transaction(['requests'], 'readwrite');
                var store = rw_trans.objectStore('requests');

                // Build request object
                var entry = {
                    timestamp: new Date().getTime(),
                    method: method,
                    url: url,
                    headers: headers,
                    body: body,
                };

                // Save the entry object
                store.add(entry);

                rw_trans.oncomplete = function (evt) {
                    console.debug('Request saved successfully.');
                    fn_onsuccess(entry);
                };
            });
        },

        getRequest: function(reqId, fn_onsuccess) {
            restman.storage.open(function(dbobject) {
                var r_trans = dbobject.transaction('requests', 'readonly');
                var store = r_trans.objectStore('requests');
                var request = store.get(reqId);

                request.onsuccess = function (successevent) {
                    var result = request.result;
                    if (result) {
                        fn_onsuccess(successevent.target.result);
                    }
                }
            });
        },

        deleteRequest: function (reqId, fn_onsuccess) {
            restman.storage.open(function(dbobject) {
                var r_trans = dbobject.transaction('requests', 'readwrite');
                var store = r_trans.objectStore('requests');
                var request = store.delete(reqId);

                request.oncomplete = function (successevent) {
                    var result = request.result;
                    if (result) {
                        fn_onsuccess(successevent.target.result);
                    }
                }

                request.onerror = function(e) {
                    console.error(e);
                };
            });
        },

    };
})();
