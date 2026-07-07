// Reads from Vite env vars. Loading order (highest → lowest priority):
//   .env.[mode].local   (gitignored, personal overrides)
//   .env.[mode]         (committed — see .env.development / .env.production)
//   .env.local          (gitignored, personal overrides)
//   .env                (gitignored, personal default)
//
// The hardcoded fallback only fires if no VITE_API_URL is defined anywhere
// (e.g. on a fresh clone with no .env files at all).
export const API_URL =
    import.meta.env.VITE_API_URL || "https://api.octosofttechnologies.in";
