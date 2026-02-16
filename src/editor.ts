import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { RoomCardConfig } from "./types";
import type { Area } from "./types.ts";
import { getEntityDefaultTileIconAction } from "./room-card";

@customElement("room-card-editor")
export class RoomCardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant & { areas: Record<string, Area> }
  @property({ attribute: false }) config!: RoomCardConfig;

  setConfig(config: RoomCardConfig) {
    this.config = config;
  }

  protected render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const schema = this._schema(
      this.config.light,
    );

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${schema}
        .computeLabel=${this.computeLabel}
        .computeHelper=${this.computeHelper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent) {
    ev.stopPropagation();

    const value = ev.detail.value;
    let newConfig: RoomCardConfig = {
      ...this.config,
      ...value,
      type: this.config.type,
    };

    // Auto-generate name from area
    if (
      value.area &&
      (!this.config.name || this.config.name.trim() === "")
    ) {
      const area = this.hass.areas[value.area];
      if (area) {
        newConfig = {
          ...newConfig,
          name: area.name,
        };
      }
    }

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      })
    );
  }


  private _schema = (entityId: string | undefined) => [
    { 
      name: "area", 
      selector: { area: {} },
    },
    {
      name: "name",
      selector: { text: {} },
    },
    {
      name: "light",
      selector: { entity: { domain: "light" } },
    },
    {
      name: "sensors",
      type: "expandable",
      flatten: true,
      schema: [
        {
          name: "temperature",
          selector: { entity: { domain: "sensor", device_class: "temperature" } },
        },
        
        {
          name: "humidity",
          selector: { entity: { domain: "sensor", device_class: "humidity" } },
        },
        {
          name: "window",
          selector: { entity: { domain: "binary_sensor", device_class: "window" } },
        },
        {
          name: "cover",
          selector: { entity: { domain: "cover" } },
        },
        {
          name: "motion",
          selector: { entity: { domain: "binary_sensor", device_class: "motion" } },
        },
        {
          name: "lock",
          selector: { entity: { domain: "lock" } },
        },
      ],
    },
    {
      name: "interactions",
      type: "expandable",
      flatten: true,
      schema: [
        {
          name: "tap_action",
          selector: {
            ui_action: {
              default_action: "more-info",
            },
          },
        },
        {
          name: "icon_tap_action",
          selector: {
            ui_action: {
              default_action: entityId
                ? getEntityDefaultTileIconAction(entityId)
                : "more-info",
            },
          },
        },
        {
          name: "hold_action",
          selector: {
            ui_action: {
              default_action: "none",
            },
          },
        },
        {
          name: "double_tap_action",
          selector: {
            ui_action: {
              default_action: "none",
            },
          },
        }
      ],
    },
  ];

  private computeLabel = (schema: { name: string }) => {
      switch (schema.name) {
        case "name":
          return "Room name";
        case "area":
          return "Area";
        case "light":
          return "Main light";
        case "sensors":
          return "Sensors";
        case "temperature":
          return "Temperature";
        case "humidity":
          return "Humidity";
        case "window":
          return "Window";
        case "cover":
          return "Cover";
        case "lock":
          return "Lock";
        case "motion":
          return "Motion";
        case "interactions":
          return "Interactions";
        case "optional_actions":
          return "Optional actions";
        case "tap_action":
          return "Tap action";
        case "icon_tap_action":
          return "Icon Tap action";
        case "hold_action":
          return "Hold action";
        case "double_tap_action":
          return "Double tap action";
        default:
          return undefined;
      }
    };

  private computeHelper = (schema: { name: string }) => {
      switch (schema.name) {
        case "temperature_entity":
          return "Select the sensor used to display room temperature";
        case "humidity_entity":
          return "Select the sensor used to display room humidity";
        case "light_entity":
          return "Light or light group controlled by this room";
        case "tap_action":
          return "Action executed when tapping the card";
        case "hold_action":
          return "Action executed on long press";
        case "double_tap_action":
          return "Action executed on double tap";
        default:
          return undefined;
      }
    };
}



