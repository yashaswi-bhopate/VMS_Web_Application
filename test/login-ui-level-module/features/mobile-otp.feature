Feature: Mobile number and OTP verification
  As a VMS user
  I want my mobile number verified with an OTP
  So that I can securely access the VMS dashboard

  @mobile-otp-smoke
  Scenario: Empty mobile number keeps Continue disabled
    Given the mobile login screen is open
    Then the configured country code is displayed
    And Continue is disabled

  @mobile-otp-smoke
  Scenario: Incomplete mobile number keeps Continue disabled
    Given the mobile login screen is open
    When I enter an incomplete mobile test number
    Then Continue is disabled

  @mobile-otp-field-check
  Scenario Outline: Non-digit mobile input is rejected
    Given the mobile login screen is open
    When I attempt to enter mobile number "<input>"
    Then Continue is disabled

    Examples:
      | input  |
      | abc123 |
      | @#$    |

  @mobile-otp-mobile-boundary
  Scenario: Overlength mobile number is limited to ten digits
    Given the mobile login screen is open
    When I enter an overlength mobile test number
    Then the mobile number field contains exactly 10 digits
    And Continue is enabled

  @mobile-otp-field-check
  Scenario: Clearing a valid number empties the mobile field
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I clear the mobile number
    Then the mobile number field contains no digits
    And Continue is disabled

  @mobile-otp-field-check
  Scenario: Mobile number field opens the keyboard for entry
    Given the mobile login screen is open
    When I focus the mobile number field
    Then the keyboard for entry is displayed

  @mobile-otp-smoke
  Scenario: Valid mobile number opens OTP verification
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I tap Continue
    Then the OTP verification screen is displayed

  Scenario: OTP fields start empty
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I tap Continue
    Then all OTP digit fields are empty

  Scenario: OTP screen shows a resend countdown
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I tap Continue
    Then the OTP resend countdown is displayed

  @mobile-otp-policy-check
  Scenario: Resend becomes available after the countdown and restarts it
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I tap Continue
    Then the OTP resend countdown is displayed
    When I wait until the resend countdown expires
    Then the resend control is enabled
    When I tap resend code
    Then the OTP resend countdown is displayed

  Scenario: Empty OTP keeps Verify disabled
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I tap Continue
    Then all OTP digit fields are empty
    And OTP Verify is disabled

  @mobile-otp-boundary
  Scenario: OTP entry accepts a six-digit code and ignores extra input
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I tap Continue
    And I enter OTP digits "1234567"
    Then exactly six OTP digits are displayed
    And OTP Verify is enabled

  @mobile-otp-policy-check
  Scenario: Verify accepts five OTP digits but does not grant dashboard access
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I tap Continue
    And I enter a partial OTP
    Then OTP Verify is enabled
    And I tap OTP Verify
    Then the OTP verification screen remains displayed
    And the VMS dashboard is not displayed

  @mobile-otp-smoke
  Scenario: Incorrect OTP does not grant dashboard access
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I tap Continue
    And I submit an incorrect OTP
    Then the invalid OTP message is displayed
    And the OTP verification screen remains displayed
    And the VMS dashboard is not displayed

  @mobile-otp-policy-check
  Scenario: Repeated incorrect OTP attempts do not grant dashboard access
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I tap Continue
    And I submit the incorrect OTP three times
    Then the invalid OTP message is displayed
    And the OTP verification screen remains displayed
    And the VMS dashboard is not displayed

  Scenario: OTP back control returns to mobile login
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I tap Continue
    And I tap the OTP back control
    Then the mobile login screen is displayed

  @mobile-otp-smoke
  Scenario: Valid OTP opens the VMS dashboard
    Given the mobile login screen is open
    When I enter the valid mobile test number
    And I tap Continue
    Then the OTP verification screen is displayed
    When I submit the configured OTP
    Then the VMS dashboard is displayed