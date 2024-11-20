RESTMan for Opera
===

RESTMan is a browser extension to work on http(s) requests.

Inspired by POSTMAN for Chrome.

![RestMan demo](resources/demo.gif "Demo")

Use instructions
---

*Developer mode*: Clone the repo or download the latest package.

- Open the browser (Opera 24 or above, based on Chromium, or any Chrome)
- Go to Extensions tab (Menu -> Extensions).
- Enable Developer mode
- "Load Unpacked Extension" and when asked for a folder choose the folder where the manifest.json file is located.
- A "RESTMAN" button should appear next to your url bar.

*User mode*: Go to [Restman's Extension page](https://addons.opera.com/en/extensions/details/restman/)


Features
---

* GET, POST, PUT, PATCH, DELETE requests.
* Custom request headers.
* Raw and Form data body.
* View highlighted response.
* View response headers.
* Ctrl+Enter sends request.
* Private mode
* Share/Import requests.

Running tests
---

Download drivers for Browsers and place them in tests/drivers folder.

For Chrome: https://chromedriver.chromium.org/capabilities
For Opera: https://github.com/operasoftware/operachromiumdriver

    $ cd tests
    $ virtualenv .virtualenv
    $ source .virtualenv/bin/activate
    $ pip install -r requirements.txt
    $ behave

License
---

MIT License v2 (see LICENSE file).