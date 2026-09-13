# Silvex Commerce Suite

# SILVEX FURNITURE — PRODUCTION-GRADE FULL-STACK E-COMMERCE PLATFORM

## ROLE

Act as a Senior Full-Stack Software Architect, Product Designer, UI/UX Engineer, Backend Engineer, Database Architect, Security Engineer, DevOps Engineer, and QA Engineer.

Your task is to design and build a complete, production-ready full-stack e-commerce platform for a premium furniture company called:

SILVEX FURNITURE

This is NOT a simple demo, landing page, or static frontend.

Build it as a scalable, maintainable, secure, responsive, real-world commercial application.

Follow the roadmap and requirements below as the SINGLE SOURCE OF TRUTH throughout development.

Do not randomly change the architecture or technology stack unless there is a strong technical reason. If you make an architectural decision, document it clearly.

==================================================

1. PRODUCT VISION

==================================================

Silvex Furniture is a premium furniture e-commerce business.

The platform must allow customers to:

- Discover furniture products

- Browse categories and collections

- Search products

- Filter and sort products

- View detailed product information

- Select product variants

- Add products to cart

- Manage wishlist

- Create an account

- Manage addresses

- Checkout

- Pay securely

- Track orders

- Review purchased products

- Receive order notifications

The platform must also provide an advanced ADMIN / MANAGEMENT PANEL for Silvex employees.

Administrators must be able to:

- Manage products

- Manage categories

- Manage inventory

- Manage orders

- Manage customers

- Manage reviews

- Manage discounts

- View sales analytics

- Monitor revenue

- Monitor expenses where applicable

- Monitor inventory

- View business KPIs

- Manage website content

- Manage administrators and roles

The final application should feel like a real premium furniture brand, not a student project.

==================================================

2. GOLDEN RULE

==================================================

SHIP A WORKING MVP FIRST.

Do not over-engineer the first version.

Build the core system properly:

1. Authentication

2. Product catalog

3. Categories

4. Product details

5. Search

6. Filters

7. Cart

8. Checkout

9. Orders

10. Payments

11. User account

12. Admin dashboard

13. Product management

14. Order management

15. Analytics

Then layer advanced features on top.

==================================================

3. TECHNOLOGY STACK

==================================================

Use the following architecture unless there is a compelling reason to improve it.

FRONTEND:

- Next.js 14+

- App Router

- TypeScript

- Tailwind CSS

- Responsive design

- React

- Zustand for client-side state management

- React Hook Form

- Zod validation

- TanStack Query where appropriate

- Lucide React icons

BACKEND:

- Node.js

- Express.js

- TypeScript

- REST API architecture

DATABASE:

- PostgreSQL

- Prisma ORM

- Prisma migrations

AUTHENTICATION:

- JWT or secure session-based authentication

- HTTP-only cookies for refresh/session tokens

- Password hashing using bcrypt/argon2

PAYMENTS:

- Stripe

- Stripe Checkout / Payment Intents where appropriate

- Stripe webhooks

EMAIL:

- Resend or Nodemailer

- Order confirmation emails

- Shipping/order status emails

- Password reset emails

IMAGE STORAGE:

- Cloudinary

DEPLOYMENT:

Frontend:

- Vercel

Backend:

- Railway / Render / AWS

Database:

- PostgreSQL on Supabase / Railway / AWS

VERSION CONTROL:

- Git

- GitHub

- Feature branches

- Pull-request-friendly structure

TESTING:

- Jest / Vitest

- Supertest

- Playwright for E2E

CODE QUALITY:

- ESLint

- Prettier

- Husky

- lint-staged

MONITORING:

- Sentry

ANALYTICS:

- Google Analytics or PostHog

==================================================

4. ARCHITECTURE

==================================================

Prefer a clean monorepo architecture:

/silvex-furniture

/apps

    /web

    /api

/packages

    /ui

    /config

    /types

Or use a clean frontend/backend separation if the environment makes a monorepo impractical.

The architecture must be modular and scalable.

Use:

- Clean Code

- SOLID Principles

- DRY

- Separation of Concerns

- Dependency Injection where useful

- Repository Pattern where appropriate

- Service Layer

- Controller Layer

- DTOs

- Validation Layer

- Middleware

- Centralized error handling

Avoid:

- Massive components

- Massive controllers

- Business logic inside UI components

- Duplicate logic

- Hardcoded business rules

- Hardcoded API URLs

- Exposing secrets

- Direct database access from frontend

- Poor naming

- Unnecessary abstractions

==================================================

5. BRAND / UI DESIGN

==================================================

Create a premium furniture brand identity.

Brand:

SILVEX

Visual direction:

- Luxury

- Minimal

- Modern

- Elegant

- Sophisticated

- High-end furniture showroom feeling

- Clean layouts

- Large product photography

- Strong typography

- Generous whitespace

- Subtle animations

- Premium micro-interactions

Do NOT make the website look like a generic Shopify template.

Avoid:

- Excessive gradients

- Excessive rounded cards

- Excessive animations

- Neon colors

- Cheap-looking UI

- Overcrowded screens

Use a sophisticated neutral furniture-inspired palette.

Suggested direction:

- Off-white

- Warm beige

- Charcoal

- Soft gray

- Deep brown accents

- Optional muted metallic accent

Typography should feel premium and highly readable.

Create a complete design system:

- Colors

- Typography

- Spacing

- Border radius

- Shadows

- Buttons

- Inputs

- Cards

- Badges

- Modals

- Tables

- Navigation

- Toasts

- Loading states

- Empty states

- Error states

==================================================

6. RESPONSIVE DESIGN

==================================================

Mobile-first.

The entire application must work perfectly on:

- Mobile

- Tablet

- Laptop

- Desktop

- Large desktop displays

Use responsive breakpoints intelligently.

Do not simply shrink the desktop interface.

Mobile navigation must be redesigned specifically for mobile UX.

==================================================

7. CUSTOMER WEBSITE

==================================================

Create the following pages.

PUBLIC:

/

Homepage

/shop

All products

/category/[slug]

Category products

/product/[slug]

Product details

/search

Search results

/cart

Shopping cart

/checkout

Checkout

/order-confirmation/[id]

Order confirmation

/login

Login

/register

Register

/forgot-password

Forgot password

/reset-password

Reset password

/about

About Silvex

/contact

Contact

/faq

FAQ

/404

Not found

/error

Error page

==================================================

8. HOMEPAGE

==================================================

Create a visually impressive premium homepage.

Sections:

1. Announcement bar

Example:

"Free delivery on orders over $X"

2. Premium Navbar

Include:

- Logo

- Shop

- Categories

- Collections

- Search

- Wishlist

- Account

- Cart

3. Hero section

Large premium furniture photography.

Headline example:

"Furniture That Defines Your Space."

Supporting text.

Primary CTA:

"Shop Collection"

Secondary CTA:

"Explore New Arrivals"

4. Featured Categories

Examples:

- Living Room

- Bedroom

- Dining Room

- Office

- Outdoor

- Decor

5. Featured Collection

Large editorial-style product presentation.

6. Best Sellers

Product carousel/grid.

7. New Arrivals

8. Promotional section

9. Why Silvex?

Examples:

- Premium Materials

- Expert Craftsmanship

- Secure Checkout

- Fast Delivery

- Customer Support

10. Customer testimonials

11. Instagram / social inspiration

12. Newsletter subscription

13. Premium footer

==================================================

9. PRODUCT CATALOG

==================================================

Product listing page must support:

- Grid view

- Optional list view

- Pagination

- Sorting

- Filtering

- Search

- Product count

Filters:

- Category

- Price range

- Material

- Color

- Size

- Availability

- Rating

- Collection

Sorting:

- Featured

- Newest

- Price low → high

- Price high → low

- Best selling

- Highest rated

Filters must work through URL query parameters so pages are shareable.

Example:

/shop?category=sofas&material=leather&minPrice=500&maxPrice=2000

==================================================

10. SEARCH

==================================================

Implement professional search.

Features:

- Search input

- Autocomplete

- Search suggestions

- Recent searches

- Popular searches

- Product results

- Category results

- No-results state

Backend must expose a proper search endpoint.

Implement PostgreSQL full-text search or a clean scalable alternative.

==================================================

11. PRODUCT DETAIL PAGE

==================================================

Create a premium product detail page.

Include:

- Image gallery

- Zoom

- Product title

- SKU

- Rating

- Reviews count

- Price

- Discount price

- Product description

- Materials

- Dimensions

- Colors

- Variants

- Quantity selector

- Stock status

- Add to Cart

- Buy Now

- Wishlist

- Shipping information

- Returns information

Also include:

- Product specifications

- Customer reviews

- Related products

- Frequently bought together

Display:

"Only X left"

when inventory is low.

==================================================

12. SHOPPING CART

==================================================

Cart must support:

- Add product

- Remove product

- Update quantity

- Variant selection

- Price calculation

- Subtotal

- Discounts

- Shipping

- Tax

- Final total

Include:

- Cart drawer

- Full cart page

- Recommended products

Persist cart appropriately for:

- Guest users

- Authenticated users

Merge guest cart into account cart after login.

==================================================

13. CHECKOUT

==================================================

Build a professional multi-step checkout.

Step 1:

Customer information

Step 2:

Shipping address

Step 3:

Shipping method

Step 4:

Payment

Step 5:

Order review

Step 6:

Confirmation

Support:

- Stripe

- Card payments

- Payment status

- Failed payment handling

- Webhook verification

Never trust payment status coming directly from the frontend.

Use Stripe webhooks to confirm successful payment.

==================================================

14. USER ACCOUNT

==================================================

Create:

/account

Dashboard showing:

- Welcome message

- Recent orders

- Account summary

- Wishlist

/account/profile

- Name

- Email

- Phone

- Password

/account/orders

Order history.

Each order should show:

- Order number

- Date

- Items

- Total

- Payment status

- Order status

/account/orders/[id]

Order details and tracking.

Order status:

1. Pending

2. Confirmed

3. Processing

4. Shipped

5. Out for Delivery

6. Delivered

7. Cancelled

/account/addresses

Address book.

Support:

- Add address

- Edit address

- Delete address

- Default address

/account/wishlist

Wishlist management.

==================================================

15. REVIEWS

==================================================

Customers who purchased a product can review it.

Review includes:

- Rating

- Title

- Comment

- Optional images

Prevent fake reviews.

Only verified purchasers should be allowed to submit verified reviews.

Admin can:

- Approve

- Reject

- Delete

- Moderate reviews

==================================================

16. ADMIN PANEL

==================================================

Create a completely separate professional admin dashboard.

Route:

/admin

Protect it with role-based authorization.

Roles:

SUPER_ADMIN

ADMIN

MANAGER

STAFF

Each role should have appropriate permissions.

==================================================

17. ADMIN DASHBOARD

==================================================

Create an executive-quality dashboard.

Top KPI cards:

- Total Revenue

- Total Orders

- Total Customers

- Average Order Value

- Conversion Rate

- Products Sold

- Pending Orders

- Low Stock Products

Revenue chart:

- Daily

- Weekly

- Monthly

- Yearly

Sales chart.

Orders chart.

Customer growth chart.

Top-selling products.

Low-stock products.

Recent orders.

Recent customers.

Revenue by category.

Payment status overview.

Order status overview.

Include date filters:

- Today

- Last 7 days

- Last 30 days

- Last 3 months

- Last 12 months

- Custom range

Admin should be able to export relevant reports as CSV.

==================================================

18. PRODUCT MANAGEMENT

==================================================

Admin product page:

/admin/products

Features:

- Product table

- Search

- Filter

- Sort

- Pagination

- Add product

- Edit product

- Delete product

- Bulk actions

Product fields:

- Name

- Slug

- SKU

- Description

- Price

- Compare-at price

- Cost price

- Category

- Collection

- Material

- Color

- Dimensions

- Weight

- Images

- Stock quantity

- Low-stock threshold

- Status

- Featured

- Bestseller

- New arrival

Product statuses:

- Draft

- Active

- Archived

- Out of Stock

Product creation should include image upload to Cloudinary.

==================================================

19. CATEGORY MANAGEMENT

==================================================

Admin can:

- Create category

- Edit category

- Delete category

- Upload category image

- Set category description

- Set SEO metadata

- Reorder categories

- Enable/disable category

Support hierarchical categories if appropriate.

==================================================

20. ORDER MANAGEMENT

==================================================

Admin order management:

/admin/orders

Features:

- Search orders

- Filter

- Sort

- View order

- Update status

- Update shipping

- Refund workflow

- View payment status

- Customer information

- Order timeline

Order details should include:

- Customer

- Products

- Quantities

- Prices

- Shipping

- Tax

- Discount

- Total

- Payment

- Address

- Timeline

==================================================

21. CUSTOMER MANAGEMENT

==================================================

Admin:

/admin/customers

Show:

- Customer name

- Email

- Phone

- Registration date

- Orders

- Total spent

- Last order

- Customer status

Customer profile:

- Personal details

- Addresses

- Orders

- Reviews

- Lifetime value

==================================================

22. INVENTORY MANAGEMENT

==================================================

Create inventory management.

Show:

- SKU

- Product

- Current stock

- Reserved stock

- Available stock

- Low stock status

- Inventory value

Actions:

- Adjust stock

- Add stock

- Remove stock

- Inventory history

Create stock movement records.

==================================================

23. DISCOUNTS

==================================================

Admin can create discount codes.

Fields:

- Code

- Discount type

- Percentage

- Fixed amount

- Minimum order

- Maximum discount

- Start date

- Expiration date

- Usage limit

- Per-user usage limit

- Active/inactive

Validate discounts on the backend.

Never rely on frontend discount calculations.

==================================================

24. BUSINESS ANALYTICS

==================================================

Create advanced analytics.

Metrics:

Revenue

Gross sales

Net sales

Orders

Average order value

Units sold

Refunds

Discounts

Taxes

Shipping revenue

Customer acquisition

Customer retention

Repeat customers

Charts:

- Revenue over time

- Orders over time

- Sales by category

- Sales by product

- Customer growth

- Order status distribution

- Payment status

- Inventory value

Provide date-range filtering.

Use interactive charts.

==================================================

25. DATABASE DESIGN

==================================================

Create a normalized PostgreSQL schema using Prisma.

Core entities:

User

Role

Permission

Category

Collection

Product

ProductVariant

ProductImage

Inventory

InventoryMovement

Cart

CartItem

Wishlist

WishlistItem

Address

Order

OrderItem

Payment

Shipment

Review

Discount

DiscountUsage

Notification

Add timestamps:

createdAt

updatedAt

Use:

- UUIDs where appropriate

- Proper indexes

- Foreign keys

- Unique constraints

- Cascading rules where appropriate

Optimize frequently queried fields.

==================================================

26. API DESIGN

==================================================

Create RESTful APIs.

AUTH:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

POST /api/auth/refresh

POST /api/auth/forgot-password

POST /api/auth/reset-password

PRODUCTS:

GET /api/products

GET /api/products/:id

POST /api/products

PATCH /api/products/:id

DELETE /api/products/:id

CATEGORIES:

GET /api/categories

GET /api/categories/:id

POST /api/categories

PATCH /api/categories/:id

DELETE /api/categories/:id

CART:

GET /api/cart

POST /api/cart/items

PATCH /api/cart/items/:id

DELETE /api/cart/items/:id

ORDERS:

POST /api/orders

GET /api/orders

GET /api/orders/:id

PATCH /api/orders/:id/status

USERS:

GET /api/users/me

PATCH /api/users/me

GET /api/users/me/orders

GET /api/users/me/addresses

POST /api/users/me/addresses

REVIEWS:

GET /api/products/:id/reviews

POST /api/products/:id/reviews

PAYMENTS:

POST /api/payments/create-session

POST /api/webhooks/stripe

SEARCH:

GET /api/search?q=

ADMIN:

GET /api/admin/dashboard

GET /api/admin/analytics

GET /api/admin/customers

GET /api/admin/orders

GET /api/admin/inventory

Follow REST conventions consistently.

==================================================

27. VALIDATION

==================================================

Validate ALL external input.

Frontend:

React Hook Form + Zod

Backend:

Zod/Joi validation

Validate:

- Emails

- Passwords

- Prices

- Quantities

- IDs

- Addresses

- Product fields

- Discount codes

- Review content

- Query parameters

Never trust client input.

==================================================

28. SECURITY

==================================================

Implement production-grade security.

Requirements:

- Password hashing

- HTTP-only cookies

- Secure cookies in production

- CSRF protection where applicable

- Rate limiting

- Helmet.js

- CORS

- Input validation

- Sanitization

- SQL injection protection through Prisma

- XSS protection

- Authorization middleware

- Role-based access control

- Secure password reset

- Secure Stripe webhook verification

- Environment variables

- No secrets committed to Git

Never expose:

- Database credentials

- JWT secrets

- Stripe secret keys

- Cloudinary secret keys

- Email API keys

==================================================

29. ERROR HANDLING

==================================================

Create centralized backend error handling.

Standard API response structure.

Example:

{

  "success": true,

  "data": {},

  "message": "Success"

}

Error:

{

  "success": false,

  "error": {

    "code": "PRODUCT_NOT_FOUND",

    "message": "Product not found"

  }

}

Frontend must gracefully handle:

- Network errors

- Validation errors

- Authentication errors

- Authorization errors

- Payment errors

- Server errors

- Empty states

Create attractive error UI.

==================================================

30. LOADING / EMPTY STATES

==================================================

Every asynchronous screen needs proper states.

Implement:

- Skeleton loaders

- Loading indicators

- Empty states

- Error states

- Success states

Do not leave blank screens.

==================================================

31. SEO

==================================================

Implement technical SEO.

Include:

- Metadata

- Dynamic metadata

- Open Graph

- Twitter cards

- Canonical URLs

- Sitemap

- Robots.txt

- Structured data

- Product schema

- Breadcrumb schema

- Organization schema

Optimize product pages for search engines.

==================================================

32. PERFORMANCE

==================================================

Target Lighthouse score:

90+

Optimize:

- Images

- Fonts

- JavaScript bundles

- API requests

- Database queries

- Caching

- Lazy loading

- Code splitting

Use Next.js Image optimization.

Avoid unnecessary client-side rendering.

Use Server Components where appropriate.

==================================================

33. ACCESSIBILITY

==================================================

Follow WCAG 2.1 fundamentals.

Requirements:

- Semantic HTML

- Keyboard navigation

- Focus states

- Accessible forms

- ARIA where needed

- Sufficient contrast

- Alt text

- Screen-reader-friendly labels

==================================================

34. EMAIL SYSTEM

==================================================

Create professional transactional emails.

Emails:

- Welcome email

- Verify email

- Password reset

- Order confirmation

- Payment confirmation

- Order shipped

- Order delivered

- Order cancelled

- Refund confirmation

Use professional Silvex branding.

==================================================

35. NOTIFICATIONS

==================================================

Create notification architecture.

Support:

- In-app notifications

- Email notifications

Optional future:

- SMS

- WhatsApp

==================================================

36. ADMIN CONTENT MANAGEMENT

==================================================

Allow administrators to manage:

- Homepage featured products

- Featured collections

- Promotional banners

- Announcement bar

- FAQ content

- Basic website content

Do not hardcode everything into components.

==================================================

37. TESTING

==================================================

Create tests for critical business logic.

Unit tests:

- Pricing

- Cart calculations

- Discounts

- Inventory

- Order creation

- Authorization

- Payment validation

Integration tests:

- Authentication

- Products

- Cart

- Orders

- Payments

E2E tests:

1. User visits website

2. Searches product

3. Opens product

4. Adds to cart

5. Goes to checkout

6. Completes payment

7. Order is created

8. Admin sees order

9. Admin updates order

10. User sees updated status

==================================================

38. DEVOPS

==================================================

Create:

- .env.example

- Docker configuration where appropriate

- Docker Compose for local PostgreSQL

- GitHub Actions

- CI pipeline

- Automated linting

- Automated testing

- Production build checks

Never commit:

.env

node_modules

credentials

secrets

==================================================

39. DOCUMENTATION

==================================================

Generate:

README.md

Include:

- Project overview

- Architecture

- Tech stack

- Installation

- Environment variables

- Database setup

- Prisma migrations

- Seed data

- Running frontend

- Running backend

- Testing

- Deployment

- API overview

Also document major architectural decisions.

==================================================

40. SEED DATA

==================================================

Create realistic Silvex seed data.

Categories:

- Sofas

- Beds

- Dining Tables

- Dining Chairs

- Coffee Tables

- TV Units

- Wardrobes

- Office Furniture

- Outdoor Furniture

- Home Decor

Create at least 20 realistic products.

Each product should have:

- Professional name

- Description

- Price

- SKU

- Category

- Material

- Color

- Dimensions

- Stock

- Images

- Rating

Do not use obviously fake placeholder names like:

"Product 1"

"Product 2"

==================================================

41. UX DETAILS

==================================================

Implement polished interactions:

- Smooth hover states

- Add-to-cart animation

- Toast notifications

- Wishlist animation

- Image transitions

- Dropdown animations

- Mobile menu

- Cart drawer

- Confirmation dialogs

- Modal dialogs

- Sticky product purchase area where appropriate

Animations should be subtle and premium.

Do not over-animate.

==================================================

42. ADMIN UX

==================================================

The admin dashboard should look like a professional SaaS/business management platform.

Include:

Sidebar:

Dashboard

Products

Categories

Collections

Inventory

Orders

Customers

Reviews

Discounts

Analytics

Content

Users & Roles

Settings

Top bar:

- Search

- Notifications

- Admin profile

- Theme toggle

Dashboard should prioritize information hierarchy.

Use:

- KPI cards

- Charts

- Tables

- Filters

- Date selectors

- Status badges

- Data visualization

==================================================

43. DARK MODE

==================================================

Support:

- Light mode

- Dark mode

Both modes must be professionally designed.

Do not simply invert colors.

==================================================

44. RESPONSIBLE DATA HANDLING

==================================================

Protect customer information.

Never expose unnecessary customer data.

Admin permissions must control sensitive operations.

Audit important administrative actions.

Create an audit log for:

- Product changes

- Order status changes

- Refunds

- User role changes

- Inventory adjustments

- Discount changes

==================================================

45. DEVELOPMENT WORKFLOW

==================================================

Do NOT attempt to generate the entire application blindly in one step.

Work incrementally.

PHASE 1:

Planning & architecture

PHASE 2:

Design system + UI structure

PHASE 3:

Frontend foundation

PHASE 4:

Backend foundation

PHASE 5:

Database

PHASE 6:

Authentication

PHASE 7:

Products/categories

PHASE 8:

Cart

PHASE 9:

Checkout/payments

PHASE 10:

Orders

PHASE 11:

User account

PHASE 12:

Admin panel

PHASE 13:

Analytics

PHASE 14:

Testing

PHASE 15:

Security audit

PHASE 16:

Performance optimization

PHASE 17:

Deployment preparation

==================================================

46. IMPORTANT IMPLEMENTATION RULE

==================================================

Before writing significant code:

1. Analyze the requirements.

2. Create the architecture.

3. Create the folder structure.

4. Create the database ERD/schema.

5. Define API contracts.

6. Define authentication/authorization.

7. Define UI component architecture.

8. Define the MVP.

9. Then begin implementation.

Do not skip architectural planning.

==================================================

47. CODE QUALITY RULES

==================================================

Every file must have a clear responsibility.

Use meaningful names.

Keep functions small.

Keep components reusable.

Avoid duplicated business logic.

Avoid magic numbers.

Avoid unnecessary comments.

Comments should explain WHY, not obvious WHAT.

Use TypeScript properly.

Avoid "any" unless absolutely necessary.

Use strict typing.

Use reusable interfaces/types.

Keep API contracts consistent.

==================================================

48. ENVIRONMENT VARIABLES

==================================================

Create:

.env.example

Example structure:

DATABASE_URL=

JWT_SECRET=

JWT_REFRESH_SECRET=

STRIPE_SECRET_KEY=

STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

RESEND_API_KEY=

NEXT_PUBLIC_API_URL=

SENTRY_DSN=

NEXT_PUBLIC_ANALYTICS_ID=

Never hardcode real credentials.

==================================================

49. FINAL ACCEPTANCE CRITERIA

==================================================

The application is considered complete only when:

CUSTOMER:

[ ] Can register

[ ] Can login

[ ] Can logout

[ ] Can browse products

[ ] Can search

[ ] Can filter

[ ] Can sort

[ ] Can view product details

[ ] Can select variants

[ ] Can add to cart

[ ] Can update cart

[ ] Can wishlist products

[ ] Can manage addresses

[ ] Can checkout

[ ] Can pay using Stripe test mode

[ ] Can receive order confirmation

[ ] Can view orders

[ ] Can track order status

[ ] Can review purchased products

ADMIN:

[ ] Can login

[ ] Dashboard works

[ ] Product CRUD works

[ ] Category CRUD works

[ ] Inventory management works

[ ] Order management works

[ ] Customer management works

[ ] Review moderation works

[ ] Discount management works

[ ] Analytics works

[ ] Role-based access works

[ ] Audit logs work

TECHNICAL:

[ ] PostgreSQL connected

[ ] Prisma migrations work

[ ] API works

[ ] Authentication secure

[ ] Authorization secure

[ ] Stripe webhook works

[ ] Email system works

[ ] Cloudinary works

[ ] Validation works

[ ] Error handling works

[ ] Tests pass

[ ] Responsive design works

[ ] Accessibility basics implemented

[ ] SEO implemented

[ ] Production build succeeds

[ ] Environment variables documented

[ ] README completed

==================================================

50. FINAL DELIVERABLE

==================================================

Deliver a complete production-quality Silvex Furniture e-commerce platform.

The final result must include:

1. Customer-facing website

2. Admin dashboard

3. Backend REST API

4. PostgreSQL database

5. Prisma ORM

6. Authentication

7. Authorization / RBAC

8. Shopping cart

9. Wishlist

10. Checkout

11. Stripe integration

12. Order management

13. Inventory management

14. Review system

15. Discount system

16. Analytics

17. Email notifications

18. Image management

19. Security

20. Testing

21. SEO

22. Responsive UI

23. Documentation

24. Deployment configuration

==================================================

51. IMPORTANT FINAL INSTRUCTION

==================================================

Think like a senior engineering team building a real commercial product.

Prioritize:

QUALITY > SPEED

MAINTAINABILITY > SHORT CODE

USER EXPERIENCE > TECHNICAL SHOWCASE

SECURITY > CONVENIENCE

WORKING MVP > UNNECESSARY COMPLEXITY

Do not create fake functionality.

If a feature cannot be fully implemented because an external service requires credentials, create the correct integration architecture, environment variables, service abstraction, and clear setup instructions.

Do not silently replace real functionality with mock behavior.

Whenever possible, implement the real functionality.

At every phase:

- Validate your work

- Check for errors

- Check responsive behavior

- Check API/database consistency

- Check security

- Check edge cases

- Check accessibility

- Check performance

Before declaring the project complete, perform a full end-to-end audit of the application and fix all critical issues.

Build SILVEX as a premium, scalable, production-ready furniture e-commerce platform.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/31e60e06-96c6-496b-8c54-5c3457b762f4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
