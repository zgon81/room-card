import { HomeAssistant } from "custom-card-helpers";

export function formatTemperature(hass: HomeAssistant, entityId?: string): string | null {
  return formatSensor(hass, entityId, 1, "°C");
}

export function formatHumidity(hass: HomeAssistant, entityId?: string): string | null {
  return formatSensor(hass, entityId, 0, "%");
}

export function formatSensor(hass: HomeAssistant, entityId?: string, decimals: number = 0, units?: string): string | null {
  if (!entityId) return null;

  const stateObj = hass.states[entityId];
  if (!stateObj) return null;

  const value = Number(stateObj.state);
  if (Number.isNaN(value)) return null;

  return `${value.toFixed(decimals)} ${units ?? stateObj.attributes.unit_of_measurement}`;
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
