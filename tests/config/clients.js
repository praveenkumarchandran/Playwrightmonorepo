/**
 * CLIENT REGISTRY — single source of truth for all 7 clients.
 *
 * Flow step vocabulary:
 *   'landing'    — open URL, select reason, click New Patient
 *   'slotFilter' — select location / reason / provider dropdowns (before slot loads)
 *   'slotPick'   — click a date+time slot, click Continue
 *   'intake'     — symptoms autocomplete + yes/no questions + Continue
 *   'insurance'  — complete insurance form + Continue
 *   'patientInfo'— fill patient details (final step)
 *
 * NOTE: Step ORDER matters. SINY intake comes BEFORE slotPick (unique).
 * All other clients: slotPick comes before intake.
 *
 * TODO items are marked — fill in actual values after verifying in the browser.
 */

// Set SETTER_BASE_URL=https://setter.layline.live to run against production.
// Defaults to staging when not set.
const BASE = (process.env.SETTER_BASE_URL ?? 'https://stage.setter.layline.live').replace(/\/$/, '');

export const CLIENTS = {

    // ── 141 — TNDI ────────────────────────────────────────────────────────────
    TNDI: {
        id: 141,
        name: 'The Nerve and Disc Institute',
        phone: '586-416-3472',  // confirmed from screenshot
        url: `${BASE}/thenerveanddiscinstitute/1/thenerveanddiscinstitutefarmington/landing`,
        newPatientFlow: ['landing', 'slotPick', 'intake', 'insurance', 'patientInfo'],
        existingPatientFlow: ['existingLanding'],
        existingPatient: { firstName: 'Mangaleswari', lastName: 'dev', dob: '07/11/1994' },
        reason: 'Teleconsultation',
        slotType: 'tndi',
        slotFilters: null,
        defaultInsurance: 'Self-pay',
        filterNeedsContinue: false,
    },

    // ── 133 — CLARUS DERM ─────────────────────────────────────────────────────
    CLARUS_DERM: {
        id: 133,
        name: 'Clarus Dermatology',
        phone: '877-408-2431',  // confirmed from screenshot (top-right header)
        url: `${BASE}/clarusdermatology/1/minnetonka/landing`,
        newPatientFlow: ['landing', 'slotFilter', 'slotPick', 'insurance', 'patientInfo'],
        existingPatientFlow: ['existingLanding'],
        existingPatient: { firstName: 'Madhantest', lastName: 'S', dob: '11/11/2002' },
        reason: 'Acne',
        slotType: 'clarus',
        slotFilters: {
            location: 'Minnetonka',
            reason: 'Acne',
            provider: null,
        },
        defaultInsurance: 'Self-pay',
        filterNeedsContinue: false,
    },

    // ── 162 — SINY DERM (Medical) ─────────────────────────────────────────────
    // Flow is unique: INTAKE comes BEFORE slot date/time pick.
    // Landing: two-level reason — first pick "Skin Problem", then pick service type
    //          (e.g. "Acne") from a second dropdown that appears.
    //          Location is pre-filled from the URL slug (bayridge).
    SINY_MEDICAL: {
        id: 162,
        name: 'SINY Dermatology — Medical',
        phone: '718-491-5800',  // confirmed from screenshot
        url: `${BASE}/sinydermatology/1/sinydermatologybayridge/landing`,
        newPatientFlow: ['landing', 'intake', 'slotPick', 'insurance', 'patientInfo'],
        existingPatientFlow: ['existingLanding'],
        existingPatient: { firstName: 'Kyletest0889', lastName: 'Laramoretest0889', dob: '01/08/1987' },
        reason: 'Skin Problem',
        serviceType: 'Acne',             // second-level dropdown that appears after Skin Problem
        landingPopupAction: null,        // no popup for medical flow
        intakeType: 'siny',              // simple optional textarea
        slotType: 'tndi',
        slotFilters: null,          // location auto-set from URL slug
        defaultInsurance: 'Self-pay',
        filterNeedsContinue: false,
    },

    // ── 162 — SINY DERM (Cosmetic) ────────────────────────────────────────────
    // Same URL, different reason — NO insurance step.
    // Landing: two-level selection — Reason="Cosmetic Procedure", then Service Type sub-dropdown.
    //          After clicking New Patient a "Consultation Required" popup appears with two buttons:
    //            "Schedule Procedure" → proceeds to Intake Questions (procedure booking)
    //            "Cosmetic Consultation" → also goes to Intake Questions (consultation path)
    //          We click "Schedule Procedure" to stay in the procedure flow.
    // Stepper: Location(1) → Intake Questions(2) → Choose Date & Time(3) → Add Info(4)
    //
    // NOTE: "Cosmetic Consultation" (no sub-service) shows a different popup:
    //       "Consultation Fee Notice" → single "Continue" button → same intake destination.
    SINY_COSMETIC: {
        id: 162,
        name: 'SINY Dermatology — Cosmetic',
        phone: '718-491-5800',  // same as medical — same clinic
        url: `${BASE}/sinydermatology/1/sinydermatologybayridge/landing`,
        newPatientFlow: ['landing', 'intake', 'slotPick', 'patientInfo'],
        existingPatientFlow: ['existingLanding'],
        existingPatient: { firstName: 'Kyletest0889', lastName: 'Laramoretest0889', dob: '01/08/1987' },
        reason: 'Cosmetic Procedure',
        serviceType: 'Botox treatment',   // sub-service dropdown (appears after Cosmetic Procedure)
        landingPopupAction: 'Schedule Procedure',  // button to click in the post-New-Patient popup
        intakeType: 'siny',               // simple optional textarea
        slotType: 'tndi',
        slotFilters: null,
        defaultInsurance: null,
        filterNeedsContinue: false,
    },

    // ── 134 — HOPEMARK HEALTH ─────────────────────────────────────────────────
    // Flow confirmed: Location → Choose Date & Time → Intake Questions → Add Insurance → Add Info
    // Landing: reason is MUI Select (▼), has New Patient + Existing Patient buttons.
    // Slot: combined date+time buttons (e.g. "Wed Jun 3 4:45 PM") beside provider cards.
    //       "In-Office" has no availability on stage — use "Virtual".
    // Intake: Conditions multi-select checkboxes + "How did you hear about us?" dropdown.
    // Insurance: Self-pay pre-selected, has Skip button.
    HOPEMARK: {
        id: 134,
        name: 'Hopemark Health',
        phone: '630-912-0025',  // confirmed from screenshot
        url: `${BASE}/hopemarkhealth/1/downtown/landing`,
        newPatientFlow:      ['landing', 'slotFilter', 'slotPick', 'intake', 'insurance', 'patientInfo'],
        existingPatientFlow: ['existingLanding'],
        existingPatient: { firstName: 'test', lastName: 'pv155', dob: '02/02/2000' },
        reason: 'Psychiatric Evaluation (Virtual)',
        slotType: 'datetime',       // combined date+time buttons — not separate date/time strips
        intakeType: 'hopemark',     // conditions checkboxes + referral dropdown
        slotFilters: {
            location: null,                                  // pre-filled from URL (/downtown/)
            reason: 'Psychiatric Evaluation (Virtual)',      // must select Virtual — In-Office has no slots
            provider: null,
        },
        defaultInsurance: 'Self-pay',
        filterNeedsContinue: false,
    },

    // ── 160 — FREEDMAN ENT ────────────────────────────────────────────────────
    // Confirmed from screenshots: TNDI-style flat date+time, optional free-text intake,
    // same 5 insurance types, Next+Skip buttons, Location+Address in appointment summary.
    // Only 1 location (Freedman ENT Downriver). URL uses /test/1/ path.
    FREEDMAN: {
        id: 160,
        name: 'Freedman ENT',
        phone: '(734) 479-7310',  // confirmed from screenshot
        url: `${BASE}/test/1/freedmanentdownriver/landing`,
        // Flow confirmed: slot → intake (optional) → insurance → patientInfo
        newPatientFlow: ['landing', 'slotPick', 'intake', 'insurance', 'patientInfo'],
        existingPatientFlow: ['existingLanding'],
        existingPatient: { firstName: 'AmirthamJ', lastName: 'S', dob: '05/05/2026' },
        reason: '15 MIN OFFICE SURGERY',  // confirmed from findappointment screenshot
        intakeType: 'siny',  // optional free-text textarea ("Describe your symptoms or concerns")
        slotType: 'tndi',    // flat date+time layout (same as TNDI)
        slotFilters: null,   // only 1 location, pre-filled from URL slug
        defaultInsurance: 'Self-pay',
        filterNeedsContinue: false,
    },

    // ── 149 — KRONSON VEIN INSTITUTE ──────────────────────────────────────────
    // Flow confirmed from UI: Location → Choose Date & Time → Add Insurance → Add Info
    // NO intake step. Filters (Location + Reason) are pre-filled from the URL — no interaction needed.
    KRONSON: {
        id: 149,
        name: 'Kronson Vein Institute',
        phone: '626-254-2287',  // confirmed from screenshot
        url: `${BASE}/kronsonveininstitute/1/arcadia/landing`,
        newPatientFlow: ['landing', 'slotPick', 'insurance', 'patientInfo'],
        existingPatientFlow: ['existingLanding'],
        existingPatient: { firstName: 'Madhan', lastName: 'Srinivasan', dob: '05/21/2026' },
        reason: 'Vein Consult',
        slotType: 'tndi',
        slotFilters: null,
        defaultInsurance: 'Self-pay',
        filterNeedsContinue: false,
    },

    // ── 124 — CENTER FOR VEIN DISEASE ────────────────────────────────────────
    // Flow: Location(1) → Choose Date & Time(2) → Intake Questions(3) → Add Insurance(4) → Add Info(5)
    // Only "Consult" has available slots (Dr. Sonde). All other reasons show no-availability.
    // Slot style: Clarus-style recentslot cards + Show More. No Provider filter.
    // Intake: optional free-text textarea (same as SINY/Freedman — intakeType: 'siny').
    CVD: {
        id: 124,
        name: 'Center for Vein Disease',
        phone: '301-220-8346',
        url: `${BASE}/centerforveindisease/1/mainoffice/landing`,
        newPatientFlow: ['landing', 'slotFilter', 'slotPick', 'intake', 'insurance', 'patientInfo'],
        existingPatientFlow: ['existingLanding'],
        existingPatient: { firstName: 'TODO', lastName: 'TODO', dob: 'TODO' },
        reason: 'Consult',         // only reason with Dr. Sonde slots in staging
        slotType: 'clarus',        // recentslot- card style + Show More
        intakeType: 'siny',        // optional free-text textarea
        slotFilters: {
            location: 'Main Office',
            reason: 'Consult',
            provider: null,        // no Provider filter on CVD find appointment page
        },
        defaultInsurance: 'Self-pay',
        filterNeedsContinue: false,
    },
};
