Feature: Send requests

  Background: Clean UI
    Given I reload the extension

  #
  # METHOD
  #

  Scenario: Correct GET request method returns success
    Given request method is "GET"
      and url is "http://localhost:5000/get"
    When I click on send
      and I wait for request to finish
    Then return code is "200 OK"

  Scenario: Wrong request method returns error
    Given request method is "POST"
      and url is "http://localhost:5000/get"
    When I click on send
      and I wait for request to finish
    Then return code is "405 METHOD NOT ALLOWED"

  Scenario: Correct OPTIONS request method returns success
    Given request method is "OPTIONS"
      and url is "http://localhost:5000/post"
    When I click on send
      and I wait for request to finish
    Then return code is "200 OK"

  #
  # SEND
  #

  Scenario: Ctrl+Enter sends request
    Given request method is "GET"
      and url is "http://localhost:5000/get"
    When I press Ctrl+Enter
      and I wait for request to finish
    Then return code is "200 OK"

  Scenario: Pressing Enter in url textbox sends request
    Given request method is "GET"
      and url is "http://localhost:5000/get"
    When I press Enter on the url textbox
      and I wait for request to finish
    Then return code is "200 OK"

  #
  # RETURN CODES
  #

  Scenario Outline: Result shows correct http return code on error
    Given request method is "GET"
      and url is "http://localhost:5000/status/<error_code>"
    When I click on send
     and I wait for request to finish
    Then return code is "<error_message>"
 
  Examples: Server Errors
    | error_code    | error_message             |
    |     500       | 500 Internal Server Error |
    |     503       | 503 Service Unavailable   |
 
  Examples: Client Errors
    | error_code    | error_message   |
    |     400       | 400 Bad Request |
#   |     401       | 401 Unauthorized| # This has a problem with the auth popup
    |     403       | 403 Forbidden   |
    |     404       | 404 Not Found   |
    |     405       | 405 Method Not Allowed |

  #
  # REQUEST SIZE
  #

  Scenario: Result shows correct response size
    Given request method is "GET"
      and url is "http://localhost:5000/bytes/30101"
    When I click on send
      and I wait for request to finish
    Then return code is "200 OK"
      and request size is "30101 bytes"

  #
  # HEADERS
  #

  Scenario: Result shows correct response headers
    Given request method is "GET"
      and url is "http://localhost:5000/response-headers?X-Custom-Response-Header=testing-header-123"
    When I click on send
      and I wait for request to finish
    Then return code is "200 OK"
      and response contains the following headers
        | key                       | value               |
        | X-Custom-Response-Header  | testing-header-123  |

  Scenario: Adding authorization headers to request authenticates correctly
    Given request method is "GET"
      and url is "http://localhost:5000/basic-auth/testuser123/1qaz2wsx"
      and I open "Headers" section
      and I add Basic Auth header for user "testuser123" with pass "1qaz2wsx"
    When I click on send
      and I wait for request to finish
    Then return code is "200 OK"

#  Scenario: Adding incorrect authorization headers to request fails
#    Given request method is "GET"
#      and url is "http://localhost:5000/basic-auth/testuser321/qwerty"
#      and I open "Headers" section
#      and I add Basic Auth header for user "testuser123" with pass "1qaz2wsx"
#    When I click on send
#      and I wait for request to finish
#    Then return code is "401 Unauthorized"

  Scenario: Adding custom header to request is sent correctly
    Given request method is "GET"
      and url is "http://localhost:5000/get"
      and I open "Headers" section
      and I add the following headers to the request
        | key                       | value               |
        | X-Custom-Request-Header   | testing-header-123  |
        | X-Test-Header             | another-value       |
    When I click on send
      and I wait for request to finish
    Then return code is "200 OK"
      and response body contains the following headers
        | key                       | value               |
        | X-Custom-Request-Header   | testing-header-123  |
        | X-Test-Header             | another-value       |

  #
  # BODY
  #

  Scenario: Adding RAW body sends data in POST request
    Given request method is "POST"
      and url is "http://localhost:5000/post"
      and I open "Body" section
      and a RAW body
        """
        {
          "this": "is",
          "a": "test"
        }
        """
    When I click on send
      and I wait for request to finish
    Then return code is "200 OK"
      and response body contains the following json
        """
        {
          "this": "is",
          "a": "test"
        }
        """

  Scenario: Adding RAW body doesnt sends data in GET request
    Given request method is "GET"
      and url is "http://localhost:5000/get"
      and I open "Body" section
      and a RAW body
        """
        {
          "this": "is",
          "a": "test"
        }
        """
    When I click on send
      and I wait for request to finish
    Then return code is "200 OK"
      and response body doesn't contains json

  Scenario: Adding FORM body sends data in POST request
    Given request method is "POST"
      and url is "http://localhost:5000/post"
      and I open "Body" section
      and a FORM body
        | key        | value           |
        | FormKey1   | FormKey1Value1  |
        | FormKey2   | FormKey1Value2  |
    When I click on send
      and I wait for request to finish
    Then return code is "200 OK"
      and response body contains the following FORM DATA
        | key        | value           |
        | FormKey1   | FormKey1Value1  |
        | FormKey2   | FormKey1Value2  |

  Scenario: Adding FORM body doesn't sends data in GET request
    Given request method is "GET"
      and url is "http://localhost:5000/get"
      and I open "Body" section
      and a FORM body
        | key        | value           |
        | FormKey1   | FormKey1Value1  |
    When I click on send
      and I wait for request to finish
    Then return code is "200 OK"
      and response body doesn't contains FORM DATA
