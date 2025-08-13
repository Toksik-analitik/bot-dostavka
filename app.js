/**
 * Main application logic for the Telegram Mini App Food Delivery Service.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the Telegram Web App SDK
    const tg = window.Telegram.WebApp;
    tg.ready();

    // --- STATE MANAGEMENT ---
    const app = document.getElementById('app');
    let cart = {}; // Stores cart items as { itemId: quantity }
    let menuData = null; // Caches the menu data once fetched
    let currentView = 'menu'; // Manages the current screen: 'menu', 'cart', 'checkout', 'profile'
    let discountPercent = 0; // Stores the current discount percentage

    // --- HELPER FUNCTIONS ---

    /**
     * Finds a menu item by its ID from the cached menuData.
     * @param {string} itemId - The ID of the item to find.
     * @returns {object|null} The item object or null if not found.
     */
    const findItemById = (itemId) => {
        for (const category of menuData.categories) {
            const found = category.items.find(item => item.id === itemId);
            if (found) return found;
        }
        return null;
    };

    /**
     * Calculates the total price of the cart, including discounts.
     * @returns {object} An object with original, discount, and final prices.
     */
    const calculateTotal = () => {
        let total = Object.keys(cart).reduce((sum, itemId) => {
            const item = findItemById(itemId);
            return sum + (item ? item.price * cart[itemId] : 0);
        }, 0);

        let discountAmount = total * (discountPercent / 100);
        return {
            original: total,
            discount: discountAmount,
            final: total - discountAmount,
        };
    };

    // --- CART LOGIC ---

    /**
     * Adds an item to the cart or increments its quantity.
     * @param {string} itemId - The ID of the item to add.
     */
    const addToCart = (itemId) => {
        cart[itemId] = (cart[itemId] || 0) + 1;
        tg.HapticFeedback.impactOccurred('light');
        updateMainButton();
    };

    /**
     * Changes the quantity of an item in the cart. Removes the item if quantity reaches zero.
     * @param {string} itemId - The ID of the item to change.
     * @param {number} delta - The change in quantity (+1 or -1).
     */
    const changeCartQuantity = (itemId, delta) => {
        const newQuantity = (cart[itemId] || 0) + delta;
        if (newQuantity <= 0) {
            delete cart[itemId];
        } else {
            cart[itemId] = newQuantity;
        }
        renderView();
        updateMainButton();
    }

    // --- RENDERING LOGIC ---

    /**
     * Renders the main menu view.
     */
    const renderMenu = () => {
        app.innerHTML = `
            <div class="main-header">
                <h1>Наше Меню</h1>
                <button class="profile-btn">Кабинет</button>
            </div>
        `;
        menuData.categories.forEach(category => {
            app.innerHTML += `<h2 class="category-title">${category.name}</h2>`;
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'menu-items';
            category.items.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-description">${item.description}</div>
                        <div class="item-price">${item.price} ₽</div>
                    </div>
                    <button class="add-to-cart-btn" data-item-id="${item.id}">В корзину</button>
                `;
                itemsContainer.appendChild(menuItem);
            });
            app.appendChild(itemsContainer);
        });
    };

    /**
     * Renders the shopping cart view.
     */
    const renderCart = () => {
        app.innerHTML = '<h1>Корзина</h1>';
        if (Object.keys(cart).length === 0) {
            app.innerHTML += '<p>Ваша корзина пуста.</p>';
            return;
        }

        for (const itemId in cart) {
            const item = findItemById(itemId);
            const quantity = cart[itemId];
            if (item) {
                app.innerHTML += `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${quantity} x ${item.price} ₽</div>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" data-item-id="${item.id}" data-delta="-1">-</button>
                            <span class="cart-item-quantity">${quantity}</span>
                            <button class="quantity-btn" data-item-id="${item.id}" data-delta="1">+</button>
                        </div>
                    </div>`;
            }
        }
        const total = calculateTotal();
        app.innerHTML += `<div class="cart-total">Итого: ${total.final.toFixed(2)} ₽</div>`;
    };

    /**
     * Renders the checkout form view.
     */
    const renderCheckout = () => {
        app.innerHTML = '<h1>Оформление заказа</h1>';
        const userName = tg.initDataUnsafe.user?.first_name || 'Клиент';
        const form = document.createElement('div');
        form.className = 'checkout-form';
        form.innerHTML = `
            <div class="form-group">
                <label for="name">Ваше имя</label>
                <input type="text" id="name" value="${userName}" placeholder="Имя">
            </div>
            <div class="form-group">
                <label for="address">Адрес доставки</label>
                <textarea id="address" rows="3" placeholder="Город, улица, дом, квартира"></textarea>
            </div>
            <div class="form-group">
                <label for="comment">Комментарий к заказу</label>
                <input type="text" id="comment" placeholder="Например, код домофона">
            </div>
            <div class="promo-section">
                <input type="text" id="promo-code" placeholder="Промокод">
                <button class="promo-btn">Применить</button>
            </div>
            <div id="discount-info" class="discount-info"></div>
            <div id="checkout-total" class="cart-total"></div>
        `;
        app.appendChild(form);
        updateCheckoutTotal();
    };

    /**
     * Renders the user's profile page with mock order history.
     */
    const renderProfile = () => {
        const user = tg.initDataUnsafe.user;
        // MOCK DATA: In a real app, this would be fetched from a backend.
        const mockOrderHistory = [
            { id: '#12345', date: '08.10.2025', items: [{ name: 'Пепперони', qty: 1, price: 550 }, { name: 'Кола', qty: 2, price: 100 }], total: 750 }
        ];

        let historyHtml = '';
        if (mockOrderHistory.length === 0) {
            historyHtml = '<p>История заказов пока пуста. Сделайте свой первый заказ!</p>';
        } else {
            mockOrderHistory.forEach(order => {
                const itemsHtml = order.items.map(item => `<li><span>${item.name} (${item.qty})</span><span>${item.qty * item.price} ₽</span></li>`).join('');
                historyHtml += `
                    <div class="order-card">
                        <div class="order-card-header">
                            <span class="order-id">${order.id}</span>
                            <span class="order-date">${order.date}</span>
                        </div>
                        <div class="order-card-body"><ul>${itemsHtml}</ul></div>
                        <div class="order-card-footer">Итого: ${order.total} ₽</div>
                    </div>
                `;
            });
        }

        app.innerHTML = `
            <div class="profile-page">
                <div class="user-info">
                    <h2>${user?.first_name || 'Пользователь'} ${user?.last_name || ''}</h2>
                    <p>@${user?.username || 'username'}</p>
                </div>
                <div class="order-history">
                    <h3>История заказов</h3>
                    ${historyHtml}
                </div>
            </div>
        `;
    };

    /**
     * Updates the total price displayed on the checkout page.
     */
    const updateCheckoutTotal = () => {
        const total = calculateTotal();
        const totalEl = document.getElementById('checkout-total');
        const discountInfoEl = document.getElementById('discount-info');

        if (totalEl) {
            totalEl.textContent = `Итого к оплате: ${total.final.toFixed(2)} ₽`;
        }
        if (discountInfoEl) {
            discountInfoEl.textContent = total.discount > 0 ? `Скидка: ${total.discount.toFixed(2)} ₽` : '';
        }
        updateMainButton();
    };

    /**
     * Main render function that switches between views based on `currentView`.
     */
    const renderView = () => {
        if (currentView === 'menu') renderMenu();
        else if (currentView === 'cart') renderCart();
        else if (currentView === 'checkout') renderCheckout();
        else if (currentView === 'profile') renderProfile();
    };

    // --- TELEGRAM UI LOGIC ---

    /**
     * Updates the state and text of the Telegram Main Button based on the current view and cart state.
     */
    const updateMainButton = () => {
        if (currentView === 'profile') {
            tg.MainButton.hide();
            return;
        }

        const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);
        if (totalItems === 0) {
            tg.MainButton.hide();
            tg.isClosingConfirmationEnabled = false;
            return;
        }

        tg.isClosingConfirmationEnabled = true;

        if (currentView === 'menu') {
            const total = calculateTotal();
            tg.MainButton.setText(`Корзина (${totalItems}) - ${total.final.toFixed(2)} ₽`);
            tg.MainButton.show();
        } else if (currentView === 'cart') {
            const total = calculateTotal();
            tg.MainButton.setText(`Оформить заказ на ${total.final.toFixed(2)} ₽`);
            tg.MainButton.show();
        } else if (currentView === 'checkout') {
            const total = calculateTotal();
            tg.MainButton.setText(`Оплатить ${total.final.toFixed(2)} ₽`);
            tg.MainButton.show();
        }
    };

    /**
     * Applies a hardcoded promo code.
     */
    const applyPromoCode = () => {
        const promoInput = document.getElementById('promo-code');
        if (promoInput.value.toUpperCase() === 'SALE10') {
            discountPercent = 10;
            tg.HapticFeedback.notificationOccurred('success');
        } else {
            discountPercent = 0;
            tg.HapticFeedback.notificationOccurred('error');
        }
        updateCheckoutTotal();
    };

    // --- EVENT LISTENERS ---

    /**
     * Global click listener using event delegation to handle all button clicks.
     */
    app.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('add-to-cart-btn')) {
            addToCart(target.dataset.itemId);
        } else if (target.classList.contains('quantity-btn')) {
            changeCartQuantity(target.dataset.itemId, parseInt(target.dataset.delta, 10));
        } else if (target.classList.contains('promo-btn')) {
            applyPromoCode();
        } else if (target.classList.contains('profile-btn')) {
            currentView = 'profile';
            renderView();
            updateMainButton();
            tg.BackButton.show();
        }
    });

    /**
     * Handler for the Telegram Main Button, controlling the checkout flow.
     */
    tg.MainButton.onClick(() => {
        if (currentView === 'menu') {
            currentView = 'cart';
            tg.BackButton.show();
        } else if (currentView === 'cart') {
            currentView = 'checkout';
        } else if (currentView === 'checkout') {
            const name = document.getElementById('name').value;
            const address = document.getElementById('address').value;
            if (!name.trim() || !address.trim()) {
                tg.showAlert('Пожалуйста, заполните имя и адрес доставки.');
                return;
            }

            const total = calculateTotal();
            const orderId = `order-${Date.now()}`;

            // NOTE: This is a placeholder for a real payment integration.
            // In a real application, you would make a call to your backend here to get a confirmation_url.
            const paymentUrl = new URL('https://yookassa.ru/payment/quickpay/confirm');
            paymentUrl.searchParams.set('receiver', '4100118362309214'); // Example wallet
            paymentUrl.searchParams.set('quickpay-form', 'shop');
            paymentUrl.searchParams.set('targets', `Оплата заказа №${orderId}`);
            paymentUrl.searchParams.set('sum', total.final.toFixed(2));
            paymentUrl.searchParams.set('label', orderId);
            paymentUrl.searchParams.set('paymentType', 'PC');

            const successUrl = new URL(window.location.href);
            successUrl.searchParams.set('payment_status', 'success');
            paymentUrl.searchParams.set('successURL', successUrl.toString());

            tg.openLink(paymentUrl.toString());

            // Simulate successful payment by clearing the cart after a delay.
            setTimeout(() => {
                cart = {};
                discountPercent = 0;
                currentView = 'menu';
                renderView();
                updateMainButton();
                tg.BackButton.hide();
            }, 5000);
        }
        renderView();
        updateMainButton();
    });

    /**
     * Handler for the Telegram Back Button, controlling navigation between views.
     */
    tg.BackButton.onClick(() => {
        if (currentView === 'checkout') {
            currentView = 'cart';
        } else if (currentView === 'cart' || currentView === 'profile') {
            currentView = 'menu';
            tg.BackButton.hide();
        }
        renderView();
        updateMainButton();
    });

    // --- INITIALIZATION ---

    /**
     * Main initialization function. Hides back button and loads menu data.
     */
    const init = async () => {
        tg.BackButton.hide();
        try {
            const response = await fetch('data/menu.json');
            menuData = await response.json();
            renderView();
        } catch (error) {
            app.innerHTML = '<p>Не удалось загрузить меню. Пожалуйста, попробуйте перезагрузить страницу.</p>';
        }
    };

    init();
});
