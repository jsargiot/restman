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
        open: function(success_callback) {
            var idb = indexedDB.open(restman.storage.DB_NAME,
                                     restman.storage.DB_VERSION);

            idb.onupgradeneeded = function (evt) {
                var dbobject = evt.target.result;
                if (evt.oldVersion < 1) {
                    dbobject.createObjectStore('requests',
                                               {autoIncrement: true});
                }
            };

            idb.onsuccess = function (event) {
                if (restman.storage.db === undefined) {
                    restman.storage.db = event.target.result;
                }
                success_callback(restman.storage.db);
            };
        },

        getAll: function(storeId, callback) {
            restman.storage.open(function(dbobject) {
                var r_trans = dbobject.transaction(storeId, 'readonly');
                var store = r_trans.objectStore(storeId);
                var request = store.openCursor(IDBKeyRange.lowerBound(0),
                                               'next');

                request.onsuccess = function (successevent) {
                    var cursor = request.result;
                    if (cursor) {
                        callback(request.result);
                        // advance to the next result
                        cursor.continue();
                    }
                }
            });
        },

        saveRequest: function(method, url, headers, body) {
            restman.storage.open(function(dbobject) {
                // Open a transaction for writing
                var rw_trans = dbobject.transaction(['requests'], 'readwrite');
                var store = rw_trans.objectStore('requests');

                // Build request object
                var entry = {
                    method: method,
                    url: url,
                    headers: headers,
                    body: body
                };

                // Save the entry object
                store.add(entry);

                rw_trans.oncomplete = function (evt) {
                    console.debug('Request saved successfully.');
                };
            });
        },
    };

})();
