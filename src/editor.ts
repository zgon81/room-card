import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { RoomCardConfig } from "./types";
import { getEntityDefaultTileIconAction } from "./room-card";

@customElement("room-card-editor")
export class RoomCardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
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
    //ev.stopPropagation();

    const newConfig = {
      ...this.config,
      ...ev.detail.value,
      type: this.config.type,
    };

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
      name: "name",
      selector: { text: {} },
    },
    {
      name: "temperature",
      selector: { entity: { domain: "sensor" } },
    },
    {
      name: "humidity",
      selector: { entity: { domain: "sensor" } },
    },
    {
      name: "light",
      selector: { entity: { domain: "light" } },
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
          name: "",
          type: "optional_actions",
          flatten: true,
          schema: (["hold_action", "double_tap_action"] as const).map(
            (action) => ({
              name: action,
              selector: {
                ui_action: {
                  default_action: "none" as const,
                },
              },
            })
          ),
        },
      ],
    },
  ];

  private computeLabel = (schema: { name: string }) => {
      switch (schema.name) {
        case "name":
          return "Room name";
        case "temperature":
          return "Temperature entity";
        case "humidity":
          return "Humidity entity";
        case "light":
          return "Main light";
        case "window":
          return "Window sensor";
        case "cover":
          return "Cover entity";
        case "interactions":
          return "Interactions";
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



