import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
    HomeAssistant,
    ActionHandlerEvent,
    handleAction,
    hasAction,
    DOMAINS_TOGGLE,
    computeDomain
} from "custom-card-helpers";

import { RoomCardConfig } from "./types";
import { formatTemperature } from "./utils";
import { actionHandler } from "./action-handler-directive";

export const getEntityDefaultTileIconAction = (entityId: string) => {
  const domain = computeDomain(entityId);
  const supportsIconAction =
    DOMAINS_TOGGLE.has(domain) ||
    ["button", "input_button", "scene"].includes(domain);

  return supportsIconAction ? "toggle" : "none";
};

@customElement("room-card")
export class RoomCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: RoomCardConfig;
  @state() private _areas: Record<string, { icon?: string }> = {};
  @state() private _areasLoaded = false;
  
  protected willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has("hass")) {
      void this._loadAreas();
    }
  }

  private async _loadAreas(): Promise<void> {
    if (!this.hass) return;

    try {
      const areas = await this.hass.callWS<Array<{ area_id: string; icon?: string }>>({
        type: "config/area_registry/list",
      });

      this._areas = Object.fromEntries(
        areas.map((area) => [area.area_id, { icon: area.icon }])
      );

      this._areasLoaded = true;

    } catch {
      this._areas = {};
    }
  }

  static async getConfigElement() {
    await import("./editor");
    return document.createElement("room-card-editor");
  }

  static getStubConfig(): RoomCardConfig {
    return {
      type: "custom:room-card",
      name: "Room",
      tap_action: { action: "none" },
      hold_action: { action: "none" },
      double_tap_action: { action: "none" },
    };
  }

  setConfig(config: RoomCardConfig) {
    if (!config) throw new Error("Invalid config");
    this.config = config;
  }

  protected render() {
    if (!this.hass || !this.config) return html``;
    if (this.config.area && !this._areasLoaded) return html``;

    const { hass, config: cfg } = this;
    const temperature = cfg.temperature ? hass.states[cfg.temperature] : undefined;
    const humidity = cfg.humidity ? hass.states[cfg.humidity] : undefined;
    const window = cfg.window ? hass.states[cfg.window] : undefined;
    const cover = cfg.cover ? hass.states[cfg.cover] : undefined;
    const light = cfg.light ? hass.states[cfg.light] : undefined;

    const lightOn = light?.state === "on";
    const iconColor = lightOn ? cfg.icon_color_on : cfg.icon_color_off;

    const areaIcon = cfg.area ? this._areas[cfg.area]?.icon : undefined;
    const icon = cfg.icon ?? areaIcon ?? "mdi:home";

    return html`
      <ha-card
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
      >
        <div class="card">

          <div class="left">
            <ha-icon
              class="icon"
              @action=${this._handleIconAction}
              .actionHandler=${actionHandler({
                hasHold: hasAction(this.config.icon_hold_action),
                hasDoubleClick: hasAction(this.config.icon_double_tap_action),
              })}
              .icon=${icon}
              style="--icon-primary-color:${iconColor}"
            ></ha-icon>
          </div>

          <div class="right">
            <div class="row title">
              <div class="name">${cfg.name}</div>
            </div>

            <div class="row climate">
              ${temperature ? html`
                <span>🌡 ${temperature.state}${temperature.attributes.unit_of_measurement || ""}</span>
              ` : ""}
              ${humidity ? html`
                <span>💧 ${humidity.state}%</span>
              ` : ""}
            </div>

            <div class="row sensors">
              ${window ? html`
                <span>🪟 ${window.state === "on" ? "OTW" : "ZAM"}</span>
              ` : ""}
              ${cover ? html`
                <span>▮ ${cover.state}</span>
              ` : ""}
            </div>
          </div>

        </div>
      </ha-card>
    `;
  }

  private _handleIconAction(ev: CustomEvent) {
    ev.stopPropagation();
    const config = {
      entity: this.config.light,
      tap_action: this.config.icon_tap_action,
      hold_action: this.config.icon_hold_action,
      double_tap_action: this.config.icon_double_tap_action,
    };

    handleAction(this, this.hass!, config, ev.detail.action!);
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  static styles = css`
    .card {
      font-size: 1rem;
      display: grid;
      grid-template-columns: 3.5rem 1fr;
    }

    .left {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .icon {
      --mdc-icon-size: 2.5rem;
    }

    .right {
      display: grid;
      grid-template-rows: auto auto auto;
    }

    .row {
      padding: 0.375rem 0.625rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .row:not(:last-child) {
      border-bottom: 1px dashed var(--divider-color);
    }

    .title {
      flex-direction: column;
      align-items: flex-start;
    }

    .name {
      padding: 0.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .climate {
      font-size: 0.875rem;
    }

    .sensors {
      font-size: 0.8125rem;
      opacity: 0.85;
    }

    ha-card {
      height: 100%;
    }
  `;
}
