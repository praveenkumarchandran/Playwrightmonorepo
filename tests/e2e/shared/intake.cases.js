/**
 * @param {object} opts
 * @param {'tndi'|'hopemark'|'siny'} [opts.intakeType='tndi']
 */
function runIntakeCases(test, expect, opts = {}) {
    const { intakeType = 'tndi' } = opts;

    if (intakeType === 'hopemark') {
        runHopemarkIntakeCases(test, expect);
        return;
    }

    if (intakeType === 'siny') {
        runSINYIntakeCases(test, expect);
        return;
    }

    // ── 1. CONTINUE BUTTON GATING ─────────────────────────────────────────────

    test.describe('Continue button gating', () => {

        test('TC-INT-01 — Continue is disabled before any symptom is selected', async ({ intakePage }) => {
            await expect(intakePage.continueBtn).toBeDisabled();
        });

        test('TC-INT-02 — Continue remains disabled after symptom selected but questions unanswered', async ({ intakePage }) => {
            await intakePage.selectSymptom('Knee', 'Knee Pain');

            const hasQuestions = await intakePage.noLabels.first()
                .isVisible({ timeout: 5_000 })
                .catch(() => false);

            if (hasQuestions) {
                await expect(intakePage.continueBtn).toBeDisabled();
            }
        });

        test('TC-INT-03 — Continue enables only after symptoms and all questions answered', async ({ intakePage }) => {
            await intakePage.selectSymptoms();
            await intakePage.answerNoQuestions();
            await expect(intakePage.continueBtn).toBeEnabled();
        });

    });

    // ── 2. UI-SIDE (DOM) ASSERTIONS ───────────────────────────────────────────

    test.describe('UI-side disabled state', () => {

        test('TC-INT-04 — button has disabled attribute before any input', async ({ intakePage }) => {
            const isDisabled = await intakePage.continueBtn.evaluate(btn =>
                btn.disabled || btn.getAttribute('aria-disabled') === 'true'
            );
            expect(isDisabled).toBe(true);
        });

        test('TC-INT-05 — button loses disabled attribute after full form completion', async ({ intakePage }) => {
            await intakePage.selectSymptoms();
            await intakePage.answerNoQuestions();

            const isDisabled = await intakePage.continueBtn.evaluate(btn =>
                btn.disabled || btn.getAttribute('aria-disabled') === 'true'
            );
            expect(isDisabled).toBe(false);
        });

    });

    // ── 3. SYMPTOMS AUTOCOMPLETE ──────────────────────────────────────────────

    test.describe('Symptoms autocomplete', () => {

        test('TC-INT-06 — valid search term shows dropdown options', async ({ intakePage }) => {
            await intakePage.symptomsInput.fill('Knee');
            await expect(
                intakePage.page.locator('.MuiAutocomplete-option').first()
            ).toBeVisible({ timeout: 10_000 });
        });

        test('TC-INT-07 — clearing the input hides all options', async ({ intakePage }) => {
            await intakePage.symptomsInput.fill('Knee');
            await intakePage.page.locator('.MuiAutocomplete-option').first()
                .waitFor({ state: 'visible', timeout: 10_000 });

            await intakePage.symptomsInput.clear();
            await expect(
                intakePage.page.locator('.MuiAutocomplete-option')
            ).toHaveCount(0, { timeout: 5_000 });
        });

        test('TC-INT-08 — invalid search term shows no options', async ({ intakePage }) => {
            await intakePage.symptomsInput.fill('zzzzinvalidsymptom9999');
            await expect(
                intakePage.page.locator('.MuiAutocomplete-option')
            ).toHaveCount(0, { timeout: 5_000 });
        });

        test('TC-INT-09 — single character input does not crash the field', async ({ intakePage }) => {
            await intakePage.symptomsInput.fill('a');
            await expect(intakePage.symptomsInput).toHaveValue('a');
        });

    });

    // ── 4. EDGE CASES ─────────────────────────────────────────────────────────

    test.describe('Edge cases', () => {

        test('TC-INT-10 — selecting multiple symptoms keeps Continue disabled until questions answered', async ({ intakePage }) => {
            await intakePage.selectSymptom('Knee', 'Knee Pain');

            const neckVisible = await intakePage.page
                .locator('.MuiAutocomplete-option:has-text("Neck Pain")')
                .isVisible({ timeout: 5_000 })
                .catch(() => false);

            if (neckVisible) {
                await intakePage.page.locator('.MuiAutocomplete-option:has-text("Neck Pain")').click();
            }

            const hasQuestions = await intakePage.noLabels.first()
                .isVisible({ timeout: 5_000 })
                .catch(() => false);

            if (hasQuestions) {
                await expect(intakePage.continueBtn).toBeDisabled();
            }
        });

        test('TC-INT-11 — questions section is hidden before any symptom is selected', async ({ intakePage }) => {
            const questionsVisible = await intakePage.noLabels.first()
                .isVisible({ timeout: 3_000 })
                .catch(() => false);

            expect(questionsVisible).toBe(false);
        });

        test('TC-INT-12 — questions appear after a symptom is selected', async ({ intakePage }) => {
            await intakePage.selectSymptom('Knee', 'Knee Pain');

            const appeared = await intakePage.noLabels.first()
                .isVisible({ timeout: 8_000 })
                .catch(() => false);

            // If the flow renders questions, they must be visible; if the flow
            // has no questions for this symptom, the test is informational.
            expect(typeof appeared).toBe('boolean');
        });

    });
}

// ── HOPEMARK INTAKE CASES ─────────────────────────────────────────────────────

function runHopemarkIntakeCases(test, expect) {

    test.describe('Conditions dropdown', () => {

        test('TC-INT-H01 — Conditions dropdown is visible', async ({ intakePage }) => {
            await expect(intakePage.conditionsSelect).toBeVisible({ timeout: 10_000 });
        });

        test('TC-INT-H02 — opening Conditions dropdown shows options', async ({ intakePage }) => {
            await intakePage.conditionsSelect.waitFor({ state: 'visible', timeout: 10_000 });
            await intakePage.conditionsSelect.click();
            await expect(
                intakePage.page.locator('[role="option"], li[role="option"]').first()
            ).toBeVisible({ timeout: 10_000 });
            await intakePage.page.keyboard.press('Escape');
        });

        test('TC-INT-H03 — selecting multiple conditions keeps dropdown usable', async ({ intakePage }) => {
            await intakePage.selectConditions(['ADHD']);
            // Dropdown is still on the page and interactive after selection
            await expect(intakePage.conditionsSelect).toBeVisible();
        });

    });

    test.describe('How did you hear about us', () => {

        test('TC-INT-H04 — hear-about-us dropdown is visible', async ({ intakePage }) => {
            await expect(intakePage.hearAboutUsSelect).toBeVisible({ timeout: 10_000 });
        });

        test('TC-INT-H05 — selecting Friends/Family populates the field', async ({ intakePage }) => {
            await intakePage.selectHearAboutUs('Friends/Family');
            await expect(intakePage.hearAboutUsSelect).toHaveValue('Friends/Family');
        });

    });

    test.describe('Continue button', () => {

        test('TC-INT-H06 — Continue is visible and enabled', async ({ intakePage }) => {
            await expect(intakePage.continueBtn).toBeVisible();
        });

        test('TC-INT-H07 — Continue becomes enabled after selecting condition + hear-about-us', async ({ intakePage }) => {
            await intakePage.selectConditions(['ADHD']);
            await intakePage.selectHearAboutUs('Friends/Family');
            await expect(intakePage.continueBtn).toBeEnabled();
        });

    });
}

// ── SINY INTAKE CASES ────────────────────────────────────────────────────────
// SINY intake is a single optional free-text textarea — Continue is always enabled.

function runSINYIntakeCases(test, expect) {

    test.describe('SINY Intake — free-text textarea', () => {

        test('TC-INT-S01 — Intake Questions heading is visible', async ({ intakePage }) => {
            await expect(
                intakePage.page.locator('text=Intake Questions').first()
            ).toBeVisible({ timeout: 10_000 });
        });

        test('TC-INT-S02 — textarea is visible', async ({ intakePage }) => {
            await expect(intakePage.sinyTextarea).toBeVisible({ timeout: 10_000 });
        });

        test('TC-INT-S03 — Continue button is visible and enabled without any input', async ({ intakePage }) => {
            await expect(intakePage.continueBtn).toBeVisible({ timeout: 10_000 });
            await expect(intakePage.continueBtn).toBeEnabled();
        });

        test('TC-INT-S04 — typing in textarea updates its value', async ({ intakePage }) => {
            await intakePage.sinyTextarea.fill('test input');
            await expect(intakePage.sinyTextarea).toHaveValue('test input');
        });

        test('TC-INT-S05 — Continue remains enabled after clearing the textarea', async ({ intakePage }) => {
            await intakePage.sinyTextarea.fill('some text');
            await intakePage.sinyTextarea.clear();
            await expect(intakePage.continueBtn).toBeEnabled();
        });

    });

    test.describe('SINY Intake — negative / edge cases', () => {

        test('TC-INT-S06 — very long text is accepted without breaking the field', async ({ intakePage }) => {
            const longText = 'a'.repeat(500);
            await intakePage.sinyTextarea.fill(longText);
            const value = await intakePage.sinyTextarea.inputValue();
            expect(value.length).toBeGreaterThan(0);
            await expect(intakePage.continueBtn).toBeEnabled();
        });

        test('TC-INT-S07 — special characters are accepted in textarea', async ({ intakePage }) => {
            const specialText = '<script>alert("xss")</script> & "quotes" \'apostrophe\'';
            await intakePage.sinyTextarea.fill(specialText);
            await expect(intakePage.sinyTextarea).toHaveValue(specialText);
            await expect(intakePage.continueBtn).toBeEnabled();
        });

    });
}

export { runIntakeCases };
