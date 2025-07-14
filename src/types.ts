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
  flight_data: {

    time_stamps: number[];
    coords: [number, number, number][];
  }
}

export interface WeatherData {
  time: string;
  temperature: number;
  pressure: number;
  wind_speed: number;
  wind_from_direction: number;
  humidity: number;
}

export interface Day {
  data: FlightData;
  weather: WeatherData;
}

export interface MC_PostSettings {
  number_simulations: number;
  fuel_mass: number;
  wind_from_direction: number;
  length: number;
}

interface ImpactPoint {
  x: number;
  y: number;
}

export interface MonteCarloResponse {
  data: ImpactPoint[];
}

// A two-element tuple: [flight, weather]
export type Data = Day[];