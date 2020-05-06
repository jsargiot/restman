# -*- coding: utf-8 -*-
import base64
import time
import subprocess
import sys

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import selenium.webdriver.common.proxy

def start_background_test_server():
    subprocess.Popen([sys.executable, "./test_server.py"])

def prepare_opera(context):
    context.service = Service('drivers/operadriver')
    context.service.start()
    test_extension = "../restman.crx"

    b64ext = base64.b64encode(open(test_extension, 'rb').read())

    capabilities = {
        'operaOptions': {
            'extensions': [b64ext],
        },
        'Proxy': {
            'proxyType': 'system'
        }
    }

    # Create browser
    context.browser = webdriver.Remote(context.service.service_url, capabilities)
    context.browser.switch_to_window(context.browser.window_handles[0])

def prepare_chrome(context):
    context.service = Service('drivers/chromedriver')
    context.service.start()
    test_extension = "../restman.crx"

    b64ext = base64.b64encode(open(test_extension, 'rb').read())

    capabilities = {
        "goog:chromeOptions": {
            "extensions": [b64ext],
        },
        "proxy": {
            "proxyType": "system"
        }
    }

    # Create browser
    context.browser = webdriver.Remote(context.service.service_url, capabilities)

def before_all(context):
    #prepare_chrome(context)
    prepare_opera(context)
    # Start web server (httpbin FTW!)
    context.server = subprocess.Popen([sys.executable, '-m', 'httpbin.core'])

    # Start extension
    context.browser.get('chrome-extension://fohkgjiaiapkkjjchddmhaaaghjakfeg/index.html')
    time.sleep(1)   # Wait for app to load

def after_all(context):
    # Close session
    context.browser.quit()
    time.sleep(0.5)
    context.server.terminate()
