export const GUEST_COOKIE_NAME = "pipeline_guest";
export const GUEST_COOKIE_VALUE = "1";

export function isGuestMode(cookieStore: { get: (name: string) => { value: string } | undefined }) {
  return cookieStore.get(GUEST_COOKIE_NAME)?.value === GUEST_COOKIE_VALUE;
}
