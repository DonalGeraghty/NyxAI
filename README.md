# Minerva

Minerva is a small authenticated React/Vite frontend with a permanent night-mode interface. Authentication and account management are provided by the Janus API hosted on Google Cloud Run.

## Features

- Sign in and registration
- Authenticated home page
- Account details, sign out, and account deletion
- Responsive navigation
- Permanent night-mode color palette

## Requirements

- Node.js 18 or newer
- npm

## Local development

```bash
npm install
npm run dev
```

Vite prints the local development URL after startup.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm test
npm run storybook
npm run build-storybook
```

## Source layout

```text
src/
├── components/       # Navigation styles and Storybook preview
├── config/           # Janus API configuration
├── context/          # Authentication state
├── pages/            # Home, login, and account pages
├── styles/           # Shared page styles
├── App.jsx           # Protected layout, navigation, and routes
├── index.css         # Permanent night-mode palette and global styles
└── main.jsx          # React entry point
```

## Routes

- `/` — authenticated home page
- `/account` — profile and account settings
- Any unknown or retired route redirects to `/`

Unauthenticated visitors see the sign-in and registration screen.

## API

The deployed Janus base URL and auth endpoints are centralized in `src/config/api.js`:

```js
export const API_ENDPOINTS = {
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_ME: '/api/auth/me',
  AUTH_DELETE_ACCOUNT: '/api/auth/account',
}
```

The authentication token is stored locally under `dg_auth_token` and sent as a bearer token for authenticated requests.

## Storybook

The navbar preview lives in `src/components/Navbar.stories.jsx`. Run `npm run storybook` for the interactive development server or `npm run build-storybook` for a static build.
