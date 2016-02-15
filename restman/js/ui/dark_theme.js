"use strict";

(function() {
    $(document).ready(function(event) {
        $("#dark").click(function (event) {
            /* Act on the event */
            var htmlEl = $("html"),
                method;

            method = (htmlEl.hasClass("dark-theme"))
                ? "removeClass"
                : "addClass";

            htmlEl[method]("dark-theme");

            // Avoid going to href when coming from a link
            return false;
        });
    });
})();
