import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
    HomeAssistant,
    ActionHandlerEvent,
    handleAction,
    hasAction,
    DOMAINS_TOGGLE,
    computeDomain,
} from "custom-card-helpers";

import { RoomCardConfig } from "./types";
import type { Area } from "./types.ts";
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
  @property({ attribute: false }) hass!: HomeAssistant & { areas: Record<string, Area> }
  @property({ attribute: false }) config!: RoomCardConfig;
  @state() private area?: Area

  static async getConfigElement() {
    await import("./editor");
    return document.createElement("room-card-editor");
  }

  static getStubConfig(): RoomCardConfig {
    return {
      type: "custom:room-card",
      tap_action: { action: "none" },
      hold_action: { action: "none" },
      double_tap_action: { action: "none" },
    };
  }

  setConfig(config: RoomCardConfig) {
    if (!config) throw new Error("Invalid config");
    
    this.config = {
      icon_color_on: "rgb(255, 193, 7)",
      icon_color_off: "var(--state-inactive-color)",
      ...config,
    };
  }

  public getGridOptions() {
    return {
      columns: 6,
    };
  }

  protected render() {
    if (!this.hass || !this.config) return html``;

    const { hass, config: cfg } = this;
    const temperature = cfg.temperature ? hass.states[cfg.temperature] : undefined;
    const humidity = cfg.humidity ? hass.states[cfg.humidity] : undefined;
    const window = cfg.window ? hass.states[cfg.window] : undefined;
    const light = cfg.light ? hass.states[cfg.light] : undefined;
    const lock = cfg.lock ? hass.states[cfg.lock] : undefined;

    const lightOn = light?.state === "on";
    const iconColor = lightOn ? cfg.icon_color_on : cfg.icon_color_off;

    const area = this.config.area ? this.hass.areas?.[this.config.area] : undefined;
    const areaIcon = area ? area.icon : undefined;
    const cardIcon = cfg.icon ?? areaIcon ?? "mdi:home";
    
    const cover = cfg.cover ? hass.states[cfg.cover] : undefined;
    const coverIcon = cover ? this._getCoverIcon(cover) : null;
    const coverPosition = cover?.attributes?.current_position;
    const coverColor = coverPosition === 0 ? "LimeGreen" : "Orange";

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
              .interactive=${this._hasIconAction}
              .icon=${cardIcon}
              style="--icon-primary-color:${iconColor}"
            ></ha-icon>
          </div>

          <div class="right">
            <div class="row name small-icon">
              ${lock && html`
                <ha-icon
                  icon=${lock.state === "unlocked" ? "mdi:lock-alert" : "mdi:lock"}
                  style="--icon-primary-color: ${lock.state === "unlocked" ? "red" : "LimeGreen"};"
                ></ha-icon>
              `}
              ${cfg.name}
            </div>

            <div class="row climate small-icon">
              ${temperature ? html`
                <span>
                  <ha-icon
                    icon="mdi:thermometer" 
                    style="--icon-primary-color:OrangeRed">
                  </ha-icon>
                  ${temperature.state}${temperature.attributes.unit_of_measurement || ""}
                </span>
              ` : ""}
              ${humidity ? html`
                <span>
                  <ha-icon
                    icon="mdi:water" 
                    style="--icon-primary-color:DeepSkyBlue">
                  </ha-icon>
                  ${humidity.state}%</span>
              ` : ""}
            </div>
            
            <div class="row sensors small-icon">
              ${coverIcon ? html`
                <ha-icon
                  .icon=${coverIcon}
                  style="--icon-primary-color: ${coverColor};"
                ></ha-icon>
              ` : ""}

              ${window?.state === "on" ? html`
                <ha-icon
                  icon="mdi:window-closed-variant"
                  style="--icon-primary-color: red;"
                ></ha-icon>
              ` : ""}
            </div>

          </div>
        </div>
      </ha-card>
    `;
  }

  private get _hasIconAction() {
    return (
      !this.config?.icon_tap_action || hasAction(this.config?.icon_tap_action)
    );
  }

  private _getCoverIcon(cover: any): string | null {
    const pos = cover?.attributes?.current_position;

    if (pos === undefined || pos === null) return null;

    if (pos > 90) return "cil:shutter-0";
    if (pos > 70) return "cil:shutter-1";
    if (pos > 40) return "cil:shutter-2";
    if (pos > 10) return "cil:shutter-3";

    return "cil:shutter-4";
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
      height: 100%;
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

    .small-icon {
      --mdc-icon-size: 1.5rem;

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
