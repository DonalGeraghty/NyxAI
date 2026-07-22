# NyxAI

NyxAI is a small authenticated React/Vite frontend named for Nyx, the Greek goddess of night. Authentication and account management are provided by the Janus API hosted on Google Cloud Run.

## Features

- Sign in and registration
- Authenticated home page
- AI meal analysis with reviewed nutrition logging
- Account details, per-user OpenAI API-key management, sign out, and account deletion
- Responsive navigation
- Unstyled React structure ready for a new visual system

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
├── components/       # Storybook previews
├── config/           # Janus API configuration
├── context/          # Authentication state
├── pages/            # Home, login, and account pages
├── styles/           # Shared page styles
├── App.jsx           # Protected layout, navigation, and routes
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
  OPENAI_KEY: '/api/user/openai-key',
  NUTRITION_ANALYZE: '/api/nutrition/analyze',
  NUTRITION_ENTRIES: '/api/nutrition/entries',
}
```

The authentication token is stored locally under `dg_auth_token` and sent as a bearer token for authenticated requests.

The account page can save, replace, inspect, and remove the signed-in user's OpenAI API key. NyxAI keeps the plaintext key only in temporary component state and sends it directly to Janus over HTTPS. Janus verifies and encrypts it with Google Cloud KMS; NyxAI never stores the key in browser storage and can retrieve only safe status metadata.

The home-page composer sends a meal description to Janus for structured calorie and protein estimates. Results are shown for review and are persisted only after the user selects **Log meal**.

## Storybook

The navbar preview lives in `src/components/Navbar.stories.jsx`. Run `npm run storybook` for the interactive development server or `npm run build-storybook` for a static build.
