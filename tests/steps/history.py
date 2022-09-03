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

@step('I open History dialog')
def step_impl(context):
    # Open history by focusing on the input and force a input event that
    # even if the history was closed with ESC it will be shown.
    context.browser.find_element(By.ID, 'Url').send_keys("A", Keys.BACK_SPACE)
    # Wait for modal to appear
    WebDriverWait(context.browser, 10).until(
        expected_conditions.visibility_of_element_located(
            (By.ID, 'HistoryPopup')))

@step('I clear the history')
def step_impl(context):
    context.execute_steps(u'''
        given I open History dialog
    ''')
    # Clear history and exit
    button = WebDriverWait(context.browser, 10).until(
        expected_conditions.visibility_of_element_located(
            (By.ID, 'ClearHistory')))
    button.click()

    ActionChains(context.browser).send_keys(Keys.ESCAPE).perform()
    time.sleep(0.5)

@step('url "{url}" with method "{method}" it\'s in the history')
def step_impl(context, url, method):
    history = context.browser.find_element(By.ID, "HistoryPopup")
    history.find_element(By.XPATH, './/span[contains(@class, "history-method") and text()="{}"]'.format(method))
    history.find_element(By.XPATH, './/span[contains(@class, "history-url") and text()="{}"]'.format(url))

@then('there are no entries in history')
def step_impl(context):
    context.execute_steps(u'''
        given I open History dialog
    ''')
    history = context.browser.find_element(By.ID, "HistoryPopup")
    entries = len(history.find_elements(By.XPATH, './/li[not(@data-clone-template)]'))
    assert entries == 0, "History list is not empty"

@when('I remove the first element in the history list')
def step_impl(context):
    context.execute_steps(u'''
        given I open History dialog
    ''')
    history = context.browser.find_element(By.ID, "HistoryPopup")
    entries = history.find_elements(By.XPATH, './/li[not(@data-clone-template)]')
    assert len(entries) > 0, "There are no entries in the history"
    item = entries[0]
    item.find_elements(By.XPATH, './/*[@data-delete-item]')[0].click()
