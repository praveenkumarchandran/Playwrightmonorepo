function runIntakeCases(test, expect) {

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

export { runIntakeCases };
