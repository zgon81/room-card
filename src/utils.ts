import { HomeAssistant } from "custom-card-helpers";

export function formatTemperature(
  hass: HomeAssistant,
  entityId?: string
): string | null {
  if (!entityId) return null;

  const stateObj = hass.states[entityId];
  if (!stateObj) return null;

  return `${stateObj.state} ${stateObj.attributes.unit_of_measurement ?? "°C"}`;
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
