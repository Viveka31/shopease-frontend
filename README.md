# ShopEase — Frontend

React 18 e-commerce frontend with full buyer + seller flows, Stripe payments, and a teal/navy design system.

## Quick Start

# ShopEase 🛍️

Full-stack fashion e-commerce built with MERN stack.  
**Backend** (Render) + **Frontend** (Netlify) deployed separately.

```
shopease-project/
├── backend/    → Node.js + Express + MongoDB API
└── frontend/   → React 18 SPA
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Seller | seller@shopease.com | seller123 |
| Buyer | buyer@shopease.com | buyer123 |
| Test Buyer | test@shopease.com | test1234 |




## Features

- **Buyer**: Browse, search, filter (category/price/rating), sort, paginate
- **Product Detail**: Image gallery, size/color picker, quantity, reviews
- **Cart**: Add/remove/update, shipping threshold, GST calculation
- **Checkout**: Shipping form → Stripe card payment
- **Orders**: History list, full detail view, status tracking
- **Wishlist**: Toggle from any product card
- **Profile**: Edit personal info + delivery address + change password
- **Seller Dashboard**: Revenue stats, product CRUD, order status management
- **Auth**: Register as buyer/seller, JWT auth, forgot/reset password
- **Responsive**: Works on mobile, tablet, desktop


## Test Stripe Payment

Use card: `4242 4242 4242 4242`  
Expiry: Any future date (e.g., 12/26)  
CVC: Any 3 digits  
ZIP: Any 5 digits

