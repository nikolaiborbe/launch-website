// src/types.ts
export interface FlightData {
  max_velocity: number;
  apogee_time: number;
  apogee_altitude: number;
  apogee_x: number;
  apogee_y: number;
  impact_x: number;
  impact_y: number;
  impact_velocity: number;
}

export interface WeatherData {
  temperature: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  humidity: number;
}

// A two-element tuple: [flight, weather]
export type Data = [FlightData, WeatherData];