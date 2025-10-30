"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BusNavigation } from "@/components/BusNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Mail, ArrowRight, MapPin, Clock, Calendar, User } from "lucide-react";

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    if (bookingId) {
      const bookings = localStorage.getItem("completedBookings");
      if (bookings) {
        const allBookings = JSON.parse(bookings);
        const foundBooking = allBookings.find((b: any) => b.bookingId === bookingId);
        setBooking(foundBooking);
      }
    }
  }, [bookingId]);

  const handleDownloadTicket = () => {
    alert("Ticket download functionality would be implemented here. Your ticket has been sent to your email.");
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusNavigation />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const totalPrice = booking.seats.reduce((sum: number, seat: any) => sum + seat.price, 0);
  const finalAmount = (totalPrice + 2 + totalPrice * 0.05).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50">
      <BusNavigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">Your bus ticket has been booked successfully</p>
          <div className="mt-4">
            <Badge className="text-lg px-4 py-2 bg-blue-600">
              Booking ID: {booking.bookingId}
            </Badge>
          </div>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl">Journey Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Route */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">From</p>
                <p className="text-2xl font-bold">{booking.from}</p>
              </div>
              <ArrowRight className="h-8 w-8 text-gray-400 mx-4" />
              <div className="flex-1 text-right">
                <p className="text-sm text-gray-600 mb-1">To</p>
                <p className="text-2xl font-bold">{booking.to}</p>
              </div>
            </div>

            <Separator />

            {/* Bus Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Bus Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="w-32 text-sm text-gray-600">Operator:</div>
                    <div className="font-medium">{booking.bus.name}</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-32 text-sm text-gray-600">Bus Type:</div>
                    <div className="font-medium">{booking.bus.type}</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-32 text-sm text-gray-600">Departure:</div>
                    <div className="font-medium">{booking.bus.departureTime}</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-32 text-sm text-gray-600">Arrival:</div>
                    <div className="font-medium">{booking.bus.arrivalTime}</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-32 text-sm text-gray-600">Duration:</div>
                    <div className="font-medium">{booking.bus.duration}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Journey Date</h3>
                <div className="flex items-center text-lg font-medium mb-4">
                  <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                  {booking.date}
                </div>
                <h3 className="font-semibold text-lg mb-3">Seats</h3>
                <div className="flex flex-wrap gap-2">
                  {booking.seats.map((seat: any, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-base px-3 py-1">
                      {seat.id.split('-')[1]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Passenger Details */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Passenger Details</h3>
              <div className="space-y-3">
                {booking.passengers.map((passenger: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-gray-600" />
                        <div>
                          <p className="font-medium">{passenger.name}</p>
                          <p className="text-sm text-gray-600">
                            {passenger.age} years • {passenger.gender}
                          </p>
                        </div>
                      </div>
                      <Badge>Seat {booking.seats[idx].id.split('-')[1]}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">{booking.contactEmail}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">📱 {booking.contactPhone}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Ticket confirmation has been sent to your email address
                </p>
              </div>
            </div>

            <Separator />

            {/* Payment Details */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Base Fare ({booking.seats.length} seats)</span>
                  <span className="font-medium">${totalPrice}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">$2</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Taxes (5%)</span>
                  <span className="font-medium">${(totalPrice * 0.05).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Paid</span>
                  <span className="text-green-600 text-2xl">${finalAmount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <Badge variant="outline">{booking.paymentMethod.replace('-', ' ').toUpperCase()}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={handleDownloadTicket}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Ticket
          </Button>
          <Button
            onClick={() => router.push("/my-bookings")}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            View All Bookings
          </Button>
        </div>

        {/* Info Box */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Important Information:</h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Please arrive at the boarding point 15 minutes before departure</li>
              <li>Carry a valid ID proof and this ticket (printed or digital)</li>
              <li>Cancellation charges apply as per the operator's policy</li>
              <li>For any queries, contact customer support with your booking ID</li>
            </ul>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button onClick={() => router.push("/")} variant="link" size="lg">
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
