Feature: VMS login
  As a VMS user
  I want to sign in with my mobile number and OTP
  So that I can access the VMS dashboard

  Scenario: Display the login form with Continue disabled
    Given the VMS login screen is open
    Then the login page controls are visible
    And the country code is "+91"
    And Continue is disabled

  Scenario: A valid mobile number opens OTP verification
    Given the VMS login screen is open
    When I enter mobile number "9403350898"
    And I tap Continue
    Then the OTP verification screen is displayed

  Scenario: A valid OTP opens the dashboard
    Given the VMS login screen is open
    When I enter mobile number "9403350898"
    And I tap Continue
    Then the OTP verification screen is displayed
    When I submit the configured OTP
    Then the VMS dashboard is displayed