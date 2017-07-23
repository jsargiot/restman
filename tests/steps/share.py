#!/usr/bin/env python
# -*- coding: utf-8 -*-
import base64
import json

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions

from behave import *

@step('I share first element in the history list')
def step_impl(context):
    context.execute_steps(u'''
        given I open History dialog
    ''')
    history = context.browser.find_element_by_id("HistoryPopup")
    entries = history.find_elements_by_xpath('.//li[not(@data-clone-template)]')
    assert len(entries) > 0, "There are no entries in the history"
    item = entries[0]
    item.find_elements_by_xpath('.//*[@data-share-item]')[0].click()

@then('the json to share is shown with url "{url}" and contains the following headers')
def step_impl(context, url):
    # Wait for modal to appear
    WebDriverWait(context.browser, 10).until(
        expected_conditions.visibility_of_element_located(
            (By.ID, 'ShareRequestForm')))
    output = context.browser.execute_script("return restman.ui.editors.get('#ShareRequestEditor').getValue();")

    snippet = json.loads(output)

    assert url == snippet["url"], "URL: \"{}\" not in output.\nOutput: {}".format(value, output)
    for row in context.table:
        assert row['key'] in snippet['headers'], "Header {} is not in output".format(row['key'])
        assert row['value'] == snippet['headers'][row['key']], "Header value is not correct. Expected: {}; Actual: {}".format(value, snippet['headers'][name])

@step('I click on import request')
def step_impl(context):
    context.execute_steps(u'''
        given I open History dialog
    ''')
    # Click on import
    context.browser.find_element_by_id('ImportHistory').click()
    WebDriverWait(context.browser, 10).until(
        expected_conditions.visibility_of_element_located(
            (By.ID, 'ImportRequestForm')))

@step('I write a shared request for "{url}"')
def step_impl(context, url):
    req = json.dumps({
        "method": "POST",
        "url": url,
        "headers": {
            "Content-Type": "application/json",
            "X-Test-Header": "shared_request"
        },
        "body": {
            "type": "form",
            "content": {
                "SomeKey": "SomeValue11233",
                "SomeOtherKey": "SomeOtherValue019",
            }
        }
    })
    context.browser.execute_script("return restman.ui.editors.setValue('#ImportRequestEditor', atob('{}'));".format(base64.b64encode(req)))

@step('I click on load import request')
def step_impl(context):
    # Import request
    context.browser.find_element_by_xpath("//*[@id='ImportRequestForm']//input[@value='Import']").click()
