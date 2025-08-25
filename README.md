# Telegram Mini App: Food Delivery

This is a sample Telegram Mini App for a food delivery service. It allows users to browse a menu, add items to a cart, and go through a checkout process.

## Features

- Browse menu with categories and items.
- Shopping cart functionality (add, remove, change quantity).
- Checkout process with address and promo code fields.
- Personal cabinet with user info and mock order history.
- Integration with Telegram Web App API (theme, buttons, user data).
- Simulated payment integration with YooKassa.

## Как запустить (How to Run)

Чтобы запустить это приложение как Telegram Mini App, выполните следующие шаги:

### 1. Размещение веб-приложения

Вам необходимо разместить все файлы из этого репозитория на веб-сервере с поддержкой **HTTPS**. Без HTTPS Telegram не будет загружать ваше приложение.

Вы можете использовать любой сервис для хостинга статических сайтов, например:
- [GitHub Pages](https://pages.github.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)

После размещения у вас должна быть публичная HTTPS ссылка на ваш `index.html`. Например: `https://your-username.github.io/your-repo-name/`

### 2. Настройка Telegram-бота

1.  Откройте Telegram и найдите бота `@BotFather`.
2.  Если у вас еще нет бота, создайте нового с помощью команды `/newbot`. Вы получите токен, который уже добавлен в `config.js`.
3.  Отправьте команду `/mybots` и выберите вашего бота.
4.  Нажмите **Bot Settings** -> **Menu Button**.
5.  Нажмите **Configure Menu Button**.
6.  Отправьте боту **URL** вашего размещенного веб-приложения (из шага 1).
7.  Затем отправьте название для кнопки, например, `Меню` или `Заказать еду`.

### 3. Запуск

Теперь откройте чат с вашим ботом в Telegram. Вы увидите новую кнопку "Меню" (или то название, которое вы выбрали) рядом с полем ввода текста. Нажмите на нее, и ваше Mini App откроется.

## Важное замечание по интеграции с платежной системой

Интеграция с платежной системой в этом приложении является **демонстрационной и не предназначена для реального использования**.

Когда пользователь нажимает "Оплатить", приложение перенаправляет его по заранее созданному URL-адресу YooKassa.

**Для реального приложения вам НЕОБХОДИМО:**
1.  Реализовать бэкенд-сервер.
2.  Надежно хранить ваш `shopId` и `Secret Key` от YooKassa на сервере.
3.  Создавать платеж на бэкенде и получать от API YooKassa `confirmation_url`.
4.  Передавать `confirmation_url` на фронтенд для перенаправления пользователя.
5.  Использовать бэкенд для обработки [веб-хуков (HTTP-уведомлений)](https://yookassa.ru/docs/guides/using-webhooks) от YooKassa для подтверждения успешной оплаты.
