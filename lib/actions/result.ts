export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export function actionOk<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function actionErr(error: string): ActionResult<never> {
  return { success: false, error };
}

export function toActionError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): ActionResult<never> {
  if (error instanceof Error && error.message) {
    return { success: false, error: error.message };
  }
  return { success: false, error: fallback };
}
