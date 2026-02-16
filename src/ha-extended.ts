import type { HomeAssistant } from "custom-card-helpers";
import type { Area } from "./types";

export interface ExtendedHomeAssistant extends HomeAssistant {
  themes: {
    darkMode: boolean;
  } & HomeAssistant["themes"];

  areas?: Record<string, Area>;
}

