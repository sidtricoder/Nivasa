import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Scale,
  MapPin,
  Bed,
  Bath,
  Square,
  Building,
  Compass,
  Calendar,
  Sofa,
  Shield,
  FileCheck,
  Award,
  Phone,
  MessageCircle,
  Clock,
  Star,
  School,
  Hospital,
  Train,
  ShoppingBag,
  TreePine,
  Utensils,
  X,
  Check,
  ChevronDown,
  Loader2,
  AlertTriangle,
  Wand2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompareModal from '@/components/property/CompareModal';
import { WhatsAppButton } from '@/components/communication';
import FirebaseChatDrawer from '@/components/communication/FirebaseChatDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { useMessageStore } from '@/stores/messageStore';
import { PropertyViewsTracker, PriceTrendsChart, LocalityInsights } from '@/components/analytics';
import { PropertyBrochure } from '@/components/pdf';
import AmenitiesDisplay from '@/components/property/AmenitiesDisplay';
import VastuComplianceBadge from '@/components/property/VastuComplianceBadge';
import GaussianSplatViewer from '@/components/property/GaussianSplatViewer';
import Interactive360Panorama from '@/components/property/Interactive360Panorama';
import Panoee3DTour from '@/components/property/Panoee3DTour';
import GoogleMapEmbed from '@/components/property/GoogleMapEmbed';
import GoogleStreetView from '@/components/property/GoogleStreetView';
import PropertyChatbot from '@/components/property/PropertyChatbot';
import VirtualStagingModal from '@/components/property/VirtualStagingModal';
import NeighborhoodDashboard from '@/components/property/NeighborhoodDashboard';
import { mockListings, Property } from '@/data/listings';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn, } from '@/lib/utils';
import { format } from 'date-fns';
import { getProperty } from '@/services/firestoreService';

const nearbyTypeIcons: Record<string, React.ComponentType<any>> = {
  school: School,
  hospital: Hospital,
  metro: Train,
  mall: ShoppingBag,
  park: TreePine,
  restaurant: Utensils,
};

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams();
  const { toggleFavorite, isFavorite, toggleCompare, isInCompare, compareList } = useFavorites();
  const { startConversation } = useMessageStore();
  const { currentUser } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStagingOpen, setIsStagingOpen] = useState(false);
  const [stagingImage, setStagingImage] = useState<string>('');

  // Fetch property from mockListings or Firebase
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // First check mockListings
        const mockProperty = mockListings.find(p => p.id === id);
        if (mockProperty) {
          setProperty(mockProperty);
          setLoading(false);
          return;
        }

        // If not in mockListings, fetch from Firebase
        const firebaseProperty = await getProperty(id);
        setProperty(firebaseProperty);
      } catch (error) {
        console.error('Error fetching property:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/discover">
            <Button>Browse Properties</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  const canAddToCompare = compareList.length < 3 || isInCompare(property.id);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CompareModal />
      
      {/* AI Property Chatbot */}
      <PropertyChatbot property={property} />

      {/* Firebase Chat Drawer */}
      <FirebaseChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        propertyId={property.id}
        sellerId={property.seller.id}
        sellerName={property.seller.name}
        propertyTitle={property.title}
      />

      <main className="container py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/discover" className="hover:text-primary">Properties</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate max-w-[200px]">{property.title}</span>
        </nav>

        {/* Image Gallery */}
        <section className="mb-8">
          <div className="relative rounded-xl overflow-hidden">
            {/* Main Image */}
            <div
              className="aspect-[16/9] md:aspect-[21/9] cursor-pointer"
              onClick={() => setIsGalleryOpen(true)}
            >
              <img
                src={property.images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Thumbnails */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {property.images.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                  className={cn(
                    "w-16 h-12 rounded-md overflow-hidden border-2 transition-all",
                    index === currentImageIndex
                      ? "border-primary"
                      : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className={cn("gap-2", isFavorite(property.id) && "text-destructive")}
                onClick={() => toggleFavorite(property.id)}
              >
                <Heart className={cn("h-4 w-4", isFavorite(property.id) && "fill-current")} />
                Save
              </Button>
              {canAddToCompare && (
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn("gap-2", isInCompare(property.id) && "text-primary")}
                  onClick={() => toggleCompare(property.id)}
                >
                  <Scale className="h-4 w-4" />
                  Compare
                </Button>
              )}
              <Button variant="secondary" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {property.isNewListing && (
                <Badge className="bg-primary text-primary-foreground">New Listing</Badge>
              )}
              {property.verification.ownerVerified && (
                <Badge className="bg-success text-success-foreground gap-1">
                  <Shield className="h-3 w-3" />
                  Verified Owner
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Price */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{property.location.address}, {property.location.locality}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ₹{property.pricePerSqft.toLocaleString()}/sqft
                  </p>
                  <PropertyViewsTracker propertyId={property.id} variant="inline" className="justify-end mt-2" />
                </div>
              </div>

              {/* Key Specs */}
              <div className="flex flex-wrap gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{property.specs.bhk} BHK</p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{property.specs.bathrooms}</p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{property.specs.sqft} sqft</p>
                    <p className="text-xs text-muted-foreground">Super Built-up</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{property.specs.floor}/{property.specs.totalFloors}</p>
                    <p className="text-xs text-muted-foreground">Floor</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{property.specs.facing}</p>
                    <p className="text-xs text-muted-foreground">Facing</p>
                  </div>
                </div>
              </div>
              
              {/* Vastu Compliance Badge */}
              <div className="mt-4">
                <VastuComplianceBadge 
                  status="compliant" 
                  facing={property.specs.facing} 
                  variant="badge"
                />
              </div>
            </div>

            {/* Immersive View Tabs */}
            <Card>
              <Tabs defaultValue="photos">
                <CardHeader>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                    <TabsTrigger value="virtual-staging" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      Virtual Staging
                    </TabsTrigger>
                    <TabsTrigger value="street-view">Street View</TabsTrigger>
                    <TabsTrigger value="3d-tour">3D Tour</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="photos" className="mt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {property.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt=""
                            className="w-full aspect-[4/3] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => { setCurrentImageIndex(index); setIsGalleryOpen(true); }}
                          />
                          {/* Stage Room Button - Appears on Hover */}
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            whileHover={{ scale: 1.05 }}
                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-[#3B7BFF] text-white text-xs font-medium rounded-lg shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStagingImage(img);
                              setIsStagingOpen(true);
                            }}
                          >
                            <Wand2 className="h-3 w-3" />
                            Stage Room
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="virtual-staging" className="mt-0">
                    <div className="aspect-video bg-gradient-to-br from-[#F0EEE9] to-white dark:from-slate-900 dark:to-slate-800 rounded-xl flex items-center justify-center border border-[#E5E7EB] dark:border-slate-700">
                      <div className="text-center p-8 max-w-md">
                        <motion.div 
                          className="w-20 h-20 rounded-full bg-[#3B7BFF]/10 flex items-center justify-center mx-auto mb-6"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Wand2 className="h-10 w-10 text-[#3B7BFF]" />
                        </motion.div>
                        <h3 className="font-semibold text-xl mb-3 text-[#2B2F36] dark:text-slate-50">
                          Virtual Staging
                        </h3>
                        <p className="text-[#6B7280] dark:text-slate-400 text-sm mb-6">
                          Transform empty rooms into beautifully furnished spaces with AI. 
                          Choose from Modern, Traditional, Minimal, Scandinavian, or Bohemian styles.
                        </p>
                        <Button 
                          className="gap-2 bg-[#3B7BFF] hover:bg-[#3B7BFF]/90 text-white shadow-[0_4px_14px_rgba(59,123,255,0.3)]"
                          onClick={() => {
                            setStagingImage(property.images[0]);
                            setIsStagingOpen(true);
                          }}
                        >
                          <Sparkles className="h-4 w-4" />
                          Start Staging
                        </Button>
                        <p className="text-xs text-[#6B7280] mt-4">
                          Or hover over any photo and click "Stage Room"
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="street-view" className="mt-0">
                    <GoogleStreetView 
                      coordinates={property.location.coordinates}
                      address={`${property.location.address}, ${property.location.locality}, ${property.location.city}`}
                      title="Street View"
                    />
                  </TabsContent>
                  <TabsContent value="3d-tour" className="mt-0">
                    {property.panoee3DTourUrl ? (
                      <Panoee3DTour 
                        tourUrl={property.panoee3DTourUrl}
                        title={`${property.title} - Virtual Tour`}
                      />
                    ) : (
                      <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                        <div className="text-center p-6">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <MapPin className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">3D Tour Not Available</h3>
                          <p className="text-muted-foreground text-sm max-w-md">
                            This property doesn't have a virtual tour yet. Contact the seller to request one!
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>

            {/* Virtual Staging Modal */}
            <VirtualStagingModal
              isOpen={isStagingOpen}
              onClose={() => setIsStagingOpen(false)}
              image={stagingImage || property.images[0]}
              allImages={property.images}
              propertyTitle={property.title}
            />

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-medium mb-3">Property Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Age</span>
                        <span>{property.specs.propertyAge} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Furnishing</span>
                        <span className="capitalize">{property.specs.furnishing.replace('-', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Type</span>
                        <span className="capitalize">{property.specs.propertyType}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Verification Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Owner Verified</span>
                        {property.verification.ownerVerified ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Documents Ready</span>
                        {property.verification.documentsReady ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">RERA Approved</span>
                        {property.verification.reraApproved ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Amenities
                  <Badge variant="secondary">{property.amenities.length} amenities</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AmenitiesDisplay 
                  amenities={property.amenities} 
                  variant="grid"
                  maxVisible={16}
                />
              </CardContent>
            </Card>

            {/* Location & Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Neighborhood</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Google Map */}
                <GoogleMapEmbed 
                  coordinates={property.location.coordinates}
                  address={`${property.location.address}, ${property.location.locality}, ${property.location.city}`}
                  title={property.title}
                />

                {/* Neighborhood Intelligence Dashboard - Real-time scores from Overpass API */}
                <NeighborhoodDashboard 
                  coordinates={property.location.coordinates}
                  fallbackData={property.nearbyPlaces}
                />
              </CardContent>
            </Card>

            {/* Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Property Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {property.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Things to Consider */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Things to Consider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {property.thingsToConsider.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Seller Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {property.seller.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{property.seller.name}</h3>
                      {property.seller.isVerified && (
                        <Shield className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Property Owner</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-lg font-semibold text-primary">{property.seller.responseRate}%</p>
                    <p className="text-xs text-muted-foreground">Response Rate</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-lg font-semibold text-primary">
                      {new Date(property.seller.memberSince).getFullYear()}
                    </p>
                    <p className="text-xs text-muted-foreground">Member Since</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="gap-2"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with Seller
                  </Button>

                  <WhatsAppButton
                    phoneNumber={property.seller.phone}
                    propertyTitle={property.title}
                    propertyPrice={formatPrice(property.price)}
                    propertyLocation={`${property.location.locality}, ${property.location.city}`}
                    variant="inline"
                    size="md"
                  />
                </div>

                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setShowPhone(!showPhone)}
                  >
                    <Phone className="h-4 w-4" />
                    {showPhone ? property.seller.phone : 'Show Phone Number'}
                  </Button>
                </div>

                <Separator />

                {/* Appointment Scheduler */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Schedule a Visit</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Calendar className="h-4 w-4" />
                        {appointmentDate ? format(appointmentDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={appointmentDate}
                        onSelect={setAppointmentDate}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {appointmentDate && (
                    <Button className="w-full mt-2">
                      Confirm Appointment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* PDF Brochure Download */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Property Brochure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Download a detailed PDF brochure of this property to share or review offline.
                </p>
                <PropertyBrochure property={property} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Section */}
        <section className="mt-8 space-y-8">
          <h2 className="text-2xl font-bold text-foreground">Property Analytics</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <PriceTrendsChart 
              locality={property.location.locality} 
              currentPrice={property.price} 
            />
            <LocalityInsights 
              locality={property.location.locality}
              city={property.location.city}
              coordinates={property.location.coordinates}
            />
          </div>
        </section>
      </main>

      {/* Lightbox Gallery */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-5xl p-0 bg-background/95 backdrop-blur">
          <div className="relative">
            <img
              src={property.images[currentImageIndex]}
              alt=""
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
              {currentImageIndex + 1} / {property.images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PropertyDetailPage;
