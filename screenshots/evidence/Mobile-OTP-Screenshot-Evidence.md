# Mobile OTP Screenshot Evidence

**Run:** Android full run, 2026-10-21  
**Result:** 18 scenario executions, 88 steps passed, 0 failed, 0 skipped  
**Scenario definitions:** 17; the non-digit outline executes twice.

Each section shows one original screenshot from the passing run. In VS Code, open this Markdown file and choose **Open Preview** (`Ctrl+Shift+V`) to see the screenshots inline.

## 01. Empty mobile number keeps Continue disabled

Confirms the country code is shown and Continue is disabled when no mobile number is entered.

![Empty mobile number keeps Continue disabled](../mobile-otp/Empty-mobile-number-keeps-Continue-disabled--Continue-is-disabled--2026-10-21T09-05-12-542Z.png)

## 02. Incomplete mobile number keeps Continue disabled

Enters fewer than ten digits and confirms Continue remains disabled.

![Incomplete mobile number keeps Continue disabled](../mobile-otp/Incomplete-mobile-number-keeps-Continue-disabled--Continue-is-disabled--2026-10-21T09-05-27-756Z.png)

## 03. Non-digit mobile input: abc123

Attempts mixed alphanumeric input and confirms Continue stays disabled.

![Non-digit mobile input abc123](../mobile-otp/Non-digit-mobile-input-is-rejected--Continue-is-disabled--2026-10-21T09-05-37-719Z.png)

## 04. Non-digit mobile input: @#$

Attempts symbol input and confirms Continue stays disabled.

![Non-digit mobile input symbols](../mobile-otp/Non-digit-mobile-input-is-rejected--Continue-is-disabled--2026-10-21T09-05-47-432Z.png)

## 05. Overlength number is limited to ten digits

Enters eleven digits, verifies exactly ten are visible, and confirms Continue is enabled.

![Overlength mobile number is limited to ten digits](../mobile-otp/Overlength-mobile-number-is-limited-to-ten-digits--Continue-is-enabled--2026-10-21T09-06-04-382Z.png)

## 06. Clearing a valid number empties the field

Clears the entered number, verifies no digits remain visible, and confirms Continue is disabled.

![Cleared mobile number field](../mobile-otp/Clearing-a-valid-number-empties-the-mobile-field--Continue-is-disabled--2026-10-21T09-06-29-967Z.png)

## 07. Mobile number field opens the keyboard

Confirms focusing the mobile field opens the Android keyboard.

![Mobile number keyboard](../mobile-otp/Mobile-number-field-opens-the-keyboard-for-entry--the-keyboard-for-entry-is-displayed--2026-10-21T09-06-36-679Z.png)

## 08. Valid mobile number opens OTP verification

Confirms a valid mobile number opens the OTP screen.

![Valid mobile number opens OTP verification](../mobile-otp/Valid-mobile-number-opens-OTP-verification--the-OTP-verification-screen-is-displayed--2026-10-21T09-06-53-667Z.png)

## 09. OTP fields start empty

Confirms all six OTP fields are empty on initial display.

![OTP fields start empty](../mobile-otp/OTP-fields-start-empty--all-OTP-digit-fields-are-empty--2026-10-21T09-07-10-467Z.png)

## 10. OTP screen shows a resend countdown

Confirms the OTP resend countdown is visible.

![OTP resend countdown](../mobile-otp/OTP-screen-shows-a-resend-countdown--the-OTP-resend-countdown-is-displayed--2026-10-21T09-07-29-399Z.png)

## 11. Resend becomes available and restarts the countdown

Waits for the cooldown, taps enabled Resend OTP, and confirms a fresh countdown appears.

![Resend countdown restarts](../mobile-otp/Resend-becomes-available-after-the-countdown-and-restarts-it--the-OTP-resend-countdown-is-displayed--2026-10-21T09-08-48-669Z.png)

## 12. Empty OTP keeps Verify disabled

Confirms Verify remains disabled while all OTP fields are empty.

![Empty OTP keeps Verify disabled](../mobile-otp/Empty-OTP-keeps-Verify-disabled--OTP-Verify-is-disabled--2026-10-21T09-09-05-521Z.png)

## 13. Six OTP digits are retained; extra input is ignored

Enters seven digits and verifies that only six remain visible and Verify is enabled.

![Six OTP digits retained](../mobile-otp/OTP-entry-accepts-a-six-digit-code-and-ignores-extra-input--OTP-Verify-is-enabled--2026-10-21T09-09-31-786Z.png)

## 14. Verify accepts five digits but does not grant dashboard access

Records observed behavior: Verify enables with five digits, but the dashboard does not open.

![Five OTP digits do not grant dashboard access](../mobile-otp/Verify-accepts-five-OTP-digits-but-does-not-grant-dashboard-access--the-VMS-dashboard-is-not-displayed--2026-10-21T09-10-00-760Z.png)

## 15. Incorrect OTP does not grant dashboard access

Submits one incorrect code and verifies invalid-code feedback and no dashboard access.

![Incorrect OTP rejected](../mobile-otp/Incorrect-OTP-does-not-grant-dashboard-access--the-VMS-dashboard-is-not-displayed--2026-10-21T09-10-28-267Z.png)

## 16. Repeated incorrect OTP attempts do not grant dashboard access

Submits an incorrect OTP three times and verifies rejection and no dashboard access.

![Repeated incorrect OTP rejected](../mobile-otp/Repeated-incorrect-OTP-attempts-do-not-grant-dashboard-access--the-VMS-dashboard-is-not-displayed--2026-10-21T09-11-14-084Z.png)

## 17. OTP back control returns to mobile login

Confirms the OTP back control returns to the mobile login screen.

![OTP back control returns to login](../mobile-otp/OTP-back-control-returns-to-mobile-login--the-mobile-login-screen-is-displayed--2026-10-21T09-11-31-842Z.png)

## 18. Valid OTP opens the VMS dashboard

Submits the configured OTP and confirms dashboard access.

![Valid OTP opens dashboard](../mobile-otp/Valid-OTP-opens-the-VMS-dashboard--the-VMS-dashboard-is-displayed--2026-10-21T09-11-56-088Z.png)

## Notes

- The resend cooldown is tested; OTP validity expiry is not established by this test.
- Three incorrect submissions are tested for rejection; no lockout threshold is asserted.
- Verify enabling with five digits is observed behavior and needs product confirmation.
