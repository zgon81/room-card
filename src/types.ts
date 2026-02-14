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
  lock?: string;
  tap_action?: ActionConfig;
  icon_tap_action?: ActionConfig;
  icon_hold_action?: ActionConfig;
  icon_double_tap_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

export interface Area {
  aliases: string[]
  area_id: string
  created_at: number
  floor_id: string | null
  humidity_entity_id: string | null
  icon: string | null
  labels: string[]
  modified_at: number
  name: string
  picture: string | null
  temperature_entity_id: string | null
}