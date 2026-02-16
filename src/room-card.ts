import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
    ActionHandlerEvent,
    handleAction,
    hasAction,
    DOMAINS_TOGGLE,
    computeDomain,
} from "custom-card-helpers";

import { RoomCardConfig } from "./types";
import type { ExtendedHomeAssistant } from "./ha-extended";
import type { Area } from "./types.ts";
import { actionHandler } from "./action-handler-directive";
import { formatTemperature, formatHumidity } from "./utils";

export const getEntityDefaultTileIconAction = (entityId: string) => {
  const domain = computeDomain(entityId);
  const supportsIconAction =
    DOMAINS_TOGGLE.has(domain) ||
    ["button", "input_button", "scene"].includes(domain);

  return supportsIconAction ? "toggle" : "none";
};

@customElement("room-card")
export class RoomCard extends LitElement {
  @property({ attribute: false }) hass!: ExtendedHomeAssistant;
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
    const isDark = hass.themes ? hass.themes?.darkMode : undefined;

    const temperature = cfg.temperature ? hass.states[cfg.temperature] : undefined;
    const humidity = cfg.humidity ? hass.states[cfg.humidity] : undefined;
    const window = cfg.window ? hass.states[cfg.window] : undefined;
    const light = cfg.light ? hass.states[cfg.light] : undefined;
    const lock = cfg.lock ? hass.states[cfg.lock] : undefined;
    const motion = cfg.motion ? hass.states[cfg.motion] : undefined;

    const lightOn = light?.state === "on";
    const iconColorOn = isDark ? "rgb(255, 193, 7)" : "Orange";
    const iconColorOff = isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0,0,0,0.45)";
    const iconColor = lightOn ? iconColorOn : iconColorOff;

    const area = this.config.area ? this.hass.areas?.[this.config.area] : undefined;
    const areaIcon = area ? area.icon : undefined;
    const cardIcon = cfg.icon ?? areaIcon ?? "mdi:home";
    
    const cover = cfg.cover ? hass.states[cfg.cover] : undefined;
    const coverIcon = cover ? this._getCoverIcon(cover) : null;
    const coverPosition = cover?.attributes?.current_position;
    const coverColor = coverPosition === 0 ? "LimeGreen" : "Orange";

    return html`
      <ha-card
        class=${isDark ? "dark" : "light"}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
      >
        <div class="card">

          <div class="top">

            <div class="main-icon ${lightOn ? "active" : ""} ${isDark ? "dark" : "light"}">
              <ha-icon
                @action=${this._handleIconAction}
                .actionHandler=${actionHandler({
                  hasHold: hasAction(this.config.icon_hold_action),
                  hasDoubleClick: hasAction(this.config.icon_double_tap_action),
                })}
                .icon=${cardIcon}
                style="--icon-primary-color:${iconColor}"
              ></ha-icon>
            </div>

            <div class="title">
              ${cfg.name}
            </div>

            <div class="climate">
              ${temperature ? html`
                <div class="temp">
                  ${formatTemperature(hass, cfg.temperature)}
                </div>
              ` : ""}

              ${humidity ? html`
                <div class="hum">
                  ${formatHumidity(hass, cfg.humidity)}
                </div>
              ` : ""}
            </div>

          </div>

          <div class="sensors">

            ${light ? html`
              <ha-icon
                icon="mdi:lightbulb"
                style="--icon-primary-color:${lightOn ? iconColorOn : iconColorOff}"
              ></ha-icon>
            ` : ""}

            ${window?.state === "on" ? html`
              <ha-icon
                icon="mdi:window-open-variant"
                style="--icon-primary-color:red"
              ></ha-icon>
            ` : ""}

            ${coverIcon ? html`
              <ha-icon
                .icon=${coverIcon}
                style="--icon-primary-color:${coverColor}"
              ></ha-icon>
            ` : ""}

            ${lock ? html`
              <ha-icon
                icon=${lock.state === "unlocked" ? "mdi:lock-open-variant" : "mdi:lock"}
                style="--icon-primary-color:${lock.state === "unlocked" ? "red" : "LimeGreen"}"
              ></ha-icon>
            ` : ""}

            ${motion?.state === "on" ? html`
              <ha-icon
                icon="mdi:motion-sensor"
                style="--icon-primary-color:DeepSkyBlue"
              ></ha-icon>
            ` : ""}

          </div>

        </div>

      </ha-card>
    `;
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
    ha-card {
      position: relative;
      height: 100%;
      overflow: hidden;

      border-radius: 15px;
    }

    ha-card.dark {
      border: 1px solid rgba(255,255,255,0.12);
      background:
        linear-gradient(
          160deg,
          rgb(60,60,60) 0%,
          rgb(40,40,40) 40%,
          rgb(20,20,20) 100%
        );
    }

    ha-card.light {
      border: 1px solid rgba(0,0,0,0.12);
      background: linear-gradient(
        160deg,
        rgb(255,255,255) 0%,
        rgb(238,238,238) 50%,
        rgb(225,225,225) 100%
      );
    }

    .card {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0.5rem 0.5rem 0.5rem 0.5rem;
      gap: 1rem;
    }

    .top {
      display: grid;
      grid-template-columns: 3.2rem 1fr auto;
      align-items: start;
      column-gap: 0.8rem;
    }

    .main-icon {
      --mdc-icon-size: 2.3rem;

      position: relative;

      width: 3.5rem;
      height: 3.5rem;

      border-radius: 0px 0px 15px 0px;

      display: flex;
      align-items: center;
      justify-content: center;

      margin-top: -0.6rem;
      margin-left: -0.6rem;
    }

    .main-icon.dark {
      background: rgba(255, 255, 255, 0.1);
    }

    .main-icon.light {
      background: rgba(0, 0, 0, 0.1);
    }

    .main-icon.active.dark {
      background: rgba(255, 193, 7, 0.15);

      box-shadow:
        0 0 5px rgba(255, 193, 7, 0.15),
        0 0 5px rgba(255, 193, 7, 0.2);
    }

    .main-icon.active.light {
      background: rgba(255, 193, 7, 0.35);

      box-shadow:
        0 0 12px rgba(255, 193, 7, 0.35),
        0 0 3px rgba(255, 193, 7, 0.5);
    }

    .title {
      font-size: 1.1rem;
      font-weight: 600;
      line-height: 1.25;
      word-break: break-word;
      margin-left: -0.6rem;
    }

    .climate {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      font-size: 0.8rem;
      font-weight: 400;
      opacity: 0.8;

      gap: 0.1rem;
    }

    .climate .temp {
      line-height: 1.1;
    }

    .climate .hum {
      line-height: 1.1;
      opacity: 0.7;
    }

    .sensors {
      display: flex;
      align-items: center;
      gap: 1rem;
      opacity: 0.9;
    }

    .sensors ha-icon {
      --mdc-icon-size: 1.6rem;
    }

  `;
}
