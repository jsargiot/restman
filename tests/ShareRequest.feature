Feature: Request Sharing

  Background: Clean UI
    Given I reload the extension
      and I clear the history

  Scenario: Share request
    Given request method is "POST"
      and url is "http://localhost:5000/post"
      and I open "Headers" section
      and I add the following headers to the request
        | key                       | value                |
        | X-Custom-Request-Header   | testing-sharing-123  |
        | X-Test-Header             | another-sharing      |
      and I click on send
      and I wait for request to finish
      and I open History dialog
      and url "http://localhost:5000/post" with method "POST" it's in the history
    When I share first element in the history list
    Then the json to share is shown with url "http://localhost:5000/post" and contains the following headers
        | key                       | value                |
        | X-Custom-Request-Header   | testing-sharing-123  |
        | X-Test-Header             | another-sharing      |

  Scenario: Import request
    Given I open History dialog
      and I click on import request
      and I write a shared request for "http://localhost:5000/get?shared=request"
    When I click on load import request
    Then url is "http://localhost:5000/get?shared=request"
      and request method is "POST"
      and headers section contains the following headers
        | key                       | value             |
        | Content-Type              | application/json  |
        | X-Test-Header             | shared_request    |
      and form section contains the following keys
        | key                       | value             |
        | SomeKey                   | SomeValue11233    |
        | SomeOtherKey              | SomeOtherValue019 |
