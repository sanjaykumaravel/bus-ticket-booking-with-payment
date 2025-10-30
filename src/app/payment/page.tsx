"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BusNavigation } from "@/components/BusNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Smartphone, Lock, ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [processing, setProcessing] = useState(false);

  // Credit Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // UPI fields
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    const data = localStorage.getItem("currentBooking");
    if (data) {
      setBookingData(JSON.parse(data));
    } else {
      router.push("/");
    }
  }, [router]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const isPaymentFormValid = () => {
    if (paymentMethod === "credit-card" || paymentMethod === "debit-card") {
      return (
        cardNumber.replace(/\s/g, "").length === 16 &&
        cardName.trim() &&
        expiryDate.length === 5 &&
        cvv.length === 3
      );
    }
    if (paymentMethod === "upi") {
      return upiId.trim() && upiId.includes("@");
    }
    return false;
  };

  const handlePayment = async () => {
    if (!isPaymentFormValid()) return;

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const bookingId = "BG" + Date.now().toString().slice(-8);
      const completedBooking = {
        ...bookingData,
        bookingId,
        paymentMethod,
        paymentStatus: "completed",
        bookingDate: new Date().toISOString(),
      };

      // Save to completed bookings
      const existingBookings = localStorage.getItem("completedBookings");
      const bookings = existingBookings ? JSON.parse(existingBookings) : [];
      bookings.push(completedBooking);
      localStorage.setItem("completedBookings", JSON.stringify(bookings));

      // Clear current booking
      localStorage.removeItem("currentBooking");

      // Redirect to confirmation
      router.push(`/confirmation?bookingId=${bookingId}`);
    }, 2000);
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

  const totalPrice = bookingData.seats.reduce((sum: number, seat: any) => sum + seat.price, 0);
  const finalAmount = (totalPrice + 2 + totalPrice * 0.05).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50">
      <BusNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600 mt-1">Choose your preferred payment method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-green-600" />
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="credit-card">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit Card
                    </TabsTrigger>
                    <TabsTrigger value="debit-card">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Debit Card
                    </TabsTrigger>
                    <TabsTrigger value="upi">
                      <Smartphone className="h-4 w-4 mr-2" />
                      UPI
                    </TabsTrigger>
                  </TabsList>

                  {/* Credit Card */}
                  <TabsContent value="credit-card" className="space-y-4 mt-6">
                    <div>
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 16) {
                            setCardNumber(formatCardNumber(value));
                          }
                        }}
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-name">Cardholder Name</Label>
                      <Input
                        id="card-name"
                        placeholder="JOHN DOE"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 4) {
                              setExpiryDate(formatExpiryDate(value));
                            }
                          }}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 3) {
                              setCvv(value);
                            }
                          }}
                          maxLength={3}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>Your payment information is encrypted and secure</span>
                    </div>
                  </TabsContent>

                  {/* Debit Card */}
                  <TabsContent value="debit-card" className="space-y-4 mt-6">
                    <div>
                      <Label htmlFor="debit-card-number">Card Number</Label>
                      <Input
                        id="debit-card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 16) {
                            setCardNumber(formatCardNumber(value));
                          }
                        }}
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <Label htmlFor="debit-card-name">Cardholder Name</Label>
                      <Input
                        id="debit-card-name"
                        placeholder="JOHN DOE"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="debit-expiry">Expiry Date</Label>
                        <Input
                          id="debit-expiry"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 4) {
                              setExpiryDate(formatExpiryDate(value));
                            }
                          }}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="debit-cvv">CVV</Label>
                        <Input
                          id="debit-cvv"
                          type="password"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 3) {
                              setCvv(value);
                            }
                          }}
                          maxLength={3}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>Your payment information is encrypted and secure</span>
                    </div>
                  </TabsContent>

                  {/* UPI */}
                  <TabsContent value="upi" className="space-y-4 mt-6">
                    <div>
                      <Label htmlFor="upi-id">UPI ID</Label>
                      <Input
                        id="upi-id"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your UPI ID (e.g., yourname@paytm, yourname@googlepay)
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <p className="font-medium text-sm">How it works:</p>
                      <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                        <li>Enter your UPI ID</li>
                        <li>You'll receive a payment request on your UPI app</li>
                        <li>Approve the payment in your app</li>
                        <li>Your booking will be confirmed instantly</li>
                      </ol>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>UPI payments are secure and instant</span>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handlePayment}
                  disabled={!isPaymentFormValid() || processing}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {processing ? (
                    <>Processing Payment...</>
                  ) : (
                    <>
                      Pay ${finalAmount}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">{bookingData.from}</span>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                      <span className="font-semibold text-lg">{bookingData.to}</span>
                    </div>
                    <p className="text-sm text-gray-600">{bookingData.date}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="font-medium mb-1">{bookingData.bus.name}</p>
                    <p className="text-sm text-gray-600">{bookingData.bus.type}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium mb-2">Passengers: {bookingData.passengers.length}</p>
                    <div className="space-y-1">
                      {bookingData.passengers.map((passenger: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center justify-between">
                          <span>{passenger.name}</span>
                          <Badge variant="outline">Seat {bookingData.seats[idx].id.split('-')[1]}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Base Fare</span>
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
                      <span>Total</span>
                      <span className="text-blue-600 text-2xl">${finalAmount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
