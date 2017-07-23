Feature: History management

  Background: Clean UI
    Given I reload the extension
      and I clear the history

  Scenario: An entry in the history is added when a request is made
    Given request method is "GET"
      and url is "http://localhost:5000/get"
    When I click on send
      and I wait for request to finish
    Then I open History dialog
      and url "http://localhost:5000/get" with method "GET" it's in the history

  Scenario: A second entry doesn't remove previous entries
    Given request method is "GET"
      and url is "http://localhost:5000/get?first=request"
      and I click on send
      and I wait for request to finish
      and url is "http://localhost:5000/get?second=request"
      and I click on send
      and I wait for request to finish
    When I open History dialog
    Then url "http://localhost:5000/get?first=request" with method "GET" it's in the history
      and url "http://localhost:5000/get?second=request" with method "GET" it's in the history

  Scenario: Clear All removes all entries in history
    Given request method is "GET"
      and url is "http://localhost:5000/get?first=request"
      and I click on send
      and I wait for request to finish
    When I clear the history
    Then I open History dialog
      and there are no entries in history

  Scenario: Clicking on entry's delete button removes that entry
    Given request method is "GET"
      and url is "http://localhost:5000/get"
      and I click on send
      and I wait for request to finish
      and I open History dialog
      and url "http://localhost:5000/get" with method "GET" it's in the history
    When I remove the first element in the history list
    Then there are no entries in history
