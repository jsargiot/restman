Feature: Request Sharing

  @WIP
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
