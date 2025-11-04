"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BusNavigation } from "@/components/BusNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight, MapPin, Calendar as CalendarIcon, Users, Star, Clock, Shield, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cities, featuredRoutes } from "@/lib/busData";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState("1");
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    // Check authentication before allowing search
    if (!isAuthenticated()) {
      router.replace("/login?redirect=" + encodeURIComponent("/"));
      return;
    }

    if (from && to && date) {
      setSearching(true);
      const formattedDate = format(date, "yyyy-MM-dd");
      // Simulate loading time for smooth transition
      setTimeout(() => {
        router.push(`/search?from=${from}&to=${to}&date=${formattedDate}&passengers=${passengers}`);
      }, 300);
    }
  };

  const handleRouteClick = (route: { from: string; to: string }, e: React.MouseEvent) => {
    // Prevent double-click issues
    if (searching) return;
    
    // Check authentication before allowing search
    if (!isAuthenticated()) {
      router.replace("/login?redirect=" + encodeURIComponent("/"));
      return;
    }

    setSearching(true);
    const formattedDate = format(new Date(), "yyyy-MM-dd");
    
    setTimeout(() => {
      router.push(`/search?from=${route.from}&to=${route.to}&date=${formattedDate}&passengers=1`);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white animate-in fade-in duration-300">
      <BusNavigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12 animate-in slide-in-from-top duration-500">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Book Your Bus Journey
            </h1>
            <p className="text-xl text-blue-100">
              Safe, Comfortable & Affordable Travel Across the Country
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-4xl mx-auto shadow-2xl animate-in slide-in-from-bottom duration-500">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from" className="text-sm font-medium">From</Label>
                  <Select value={from} onValueChange={setFrom}>
                    <SelectTrigger id="from">
                      <SelectValue placeholder="Select origin" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to" className="text-sm font-medium">To</Label>
                  <Select value={to} onValueChange={setTo}>
                    <SelectTrigger id="to">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "MMM dd, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengers" className="text-sm font-medium">Passengers</Label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger id="passengers">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleSearch} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!from || !to || !date || searching}
                  >
                    {searching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        Search Buses
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="animate-in slide-in-from-left duration-500">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>Safe Travel</CardTitle>
              <CardDescription>GPS tracked buses with verified drivers</CardDescription>
            </CardHeader>
          </Card>
          <Card className="animate-in slide-in-from-bottom duration-500 delay-150">
            <CardHeader>
              <Clock className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>On-Time Guarantee</CardTitle>
              <CardDescription>99% on-time departure record</CardDescription>
            </CardHeader>
          </Card>
          <Card className="animate-in slide-in-from-right duration-500 delay-300">
            <CardHeader>
              <Star className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>Best Prices</CardTitle>
              <CardDescription>Compare and book at lowest fares</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Popular Routes */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRoutes.map((route, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-lg">{route.from}</p>
                      <ArrowRight className="h-4 w-4 text-gray-400 my-2" />
                      <p className="font-bold text-lg">{route.to}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {route.distance}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Popular: {route.popularTimes}
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={(e) => handleRouteClick(route, e)}
                    disabled={searching}
                  >
                    {searching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "View Buses"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}