# Taste Restaurant - Premium Digital Menu

A luxurious, mobile-first digital menu and admin dashboard for restaurants. The project now includes a working admin console with theme control, image URL management, drag-and-drop category and item reordering, stock toggling, item duplication, JSON import/export, analytics summaries, QR code generation, backups, and responsive mobile-friendly controls.

## Included capabilities

- Public menu with bilingual English/Arabic support and WhatsApp ordering
- Admin dashboard for restaurant owners and staff editors
- Theme color editing from the dashboard
- Image URLs for menu items and restaurant logo
- Drag-and-drop reorder for categories and menu items
- Availability toggle (In Stock / Out of Stock)
- Duplicate existing items
- JSON import/export for menu data
- Analytics cards for total views, most viewed items, and WhatsApp orders
- QR code generation per restaurant
- Subscription status support (active, trial, expired)
- Role-based permissions (Super Admin, Restaurant Admin, Staff Editor)
- Dark mode for the admin dashboard
- Firestore backup support and closed-signup security rules
- GitHub Pages deployment workflow

## File structure

```text
/
├── admin.html               # Admin dashboard shell
├── admin.css                # Dashboard styling and responsive layout
├── admin.js                 # Admin logic, CRUD, drag/drop, analytics, backups
├── app.js                   # Public menu rendering, cart, theme application, analytics hooks
├── firebase-config.js       # Firebase configuration placeholder and service init
├── firestore.rules          # Firestore rules for restaurant isolation and role checks
├── index.html               # Public menu entry point
├── styles.css               # Public menu styling
├── assets/                  # Restaurant images and logo
└── .github/workflows/deploy.yml  # GitHub Pages deployment workflow
```

## Security notes

- Firestore rules are scoped by restaurant ID and only permit authorized admins to write to their own restaurant data.
- The sign-up flow is intentionally closed; only approved accounts should be inserted by your admin team.
- Admin inputs are sanitized before they are written to state or Firestore.

## Firebase setup

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for the complete setup guide.

**Production auth:** Admin login requires a real Firebase Auth account and a matching `users/{uid}` document in Firestore. Demo/mock login has been removed.

## Deployment

1. Update the Firebase values in [firebase-config.js](firebase-config.js).
2. Push the repository to GitHub.
3. Enable GitHub Pages from the repository settings.
4. The included workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) will publish the site automatically on pushes to the main branch.

## Local preview

You can preview the site locally by opening the project folder in a browser or serving it with a simple static server, for example:

```bash
python -m http.server 8000
```

Then visit http://127.0.0.1:8000/.

