"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BusNavigation } from "@/components/BusNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowRight, Calendar, Clock, Ticket, Trash2, Eye } from "lucide-react";

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    const data = localStorage.getItem("completedBookings");
    if (data) {
      const allBookings = JSON.parse(data);
      // Sort by booking date, newest first
      const sorted = allBookings.sort((a: any, b: any) => 
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );
      setBookings(sorted);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      const updatedBookings = bookings.filter(b => b.bookingId !== bookingToCancel);
      localStorage.setItem("completedBookings", JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    }
  };

  const getBookingStatus = (booking: any) => {
    const journeyDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (journeyDate < today) {
      return { label: "Completed", variant: "secondary" as const };
    } else if (journeyDate.toDateString() === today.toDateString()) {
      return { label: "Today", variant: "default" as const };
    } else {
      return { label: "Upcoming", variant: "default" as const };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BusNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your bus ticket bookings</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">Start your journey by booking your first bus ticket</p>
              <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
                Book Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const status = getBookingStatus(booking);
              const totalPrice = booking.seats.reduce((sum: number, seat: any) => sum + seat.price, 0);
              const finalAmount = (totalPrice + 2 + totalPrice * 0.05).toFixed(2);
              const isPastBooking = status.label === "Completed";

              return (
                <Card key={booking.bookingId} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-blue-600">{booking.bookingId}</Badge>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-4 mb-4">
                          <div>
                            <p className="text-2xl font-bold">{booking.from}</p>
                          </div>
                          <ArrowRight className="h-6 w-6 text-gray-400" />
                          <div>
                            <p className="text-2xl font-bold">{booking.to}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {booking.date}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {booking.bus.departureTime} - {booking.bus.arrivalTime}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Ticket className="h-4 w-4 mr-2" />
                            {booking.seats.length} {booking.seats.length === 1 ? 'Seat' : 'Seats'}
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Bus: </span>
                            <span className="font-medium">{booking.bus.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Type: </span>
                            <span className="font-medium">{booking.bus.type}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Seats: </span>
                            <span className="font-medium">
                              {booking.seats.map((s: any) => s.id.split('-')[1]).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex flex-col items-end justify-between h-full space-y-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                          <p className="text-3xl font-bold text-blue-600">${finalAmount}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <Button
                            onClick={() => router.push(`/confirmation?bookingId=${booking.bookingId}`)}
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {!isPastBooking && (
                            <Button
                              onClick={() => handleCancelBooking(booking.bookingId)}
                              variant="destructive"
                              className="w-full sm:w-auto"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone. 
              Cancellation charges may apply as per the operator's policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelBooking}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
