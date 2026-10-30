/**
 * Maps a normalised API error onto react-hook-form: field errors land beside their inputs,
 * everything else becomes a form-level message. Entered values are never cleared.
 */
export function applyServerErrors(error, setError, knownFields) {
  let matched = false;
  for (const { field, message } of error?.errors ?? []) {
    const name = field?.split(".")[0];
    if (knownFields.includes(name)) {
      setError(name, { type: "server", message });
      matched = true;
    }
  }
  if (!matched) setError("root.server", { type: "server", message: error?.message ?? "Something went wrong. Please try again." });
}
