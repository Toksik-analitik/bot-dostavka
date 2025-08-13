# Telegram Mini App: Food Delivery

This is a sample Telegram Mini App for a food delivery service. It allows users to browse a menu, add items to a cart, and go through a checkout process.

## Features

- Browse menu with categories and items.
- Shopping cart functionality (add, remove, change quantity).
- Checkout process with address and promo code fields.
- Personal cabinet with user info and mock order history.
- Integration with Telegram Web App API (theme, buttons, user data).
- Simulated payment integration with YooKassa.

## Important Note on Payment Integration

The payment integration in this application is a **frontend-only placeholder** and is **not secure for production use**.

When the user clicks "Pay", the app redirects them to a pre-constructed YooKassa payment URL. This is for demonstration purposes only.

**For a real-world application, you MUST:**
1.  Implement a backend server.
2.  Securely store your YooKassa `shopId` and `Secret Key` on the server.
3.  Have the backend create the payment and receive the `confirmation_url` from the YooKassa API.
4.  Pass the `confirmation_url` to the frontend, which then redirects the user.
5.  Use the backend to process [webhooks (HTTP notifications)](https://yookassa.ru/docs/guides/using-webhooks) from YooKassa to confirm that the payment was successful.

The current implementation uses an example wallet ID and will not process real payments.
