export const BASE_URL: string =
  process.env.NODE_ENV === "development"
    ? `${window.location.protocol}//${window.location.hostname}:9000`
    : `${window.location.protocol}//${window.location.hostname}`;
console.log("BASE_URL", BASE_URL);
