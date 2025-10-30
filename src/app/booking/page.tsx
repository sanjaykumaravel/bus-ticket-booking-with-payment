"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BusNavigation } from "@/components/BusNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bus, Seat } from "@/lib/busData";
import { ArrowRight, User, Mail, Phone, Calendar, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PassengerInfo {
  name: string;
  age: string;
  gender: string;
  email?: string;
  phone?: string;
}

export default function BookingPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<{
    bus: Bus;
    seats: Seat[];
    from: string;
    to: string;
    date: string;
  } | null>(null);

  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    const data = localStorage.getItem("currentBooking");
    if (data) {
      const parsed = JSON.parse(data);
      setBookingData(parsed);
      // Initialize passenger forms
      setPassengers(
        parsed.seats.map(() => ({
          name: "",
          age: "",
          gender: "",
        }))
      );
    } else {
      router.push("/");
    }
  }, [router]);

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    setPassengers(prev => 
      prev.map((p, i) => i === index ? { ...p, [field]: value } : p)
    );
  };

  const isFormValid = () => {
    const allPassengersValid = passengers.every(
      p => p.name.trim() && p.age.trim() && p.gender
    );
    const contactValid = contactEmail.trim() && contactPhone.trim();
    return allPassengersValid && contactValid;
  };

  const handleProceedToPayment = () => {
    if (isFormValid() && bookingData) {
      const completeBookingData = {
        ...bookingData,
        passengers,
        contactEmail,
        contactPhone,
      };
      localStorage.setItem("currentBooking", JSON.stringify(completeBookingData));
      router.push("/payment");
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusNavigation />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const totalPrice = bookingData.seats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <BusNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
          <p className="text-gray-600 mt-1">Fill in passenger details to proceed</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Passenger Details Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact-email">Email Address *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Ticket will be sent to this email</p>
                </div>
                <div>
                  <Label htmlFor="contact-phone">Phone Number *</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">For booking confirmation and updates</p>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Details */}
            {passengers.map((passenger, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Passenger {index + 1} Details
                    </span>
                    <Badge>Seat {bookingData.seats[index].id.split('-')[1]}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${index}`}>Full Name *</Label>
                      <Input
                        id={`name-${index}`}
                        placeholder="John Doe"
                        value={passenger.name}
                        onChange={(e) => updatePassenger(index, "name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`age-${index}`}>Age *</Label>
                      <Input
                        id={`age-${index}`}
                        type="number"
                        placeholder="25"
                        value={passenger.age}
                        onChange={(e) => updatePassenger(index, "age", e.target.value)}
                        required
                        min="1"
                        max="120"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`gender-${index}`}>Gender *</Label>
                      <Select 
                        value={passenger.gender} 
                        onValueChange={(value) => updatePassenger(index, "gender", value)}
                      >
                        <SelectTrigger id={`gender-${index}`}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Journey Details */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">{bookingData.from}</span>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                      <span className="font-semibold text-lg">{bookingData.to}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {bookingData.date}
                    </div>
                  </div>

                  <Separator />

                  {/* Bus Details */}
                  <div>
                    <h4 className="font-semibold mb-2">Bus Details</h4>
                    <p className="text-sm font-medium">{bookingData.bus.name}</p>
                    <p className="text-sm text-gray-600">{bookingData.bus.type}</p>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Departure</span>
                      <span className="font-medium">{bookingData.bus.departureTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Arrival</span>
                      <span className="font-medium">{bookingData.bus.arrivalTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{bookingData.bus.duration}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Seat Details */}
                  <div>
                    <h4 className="font-semibold mb-2">Selected Seats</h4>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.seats.map((seat, idx) => (
                        <Badge key={idx} variant="secondary">
                          Seat {seat.id.split('-')[1]}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Base Fare ({bookingData.seats.length} × ${bookingData.bus.price})</span>
                      <span className="font-medium">${totalPrice}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium">$2</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-600">Taxes</span>
                      <span className="font-medium">${(totalPrice * 0.05).toFixed(2)}</span>
                    </div>
                    <Separator className="mb-3" />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-blue-600 text-2xl">
                        ${(totalPrice + 2 + totalPrice * 0.05).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleProceedToPayment}
                    disabled={!isFormValid()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Proceed to Payment
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    By proceeding, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
