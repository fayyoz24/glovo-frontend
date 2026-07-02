# Dasturxon — Glovo UZ mijoz ilovasi (frontend)

`glovo_uz` Django backend’i uchun yozilgan **mijoz (customer)** frontend’i.
React 19 + Vite + React Router 7 + Tailwind CSS asosida qurilgan, backend’dagi
`apps/accounts`, `apps/merchants`, `apps/catalog`, `apps/carts`, `apps/orders`,
`apps/locations`, `apps/reviews` app’larining REST API’lariga mos yozilgan.

## Ishga tushirish

```bash
npm install
cp .env.example .env   # kerak bo'lsa VITE_API_BASE_URL ni o'zgartiring
npm run dev
```

`.env` faylida:

- `VITE_API_BASE_URL` — Django backend manzili, masalan `http://localhost:8000/api/v1`
- `VITE_TELEGRAM_BOT_USERNAME` — login uchun ishlatiladigan Telegram bot username’i

## Autentifikatsiya

Backend faqat **Telegram orqali** login qiladi (parolsiz):

1. Foydalanuvchi Telegram botni ochib `/start` bosadi.
2. Bot 6 xonali bir martalik kod yuboradi.
3. Foydalanuvchi shu kodni `/login` sahifasida kiritadi →
   `POST /auth/telegram/verify-code/` chaqiriladi → `access`/`refresh` JWT
   tokenlar `localStorage`’da saqlanadi.
4. Har bir so'rovda `Authorization: Bearer <access>` yuboriladi;
   401 kelsa, `POST /auth/token/refresh/` orqali avtomatik yangilanadi.

## Papka tuzilishi

```
src/
  api/          — backend bilan ishlaydigan fetch klientlari (auth, merchants,
                  catalog, cart, orders, locations, reviews, promotions,
                  notifications)
  context/      — AuthContext, CartContext, ToastContext
  components/   — qayta ishlatiladigan UI qismlari
  pages/        — marshrutlarga bog'langan sahifalar
  hooks/        — useGeolocation va h.k.
  utils/        — narx/vaqt formatlash, status lug'atlari
```

## Sahifalar

| Yo'l              | Tavsif                                              |
| ------------------ | ---------------------------------------------------- |
| `/login`           | Telegram kod bilan kirish                             |
| `/`                | Do'konlar ro'yxati, turi bo'yicha filtr, joylashuv     |
| `/search`          | Barcha do'konlar bo'yicha mahsulot qidirish            |
| `/merchants/:id`   | Do'kon sahifasi — filial, menyu, mahsulot modal oynasi |
| `/cart`            | Savat, promokod, jami hisob                            |
| `/checkout`        | Manzil tanlash/qo'shish, to'lov usuli, buyurtma berish |
| `/orders`          | Buyurtmalar tarixi                                     |
| `/orders/:id`      | Buyurtma holati (real-vaqt kuzatuv), bekor qilish, baholash |
| `/profile`         | Profil ma'lumotlari, manzillar boshqaruvi              |

## Backend bilan bog'liq eslatmalar

- `apps/carts/urls.py` dagi marshrutlarga mos yozilgan (`/cart/`,
  `/cart/items/`, `/cart/items/{id}/`, `/cart/items/{id}/delete/`,
  `/cart/apply-promo/`). Agar backend’da bu yo'llar boshqacha bo'lsa,
  `src/api/cart.js` faylini moslashtiring.
- `apps/notifications` route’lari `config/urls.py`da prefikssiz ulangan holatda
  topildi — bu hujjatlashtirilgan (`INTEGRATION.md`) yo'llarga zid, shuning
  uchun frontend hujjatdagi `/notifications/...` yo'llarini kutadi
  (`src/api/notifications.js`). Backend marshrutini shunga moslang yoki
  faylni tahrirlang.
- Barcha so'rovlar `VITE_API_BASE_URL` (`/api/v1`) ga nisbatan yuboriladi.

## Dizayn tizimi

- **Ranglar**: marigold (asosiy CTA), pomegranate (ogohlantirish/chegirma),
  ceramic (havolalar/ikkinchi darajali), issiq qog'oz foni.
- **Shriftlar**: Unbounded (sarlavhalar), Plus Jakarta Sans (matn),
  JetBrains Mono (narxlar, buyurtma raqamlari).
- Mobil-birinchi: pastki navigatsiya `sm` breakpoint’dan pastda ko'rinadi.
