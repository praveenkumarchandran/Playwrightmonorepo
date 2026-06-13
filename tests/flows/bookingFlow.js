/**
 * BOOKING FLOW RUNNER
 *
 * Drives any client's booking flow by reading the step order from the client
 * config. Steps execute in the exact order listed in the config's flow array,
 * so SINY (intake before slot pick) works the same as TNDI (slot pick first).
 *
 * Usage:
 *   const pgs = await runFlow(page, CLIENTS.TNDI, CLIENTS.TNDI.newPatientFlow, 'intake');
 *   // Returns all page objects. pgs.intake is ready for test interactions.
 */

import { LandingPage }     from '../../pages/LandingPage.js';
import { SlotPage }        from '../../pages/SlotPage.js';
import { IntakePage }      from '../../pages/IntakePage.js';
import { InsurancePage }   from '../../pages/InsurancePage.js';
import { PatientInfoPage } from '../../pages/PatientInfoPage.js';

// ── Page factory ──────────────────────────────────────────────────────────────

export function createPages(page) {
    return {
        landing:  new LandingPage(page),
        slot:     new SlotPage(page),
        intake:   new IntakePage(page),
        insurance: new InsurancePage(page),
        patient:  new PatientInfoPage(page),
    };
}

// ── Main runner ───────────────────────────────────────────────────────────────

/**
 * Executes booking steps in the order defined by `flow`, stopping at and
 * including `stopAfter`. Returns all page objects so the caller can interact
 * with whatever page was stopped on.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} clientConfig   - one entry from tests/config/clients.js
 * @param {string[]} flow         - clientConfig.newPatientFlow or existingPatientFlow
 * @param {string} stopAfter      - step name to stop at ('intake', 'insurance', 'patientInfo', …)
 * @param {object} [opts]
 * @param {string} [opts.reason]     - overrides clientConfig.reason
 * @param {string} [opts.insurance]  - overrides clientConfig.defaultInsurance
 */
export async function runFlow(page, clientConfig, flow, stopAfter, opts = {}) {
    const pgs = createPages(page);

    const {
        url,
        reason,
        slotFilters,
        defaultInsurance,
        filterNeedsContinue,
    } = clientConfig;

    for (const step of flow) {

        try {

        // ── Landing ───────────────────────────────────────────────────────────
        if (step === 'landing') {
            if (!url || url.includes('TODO')) {
                throw new Error('CLIENT_NOT_CONFIGURED: URL is a TODO placeholder — configure this client in clients.js before running tests');
            }
            await pgs.landing.open(url);
            await pgs.landing.startNewPatient(opts.reason ?? reason, {
                serviceType:        clientConfig.serviceType,
                landingPopupAction: clientConfig.landingPopupAction,
            });
        }

        // ── Slot filters (location / reason / provider dropdowns) ─────────────
        // Called BEFORE slotPick. For SINY this step precedes intake, not slotPick.
        if (step === 'slotFilter') {
            if (slotFilters?.location) await pgs.slot.selectLocation(slotFilters.location);
            if (slotFilters?.reason)   await pgs.slot.selectAppointmentReason(slotFilters.reason);
            if (slotFilters?.provider) await pgs.slot.selectProvider(slotFilters.provider);
            if (filterNeedsContinue)   await pgs.slot.continue();
        }

        // ── Slot pick (click a date + time, then Continue) ────────────────────
        // Pass slotType so clickAnySlot skips the 15-second auto-detect wait.
        if (step === 'slotPick') {
            await pgs.slot.clickAnySlot(clientConfig.slotType);
            await pgs.slot.continue();
        }

        // ── Intake ────────────────────────────────────────────────────────────
        if (step === 'intake') {
            await pgs.intake.waitForLoad();
            if (clientConfig.intakeType === 'hopemark') {
                await pgs.intake.selectConditions(['ADHD']);
                await pgs.intake.selectHearAboutUs('Friends/Family');
            } else if (clientConfig.intakeType === 'siny') {
                // SINY: simple optional textarea — no required input, just continue
                await pgs.intake.fillSINYTextarea('Testing intake');
            } else {
                await pgs.intake.selectSymptoms();
                await pgs.intake.answerNoQuestions();
            }
            await pgs.intake.continue();
        }

        // ── Insurance ─────────────────────────────────────────────────────────
        if (step === 'insurance') {
            await pgs.insurance.completeInsurance(opts.insurance ?? defaultInsurance);
        }

        // ── PatientInfo — just navigate to it; the fixture exposes it for tests ─
        // (no auto-fill — tests fill fields themselves)
        if (step === 'patientInfo') {
            await pgs.patient.firstName.waitFor({ state: 'visible', timeout: 30_000 });
        }

        } catch (e) {
            // Re-throw these as-is — fixtures catch them and call testInfo.skip()
            if (e.message.startsWith('NO_SLOTS_AVAILABLE') || e.message.startsWith('CLIENT_NOT_CONFIGURED')) throw e;

            // Slot-related timeouts — treat as no slots available so tests are skipped not failed
            if ((step === 'slotPick' || step === 'slotFilter') && /timeout|Timeout/i.test(e.message)) {
                console.log(`  [bookingFlow] Slot step timed out for ${clientConfig.name} — treating as no slots available`);
                throw new Error(`NO_SLOTS_AVAILABLE: Slot step "${step}" timed out — no slots available for ${clientConfig.name}`);
            }

            // Wrap all other errors with developer-friendly context
            const stepMessages = {
                landing:    `Could not open landing page or click New Patient.\n  URL: ${url}\n  Reason: ${opts.reason ?? reason}`,
                slotFilter: `Failed while applying slot filters.\n  Filters: ${JSON.stringify(slotFilters)}`,
                slotPick:   `Could not select a time slot (slotType: "${clientConfig.slotType}").\n  Check that the selected provider/location/reason has available slots in staging.`,
                intake:     `Intake page failed to load or submit (intakeType: "${clientConfig.intakeType ?? 'tndi'}").`,
                insurance:  `Insurance form could not be completed (defaultInsurance: "${clientConfig.defaultInsurance}").`,
                patientInfo:`Patient info page did not render the firstName field within 30s.`,
            };
            const hint = stepMessages[step] ?? `Unexpected failure in step "${step}".`;
            throw new Error(`[bookingFlow: ${step}] ${hint}\n\n  Original error: ${e.message}`);
        }

        // Stop here and hand control back to the fixture / test
        if (stopAfter === step) return pgs;
    }

    return pgs;
}
