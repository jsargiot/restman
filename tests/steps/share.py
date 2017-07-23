#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions

from behave import *

@when('I share first element in the history list')
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
