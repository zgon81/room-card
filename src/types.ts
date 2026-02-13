import { ActionConfig, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

export interface RoomCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  area?: string;
  icon?: string;
  icon_color_on?: string;
  icon_color_off?: string;
  temperature?: string;
  humidity?: string;
  light?: string;
  window?: string;
  cover?: string;
  tap_action?: ActionConfig;
  icon_tap_action?: ActionConfig;
  icon_hold_action?: ActionConfig;
  icon_double_tap_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}