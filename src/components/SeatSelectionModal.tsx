"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bus, generateSeats, Seat } from "@/lib/busData";
import { Armchair } from "lucide-react";

interface SeatSelectionModalProps {
  bus: Bus;
  open: boolean;
  onClose: () => void;
  searchParams: {
    from: string;
    to: string;
    date: string;
    passengers: string;
  };
}

export function SeatSelectionModal({ bus, open, onClose, searchParams }: SeatSelectionModalProps) {
  const router = useRouter();
  const [seats, setSeats] = useState<Seat[]>(() => generateSeats(bus.id, bus.price));
  const maxPassengers = parseInt(searchParams.passengers);

  const selectedSeats = seats.filter(seat => seat.status === "selected");

  const handleSeatClick = (seatId: string) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => {
        if (seat.id === seatId) {
          if (seat.status === "booked") return seat;
          
          // If trying to select and already at max passengers
          if (seat.status === "available" && selectedSeats.length >= maxPassengers) {
            return seat;
          }
          
          return {
            ...seat,
            status: seat.status === "selected" ? "available" : "selected"
          };
        }
        return seat;
      })
    );
  };

  const handleProceed = () => {
    if (selectedSeats.length > 0) {
      const bookingData = {
        bus: bus,
        seats: selectedSeats,
        from: searchParams.from,
        to: searchParams.to,
        date: searchParams.date,
      };
      localStorage.setItem("currentBooking", JSON.stringify(bookingData));
      router.push("/booking");
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const getSeatClassName = (seat: Seat) => {
    const baseClasses = "w-10 h-10 rounded-t-lg border-2 transition-all cursor-pointer flex items-center justify-center";
    
    if (seat.status === "booked") {
      return `${baseClasses} bg-gray-300 border-gray-400 cursor-not-allowed`;
    }
    if (seat.status === "selected") {
      return `${baseClasses} bg-blue-500 border-blue-600 text-white hover:bg-blue-600`;
    }
    return `${baseClasses} bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400`;
  };

  // Group seats by row
  const rows = Array.from({ length: 10 }, (_, rowIdx) => 
    seats.filter(seat => seat.row === rowIdx)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select Your Seats</DialogTitle>
          <DialogDescription>
            {bus.name} - {bus.type} | {searchParams.from} → {searchParams.to}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-t-lg"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 border-2 border-blue-600 rounded-t-lg"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 border-2 border-gray-400 rounded-t-lg"></div>
              <span className="text-sm">Booked</span>
            </div>
          </div>

          {/* Seat Layout */}
          <div className="border rounded-lg p-6 bg-gradient-to-b from-gray-50 to-white">
            <div className="mb-4 text-center">
              <div className="inline-block bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold">
                Driver
              </div>
            </div>
            
            <div className="space-y-3">
              {rows.map((rowSeats, rowIdx) => (
                <div key={rowIdx} className="flex items-center justify-center gap-8">
                  {/* Left side (2 seats) */}
                  <div className="flex gap-2">
                    {rowSeats.slice(0, 2).map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat.id)}
                        disabled={seat.status === "booked"}
                        className={getSeatClassName(seat)}
                        title={`Seat ${seat.row * 4 + seat.column + 1}`}
                      >
                        <Armchair className="h-5 w-5" />
                      </button>
                    ))}
                  </div>

                  {/* Aisle */}
                  <div className="w-8 text-center text-xs text-gray-400">
                    {rowIdx + 1}
                  </div>

                  {/* Right side (2 seats) */}
                  <div className="flex gap-2">
                    {rowSeats.slice(2, 4).map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat.id)}
                        disabled={seat.status === "booked"}
                        className={getSeatClassName(seat)}
                        title={`Seat ${seat.row * 4 + seat.column + 1}`}
                      >
                        <Armchair className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Selected Seats:</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {selectedSeats.length} / {maxPassengers}
              </Badge>
            </div>
            {selectedSeats.length > 0 && (
              <div className="text-sm text-gray-700 mb-2">
                Seat Numbers: {selectedSeats.map(s => s.id.split('-')[1]).join(", ")}
              </div>
            )}
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-blue-600 text-2xl">${totalPrice}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleProceed} 
              disabled={selectedSeats.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Proceed to Booking ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
