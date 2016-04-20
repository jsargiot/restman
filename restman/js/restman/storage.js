/*
 * This file is part of RESTMan for Opera Extension.
 * https://github.com/jsargiot/restman
 *
 * Free to use under the MIT license.
 * https://raw.githubusercontent.com/jsargiot/restman/master/LICENSE
 */
var restman = restman || {};

(function () {
    'use strict';

    restman.storage = {
        db: undefined,

        /* Database name. */
        DB_NAME: 'restman',

        /* Database version. */
        DB_VERSION: 1,

        _compareRequests: function (item, entry) {
            // Compare url and method
            if (item.url != entry.url || item.method != entry.method) {
                return false;
            }

            // Compare headers
            var len_headers = Object.keys(item.headers).length;
            if (len_headers != Object.keys(entry.headers).length) {
                return false;
            }
            for (var i in item.headers) {
                if (!(i in entry.headers) || item.headers[i] != entry.headers[i]) {
                    return false;
                }
            }

            // Compare body
            if (item.body.type != entry.body.type) {
                return false;
            }
            if (item.body.type == 'form') {
                var len_form = Object.keys(item.body.content).length;
                if (len_form != Object.keys(entry.body.content).length) {
                    return false;
                }
                for (var i in item.body.content) {
                    if (!(i in entry.body.content) || item.body.content[i] != entry.body.content[i]) {
                        return false;
                    }
                }
            } else {
                if (item.body.content != entry.body.content) {
                    return false;
                }
            }
            return true;
        },

        /*
         * Open storage store for reading/writing.
         */
        open: function (fn_onsuccess) {
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

        getAll: function (storeId, fn_onsuccess) {
            restman.storage.open(function (dbobject) {
                var r_trans = dbobject.transaction(storeId, 'readonly');
                var store = r_trans.objectStore(storeId);
                var request = store.openCursor(IDBKeyRange.lowerBound(0), 'next');
                var items = [];

                // Return all items once the transaction is completed
                r_trans.oncomplete = function (successevent) {
                    fn_onsuccess(items);
                };
                // Get all the items
                request.onerror = function (error) {
                    console.log(error);
                };
                request.onsuccess = function (evt) {
                    var cursor = evt.target.result;
                    if (cursor) {
                        items.push(cursor.value);
                        cursor.continue();
                    }
                };
            });
        },

        getAllRequests: function (fn_onsuccess) {
            return restman.storage.getAll('requests', fn_onsuccess);
        },

        saveRequest: function (method, url, headers, body, fn_onsuccess) {
            restman.storage.open(function (dbobject) {
                // Build request object
                var entry = {
                    timestamp: new Date().getTime(),
                    method: method,
                    url: url,
                    headers: headers,
                    body: body
                };

                restman.storage.getAllRequests(function (items) {
                    // Check that entry isn't in the history already
                    for (var i in items) {
                        var item = items[i];
                        if (restman.storage._compareRequests(item, entry)) {
                            //Entry is already in history
                            return false;
                        }
                    }
                    // Open a transaction for writing
                    var rw_trans = dbobject.transaction(['requests'], 'readwrite');
                    var store = rw_trans.objectStore('requests');
                    var items = [];
                    // Save the entry object
                    store.add(entry);
                    // Notify callback about success
                    rw_trans.oncomplete = function (evt) {
                        fn_onsuccess(entry);
                    };
                });
            });
        },

        getRequest: function (reqId, fn_onsuccess) {
            restman.storage.open(function (dbobject) {
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
            restman.storage.open(function (dbobject) {
                var r_trans = dbobject.transaction('requests', 'readwrite');
                var store = r_trans.objectStore('requests');
                var request = store.delete(reqId);

                request.oncomplete = function (successevent) {
                    var result = request.result;
                    if (result) {
                        fn_onsuccess(successevent.target.result);
                    }
                };

                request.onerror = function (e) {
                    console.error(e);
                };
            });
        }

    };
})();
