export interface Bus {
  id: string;
  name: string;
  type: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  rating: number;
  amenities: string[];
  totalSeats: number;
}

export interface Route {
  from: string;
  to: string;
  distance: string;
  popularTimes: string;
}

export const featuredRoutes: Route[] = [
  { from: "New York", to: "Boston", distance: "215 miles", popularTimes: "Morning" },
  { from: "Los Angeles", to: "San Francisco", distance: "380 miles", popularTimes: "Evening" },
  { from: "Chicago", to: "Detroit", distance: "280 miles", popularTimes: "Afternoon" },
  { from: "Miami", to: "Orlando", distance: "235 miles", popularTimes: "Morning" },
];

export const cities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
  "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington DC",
  "Boston", "Detroit", "Nashville", "Memphis", "Portland",
  "Oklahoma City", "Las Vegas", "Louisville", "Baltimore", "Milwaukee",
  "Albuquerque", "Tucson", "Fresno", "Sacramento", "Kansas City",
  "Atlanta", "Miami", "Cleveland", "New Orleans", "Tampa",
  "Orlando", "Pittsburgh", "Cincinnati", "Minneapolis", "St. Louis"
];

export function generateBuses(from: string, to: string, date: string): Bus[] {
  const busTypes = ["AC Sleeper", "Non-AC Seater", "AC Seater", "Volvo AC", "Semi Sleeper"];
  const operators = ["Express Transit", "Swift Travels", "Royal Roadways", "Metro Line", "Premium Bus Services"];
  const amenities = ["WiFi", "Charging Point", "Water Bottle", "Blanket", "Reading Light", "Entertainment", "Snacks"];
  
  const buses: Bus[] = [];
  
  for (let i = 0; i < 8; i++) {
    const departHour = 6 + i * 2;
    const travelHours = Math.floor(Math.random() * 4) + 4;
    const arrivalHour = (departHour + travelHours) % 24;
    
    buses.push({
      id: `bus-${i + 1}`,
      name: operators[Math.floor(Math.random() * operators.length)],
      type: busTypes[Math.floor(Math.random() * busTypes.length)],
      departureTime: `${departHour.toString().padStart(2, '0')}:${(Math.random() > 0.5 ? '00' : '30')}`,
      arrivalTime: `${arrivalHour.toString().padStart(2, '0')}:${(Math.random() > 0.5 ? '00' : '30')}`,
      duration: `${travelHours}h ${Math.floor(Math.random() * 60)}m`,
      price: Math.floor(Math.random() * 50) + 30,
      seatsAvailable: Math.floor(Math.random() * 20) + 5,
      rating: 3.5 + Math.random() * 1.5,
      amenities: amenities.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 3),
      totalSeats: 40,
    });
  }
  
  return buses.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}

export interface Seat {
  id: string;
  row: number;
  column: number;
  type: "lower" | "upper";
  status: "available" | "booked" | "selected";
  price: number;
}

export function generateSeats(busId: string, basePrice: number): Seat[] {
  const seats: Seat[] = [];
  const rows = 10;
  const columns = 4;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const seatNumber = row * columns + col + 1;
      const isBooked = Math.random() > 0.7;
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        row,
        column: col,
        type: col < 2 ? "lower" : "upper",
        status: isBooked ? "booked" : "available",
        price: basePrice,
      });
    }
  }
  
  return seats;
}
