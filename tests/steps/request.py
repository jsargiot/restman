#!/usr/bin/env python
# -*- coding: utf-8 -*-
import time
import base64
import json

from selenium.webdriver.support.select import Select
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions

from behave import *

@step('I reload the extension')
def step_impl(context):
    time.sleep(0.1)
    context.browser.refresh()
    time.sleep(0.1)

@given('request method is "{method}"')
def step_impl(context, method):
    method_select = context.browser.find_element_by_id('Method')
    Select(method_select).select_by_value(method)

@then('request method is "{method}"')
def step_impl(context, method):
    select_txt = context.browser.find_element_by_id('Method').get_attribute("value")
    assert method == select_txt

@given('url is "{url}"')
def step_impl(context, url):
    input_txt = context.browser.find_element_by_id('Url')
    input_txt.clear()
    input_txt.send_keys(url)
    # Hide history
    input_txt.send_keys(Keys.ESCAPE)
    time.sleep(0.1)

@then('url is "{url}"')
def step_impl(context, url):
    input_txt = context.browser.find_element_by_id('Url').get_attribute("value")
    assert url == input_txt

@step('I click on send')
def step_impl(context):
    send_button = context.browser.find_element_by_id('Send')
    send_button.click()

@step('I press Ctrl+Enter')
def step_impl(context):
    ActionChains(context.browser).send_keys(Keys.CONTROL, Keys.ENTER).perform()

@when('I press Enter on the url textbox')
def step_impl(context):
    input_txt = context.browser.find_element_by_id('Url')
    input_txt.send_keys(Keys.ENTER)

@step('I wait for request to finish')
def step_impl(context):
    input_txt = WebDriverWait(context.browser, 10).until(
        expected_conditions.presence_of_element_located(
            (By.XPATH,
            '//input[@id="Url" and not(contains(@class,"loading"))]')))
    # Give time to UI to reflect status
    time.sleep(0.1)

@then('output contains "{value}"')
def step_impl(context, value):
    output = context.browser.execute_script("return restman.ui.editors.get('#ResponseContentText').getValue();")
    assert value in output, "Value: {}\nOutput: {}".format(value, output)

@then('response body contains the following headers')
def step_impl(context):
    output = context.browser.execute_script("return restman.ui.editors.get('#ResponseContentText').getValue();")
    outdict = json.loads(output)
    assert 'headers' in outdict, "No headers in output"
    # Check if headers in table are in response body
    for row in context.table:
        assert row['key'] in outdict['headers'], "Header {} is not in output".format(row['key'])
        assert row['value'] == outdict['headers'][row['key']], "Header value is not correct. Expected: {}; Actual: {}".format(value, outdict['headers'][name])

@then('response body contains the following FORM DATA')
def step_impl(context):
    output = context.browser.execute_script("return restman.ui.editors.get('#ResponseContentText').getValue();")
    outdict = json.loads(output)
    assert 'form' in outdict, "No FORM DATA in output"
    # Check if headers in table are in response body
    for row in context.table:
        assert row['key'] in outdict['form'], "FORM DATA {} is not in output".format(row['key'])
        assert row['value'] == outdict['form'][row['key']], "FORM DATA value is not correct. Expected: {}; Actual: {}".format(value, outdict['form'][name])

@then('response body doesn\'t contains FORM DATA')
def step_impl(context):
    output = context.browser.execute_script("return restman.ui.editors.get('#ResponseContentText').getValue();")
    outdict = json.loads(output)
    assert 'form' not in outdict, "There is JSON output in body"

@then('response body contains the following json')
def step_impl(context):
    output = context.browser.execute_script("return restman.ui.editors.get('#ResponseContentText').getValue();")
    outdict = json.loads(output)
    indict = json.loads(context.text)
    assert 'json' in outdict, "No json output"
    assert indict == outdict['json'], "JSON body is not correct."

@then('response body doesn\'t contains json')
def step_impl(context):
    output = context.browser.execute_script("return restman.ui.editors.get('#ResponseContentText').getValue();")
    outdict = json.loads(output)
    assert 'json' not in outdict, "There is JSON output in body"

@then('response contains the following headers')
def step_impl(context):
    for row in context.table:
        header_name = context.browser.find_element_by_xpath("//*[@id='ResponseHeaders']//span[text()='{}']".format(row['key']))
        assert header_name, "Header '{}' not found".format(row['key'])
        header_value = context.browser.find_element_by_xpath("//*[@id='ResponseHeaders']//span[text()='{}']".format(row['value']))
        assert header_value, "Header value not found"

@then('return code is "{code}"')
def step_impl(context, code):
    status = context.browser.find_element_by_id('ResponseStatus')
    if not status:
        assert False, "Can't find status"
    assert code.upper() == status.text.upper(), "Received code [{}], expected [{}]".format(status.text, code)

@then('request size is "{size}"')
def step_impl(context, size):
    resp = context.browser.find_element_by_id('ResponseSize')
    assert size.upper() == resp.text.upper(), "Received [{}], expected [{}]".format(resp.text, code)

@step('I open "{name}" section')
def step_impl(context, name):
    elem = context.browser.find_element_by_xpath("//section/h3[text()='{}']".format(name))
    parent = elem.find_elements_by_xpath('..')[0]
    if 'closed' in parent.get_attribute('class'):
        elem.click()
        time.sleep(1) # Wait for section to open

@step('I add Basic Auth header for user "{name}" with pass "{password}"')
def step_impl(context, name, password):
    # Open Basic Auth Form
    context.browser.find_element_by_xpath("//*[@data-reveal-id='BasicAuthForm']").click()
    time.sleep(0.5)   # Waiting for modal to open
    # Write user
    user_txt = context.browser.find_element_by_xpath("//*[@id='BasicAuthForm']//input[@name='user']")
    user_txt.clear()
    user_txt.send_keys(name)
    # Write pass
    pass_txt = context.browser.find_element_by_xpath("//*[@id='BasicAuthForm']//input[@name='pass']")
    pass_txt.clear()
    pass_txt.send_keys(password)
    # Save
    save_btn = context.browser.find_element_by_xpath("//*[@id='BasicAuthForm']//input[@value='Save']")
    save_btn.click()
    time.sleep(0.5)   # Waiting for modal to close

@step('I add the following headers to the request')
def step_impl(context):
    for row in context.table:
        context.browser.find_element_by_xpath("//*[@data-clone-item='#HeadersTable']").click()
        time.sleep(0.1)
        # Complete header name
        name_txt = context.browser.find_element_by_xpath("//*[@id='HeadersTable']/li[last()]/input[1]")
        name_txt.clear()
        name_txt.send_keys(row['key'])
        # Header value
        value_txt = context.browser.find_element_by_xpath("//*[@id='HeadersTable']/li[last()]/input[2]")
        value_txt.clear()
        value_txt.send_keys(row['value'])

@given('a RAW body')
def step_impl(context):
    # Open RAW sub-tab
    context.browser.find_element_by_xpath('//section[@id="BodySection"]//a[@href="#PanelRaw"]').click()
    # Set editor value
    output = context.browser.execute_script("return restman.ui.editors.setValue('#RequestContent', atob('{}'));".format(base64.b64encode(context.text)))

@given('a FORM body')
def step_impl(context):
    # Open FORM sub-tab
    context.browser.find_element_by_xpath('//section[@id="BodySection"]//a[@href="#PanelForm"]').click()
    for row in context.table:
        context.browser.find_element_by_xpath("//*[@data-clone-item='#FormData']").click()
        time.sleep(0.1)
        # Complete header name
        name_txt = context.browser.find_element_by_xpath("//*[@id='FormData']/li[last()]/input[1]")
        name_txt.clear()
        name_txt.send_keys(row['key'])
        # Header value
        value_txt = context.browser.find_element_by_xpath("//*[@id='FormData']/li[last()]/input[2]")
        value_txt.clear()
        value_txt.send_keys(row['value'])

@given('I clean headers section')
def step_impl(context):
    context.execute_steps(u'''
        given I open "Headers" section
    ''')
    context.browser.find_element_by_xpath('//*[@data-clear-all="#HeadersTable"]').click()
    time.sleep(0.1)

@then('headers section contains the following headers')
def step_impl(context):
    # Check if headers in table are in headers section
    headers = context.browser.execute_script("return restman.ui.headers.collect(\"#HeadersTable\");");

    for row in context.table:
        assert row["key"] in headers, "Header {} is not in output".format(row['key'])
        assert headers[row["key"]] == row["value"], "Header value is not correct. Expected: {}; Actual: {}".format(row["value"], headers[row["key"]])

@then('form section contains the following keys')
def step_impl(context):
    # Check if form data is ok
    formdata = context.browser.execute_script("return restman.ui.headers.collect(\"#FormData\");");

    for row in context.table:
        assert row["key"] in formdata, "Key {} is not in form data".format(row['key'])
        assert formdata[row["key"]] == row["value"], "Key value is not correct. Expected: {}; Actual: {}".format(row["value"], formdata[row["key"]])

@given('I clean FORM DATA')
def step_impl(context):
    context.execute_steps(u'''
        given I open "Body" section
    ''')
    context.browser.find_element_by_xpath('//section[@id="BodySection"]//a[@href="#PanelForm"]').click()
    time.sleep(0.1)
    context.browser.find_element_by_xpath('//*[@data-clear-all="#FormData"]').click()
    time.sleep(0.1)

@given('I clean RAW body')
def step_impl(context):
    context.execute_steps(u'''
        given I open "Body" section
        given a RAW body
          """
          """
    ''')
    time.sleep(0.5)
