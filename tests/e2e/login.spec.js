// import { test } from '@playwright/test';
// import { LoginPage } from '../../pages/LoginPage';

// test('user can login successfully', async ({ page }) => {
//     const login = new LoginPage(page);

//     await login.open();
//     await login.login('test@example.com', 'password123');
//     await login.verifyLoginSuccess();
// });



import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test('user can login', async ({ page }) => {
    const login = new LoginPage(page);

    await login.open();
    await login.login('test@example.com', '123456');
    await login.verifyLoginSuccess();
});