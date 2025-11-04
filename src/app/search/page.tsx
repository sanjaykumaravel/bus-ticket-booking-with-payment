"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BusNavigation } from "@/components/BusNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bus, generateBuses } from "@/lib/busData";
import { Clock, MapPin, Star, Wifi, Zap, Coffee, Armchair, ArrowRight, Loader2 } from "lucide-react";
import { SeatSelectionModal } from "@/components/SeatSelectionModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { isAuthenticated } from "@/lib/auth";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Search params
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";
  const passengers = searchParams.get("passengers") || "1";

  // Filters
  const [busTypes, setBusTypes] = useState<string[]>([]);
  const [departureTime, setDepartureTime] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
  const [minRating, setMinRating] = useState(0);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?redirect=" + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
  }, [router]);

  useEffect(() => {
    if (from && to && date && isAuthenticated()) {
      setLoading(true);
      // Simulate loading time for smooth transition
      setTimeout(() => {
        const generatedBuses = generateBuses(from, to, date);
        setBuses(generatedBuses);
        setFilteredBuses(generatedBuses);
        setLoading(false);
      }, 500);
    }
  }, [from, to, date]);

  useEffect(() => {
    let filtered = [...buses];

    // Filter by bus type
    if (busTypes.length > 0) {
      filtered = filtered.filter(bus => busTypes.includes(bus.type));
    }

    // Filter by departure time
    if (departureTime.length > 0) {
      filtered = filtered.filter(bus => {
        const hour = parseInt(bus.departureTime.split(":")[0]);
        return departureTime.some(timeSlot => {
          if (timeSlot === "morning") return hour >= 6 && hour < 12;
          if (timeSlot === "afternoon") return hour >= 12 && hour < 18;
          if (timeSlot === "evening") return hour >= 18 && hour < 24;
          if (timeSlot === "night") return hour >= 0 && hour < 6;
          return false;
        });
      });
    }

    // Filter by price range
    filtered = filtered.filter(bus => bus.price >= priceRange[0] && bus.price <= priceRange[1]);

    // Filter by rating
    filtered = filtered.filter(bus => bus.rating >= minRating);

    setFilteredBuses(filtered);
  }, [buses, busTypes, departureTime, priceRange, minRating]);

  const handleSelectSeats = (bus: Bus) => {
    if (!isAuthenticated()) {
      router.replace("/login?redirect=" + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    setSelectedBus(bus);
    setSeatModalOpen(true);
  };

  const toggleBusType = (type: string) => {
    setBusTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleDepartureTime = (time: string) => {
    setDepartureTime(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const clearFilters = () => {
    setBusTypes([]);
    setDepartureTime([]);
    setPriceRange([0, 100]);
    setMinRating(0);
  };

  const amenityIcons: { [key: string]: any } = {
    "WiFi": Wifi,
    "Charging Point": Zap,
    "Snacks": Coffee,
    "Blanket": Armchair,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusNavigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Searching for buses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-in fade-in duration-300">
      <BusNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Summary */}
        <Card className="mb-6 animate-in slide-in-from-top duration-500">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold">{from}</p>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-2xl font-bold">{to}</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{date}</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <p className="text-sm text-gray-600">Passengers</p>
                  <p className="font-semibold">{passengers}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => router.push("/")}>
                Modify Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 animate-in slide-in-from-left duration-500">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bus Type Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Bus Type</h3>
                  <div className="space-y-2">
                    {["AC Sleeper", "Non-AC Seater", "AC Seater", "Volvo AC", "Semi Sleeper"].map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={busTypes.includes(type)}
                          onCheckedChange={() => toggleBusType(type)}
                        />
                        <Label htmlFor={type} className="text-sm cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Departure Time Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Departure Time</h3>
                  <div className="space-y-2">
                    {[
                      { value: "morning", label: "Morning (6AM - 12PM)" },
                      { value: "afternoon", label: "Afternoon (12PM - 6PM)" },
                      { value: "evening", label: "Evening (6PM - 12AM)" },
                      { value: "night", label: "Night (12AM - 6AM)" },
                    ].map(time => (
                      <div key={time.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={time.value}
                          checked={departureTime.includes(time.value)}
                          onCheckedChange={() => toggleDepartureTime(time.value)}
                        />
                        <Label htmlFor={time.value} className="text-sm cursor-pointer">
                          {time.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Price Range</h3>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rating Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[4, 3.5, 3, 0].map(rating => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={minRating === rating}
                          onCheckedChange={() => setMinRating(rating)}
                        />
                        <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          {rating > 0 ? `${rating}+` : "All"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bus Listings */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between mb-4 animate-in slide-in-from-right duration-500">
              <h2 className="text-xl font-semibold">
                {filteredBuses.length} {filteredBuses.length === 1 ? 'Bus' : 'Buses'} Found
              </h2>
            </div>

            {filteredBuses.length === 0 ? (
              <Card className="animate-in zoom-in duration-300">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No buses found matching your criteria.</p>
                  <Button onClick={clearFilters} className="mt-4">Clear Filters</Button>
                </CardContent>
              </Card>
            ) : (
              filteredBuses.map((bus, index) => (
                <Card key={bus.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-right" style={{ animationDelay: `${index * 50}ms` }}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Bus Info */}
                      <div className="md:col-span-4">
                        <h3 className="text-xl font-bold mb-1">{bus.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{bus.type}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{bus.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {bus.amenities.slice(0, 4).map((amenity, idx) => {
                            const Icon = amenityIcons[amenity] || Wifi;
                            return (
                              <div key={idx} className="flex items-center text-xs text-gray-600">
                                <Icon className="h-3 w-3 mr-1" />
                                {amenity}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Timing */}
                      <div className="md:col-span-4 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center gap-4">
                            <div>
                              <p className="text-2xl font-bold">{bus.departureTime}</p>
                              <p className="text-sm text-gray-600">{from}</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <Clock className="h-4 w-4 text-gray-400 mb-1" />
                              <p className="text-sm font-medium">{bus.duration}</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{bus.arrivalTime}</p>
                              <p className="text-sm text-gray-600">{to}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="md:col-span-4 flex flex-col items-end justify-center space-y-2">
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-600">${bus.price}</p>
                          <p className="text-sm text-gray-600">per seat</p>
                        </div>
                        <Badge variant={bus.seatsAvailable > 10 ? "default" : "destructive"}>
                          {bus.seatsAvailable} seats left
                        </Badge>
                        <Button 
                          onClick={() => handleSelectSeats(bus)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Select Seats
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Seat Selection Modal */}
      {selectedBus && (
        <SeatSelectionModal
          bus={selectedBus}
          open={seatModalOpen}
          onClose={() => setSeatModalOpen(false)}
          searchParams={{ from, to, date, passengers }}
        />
      )}
    </div>
  );
}