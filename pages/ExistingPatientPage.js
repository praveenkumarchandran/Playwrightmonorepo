export class ExistingPatientPage {
    constructor(page) {
        this.page = page;
        // MUI floating-label inputs — matched via aria label, not placeholder
        this.firstNameInput = page.getByLabel('First Name');
        this.lastNameInput  = page.getByLabel('Last Name');
        this.dobInput       = page.getByLabel('Date of Birth');
        this.findBtn        = page.locator('button:has-text("Find Appointment")');
        // "New Patient" link/button on the identity page — lets the user switch to new patient flow
        this.newPatientBtn  = page.locator('button:has-text("New Patient")');
        // Inline field-level validation errors shown when submitting empty fields
        this.validationError = page.locator(':text-matches("to proceed", "i")');
    }

    async waitForLoad() {
        await this.firstNameInput.waitFor({ state: 'visible' });
    }

    async fill(firstName, lastName, dob) {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        // DOB may be a MUI date picker — click first to focus, then fill
        await this.dobInput.click();
        await this.dobInput.fill(dob);
    }

    async findAppointment() {
        await this.findBtn.waitFor({ state: 'visible' });
        await this.findBtn.click();
        await this.page.waitForLoadState('networkidle');
    }

    async search(firstName, lastName, dob) {
        await this.waitForLoad();
        await this.fill(firstName, lastName, dob);
        await this.findAppointment();
    }
}
