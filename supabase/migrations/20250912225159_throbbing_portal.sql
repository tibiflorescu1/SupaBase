/*
  # Add default vehicle categories

  1. New Data
    - Add common vehicle categories like SUV, Sedan, Hatchback, etc.
    - These will serve as base categories for the vehicle graphics pricing system

  2. Categories Added
    - SUV - Sport Utility Vehicles
    - Sedan - Standard sedans
    - Hatchback - Compact cars
    - Coupe - Two-door sports cars
    - Pickup - Pickup trucks
    - Van - Commercial and passenger vans
    - Motorcycle - Motorcycles and scooters
    - Truck - Commercial trucks
*/

-- Insert default vehicle categories
INSERT INTO categorii (nume) VALUES 
  ('SUV'),
  ('Sedan'),
  ('Hatchback'),
  ('Coupe'),
  ('Pickup'),
  ('Van'),
  ('Motorcycle'),
  ('Truck')
ON CONFLICT (nume) DO NOTHING;