import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Image,
  MapPin,
  FileText,
  ChevronRight,
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  Check,
  Calculator,
  Building2,
  Castle,
  Warehouse,
  Eye,
  Edit,
  MoreHorizontal,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompareModal from '@/components/property/CompareModal';

const steps = [
  { id: 1, title: 'Basics', icon: Home, description: 'Property details' },
  { id: 2, title: 'Media', icon: Image, description: 'Photos & videos' },
  { id: 3, title: 'Location', icon: MapPin, description: 'Address & map' },
  { id: 4, title: 'Documents', icon: FileText, description: 'Verification' },
];

const propertyTypes = [
  { value: 'apartment', label: 'Apartment', icon: Building2 },
  { value: 'villa', label: 'Villa', icon: Castle },
  { value: 'house', label: 'Independent House', icon: Home },
  { value: 'penthouse', label: 'Penthouse', icon: Warehouse },
];

// Mock user listings
const mockUserListings = [
  {
    id: 'my-1',
    title: '3BHK Apartment in Koramangala',
    status: 'active',
    views: 245,
    leads: 12,
    price: 15500000,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    listedAt: '2024-01-10',
  },
  {
    id: 'my-2',
    title: '2BHK Near Whitefield',
    status: 'draft',
    views: 0,
    leads: 0,
    price: 8500000,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    listedAt: '2024-01-18',
  },
];

// Mock leads
const mockLeads = [
  { id: 1, name: 'Rahul Sharma', phone: '+91 98765 43210', property: '3BHK Apartment', date: '2024-01-20', status: 'new' },
  { id: 2, name: 'Priya Patel', phone: '+91 87654 32109', property: '3BHK Apartment', date: '2024-01-19', status: 'contacted' },
  { id: 3, name: 'Amit Kumar', phone: '+91 76543 21098', property: '3BHK Apartment', date: '2024-01-18', status: 'interested' },
];

const SellerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('new-listing');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: '',
    bhk: '',
    bathrooms: '',
    sqft: '',
    floor: '',
    totalFloors: '',
    facing: '',
    propertyAge: '',
    furnishing: '',
    price: '',
    locality: '',
    city: '',
    address: '',
    pincode: '',
    images: [] as string[],
  });

  const progress = (currentStep / steps.length) * 100;

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Price Estimator Logic
  const estimatedPrice = React.useMemo(() => {
    const basePrice = 5000; // per sqft base
    const sqft = parseInt(formData.sqft) || 0;
    const bhk = parseInt(formData.bhk) || 0;
    
    if (!sqft) return 0;
    
    let pricePerSqft = basePrice;
    
    // Adjust for locality (mock adjustment)
    const localityMultiplier: Record<string, number> = {
      'koramangala': 1.5,
      'indiranagar': 1.6,
      'whitefield': 1.1,
      'hsr': 1.3,
    };
    pricePerSqft *= localityMultiplier[formData.locality.toLowerCase()] || 1;
    
    // Adjust for BHK
    pricePerSqft += bhk * 200;
    
    // Adjust for property type
    if (formData.propertyType === 'villa') pricePerSqft *= 1.3;
    if (formData.propertyType === 'penthouse') pricePerSqft *= 1.5;
    
    return sqft * pricePerSqft;
  }, [formData.sqft, formData.bhk, formData.locality, formData.propertyType]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Property Type */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Property Type</Label>
              <RadioGroup
                value={formData.propertyType}
                onValueChange={(value) => handleInputChange('propertyType', value)}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {propertyTypes.map(({ value, label, icon: Icon }) => (
                  <div key={value}>
                    <RadioGroupItem value={value} id={value} className="peer sr-only" />
                    <Label
                      htmlFor={value}
                      className="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary"
                    >
                      <Icon className="h-8 w-8 mb-2 text-muted-foreground peer-data-[state=checked]:text-primary" />
                      <span className="text-sm font-medium">{label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                placeholder="e.g., Luxurious 3BHK with City View"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your property in detail..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            {/* BHK & Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>BHK Configuration</Label>
                <Select value={formData.bhk} onValueChange={(v) => handleInputChange('bhk', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select BHK" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} BHK</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Select value={formData.bathrooms} onValueChange={(v) => handleInputChange('bathrooms', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Area & Floor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sqft">Super Built-up Area (sqft)</Label>
                <Input
                  id="sqft"
                  type="number"
                  placeholder="e.g., 1200"
                  value={formData.sqft}
                  onChange={(e) => handleInputChange('sqft', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Floor"
                    value={formData.floor}
                    onChange={(e) => handleInputChange('floor', e.target.value)}
                  />
                  <span className="flex items-center text-muted-foreground">of</span>
                  <Input
                    type="number"
                    placeholder="Total"
                    value={formData.totalFloors}
                    onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Facing & Age */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facing</Label>
                <Select value={formData.facing} onValueChange={(v) => handleInputChange('facing', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Property Age</Label>
                <Select value={formData.propertyAge} onValueChange={(v) => handleInputChange('propertyAge', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">New Construction</SelectItem>
                    <SelectItem value="1">Less than 1 year</SelectItem>
                    <SelectItem value="3">1-3 years</SelectItem>
                    <SelectItem value="5">3-5 years</SelectItem>
                    <SelectItem value="10">5-10 years</SelectItem>
                    <SelectItem value="15">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Furnishing */}
            <div className="space-y-2">
              <Label>Furnishing Status</Label>
              <RadioGroup
                value={formData.furnishing}
                onValueChange={(value) => handleInputChange('furnishing', value)}
                className="flex gap-4"
              >
                {['unfurnished', 'semi-furnished', 'fully-furnished'].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <RadioGroupItem value={status} id={status} />
                    <Label htmlFor={status} className="capitalize cursor-pointer">
                      {status.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Price with Estimator */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Asking Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 15000000"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
              </div>
              
              {estimatedPrice > 0 && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      <span className="font-medium">Price Estimator</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Based on your inputs, similar properties are priced around:
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(estimatedPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ₹{Math.round(estimatedPrice / parseInt(formData.sqft || '1')).toLocaleString()}/sqft
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <Label className="text-base font-medium">Property Photos</Label>
              <p className="text-sm text-muted-foreground">
                Upload high-quality photos. First image will be the cover photo.
              </p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-secondary/50 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-1">Drag & drop photos here</h4>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Photos
              </Button>
            </div>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center relative group"
                >
                  <Image className="h-8 w-8 text-muted-foreground" />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {i === 1 && (
                    <Badge className="absolute top-2 left-2 text-xs">Cover</Badge>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: Properties with 5+ high-quality photos get 3x more inquiries
            </p>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locality">Locality</Label>
                <Input
                  id="locality"
                  placeholder="e.g., Koramangala"
                  value={formData.locality}
                  onChange={(e) => handleInputChange('locality', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., Bangalore"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                placeholder="Building name, street, landmarks..."
                rows={3}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                placeholder="e.g., 560034"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                className="max-w-[200px]"
              />
            </div>

            {/* Map Placeholder */}
            <div className="space-y-2">
              <Label>Pin Location on Map</Label>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Map Picker Placeholder</p>
                  <p className="text-xs text-muted-foreground mt-1">Leaflet.js integration ready</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <Label className="text-base font-medium">Verification Documents</Label>
              <p className="text-sm text-muted-foreground">
                Upload documents to get the "Verified" badge and build buyer trust.
              </p>
            </div>

            {/* Document Upload Cards */}
            {[
              { title: 'Property Title Deed', desc: 'Proof of ownership', required: true },
              { title: 'RERA Certificate', desc: 'If applicable', required: false },
              { title: 'Encumbrance Certificate', desc: 'Last 30 years', required: false },
              { title: 'Tax Receipts', desc: 'Latest property tax paid', required: false },
            ].map((doc, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{doc.title}</h4>
                      {doc.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{doc.desc}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </Card>
            ))}

            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-medium text-success">Verification Benefits</h4>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• Get the trusted "Verified Owner" badge</li>
                    <li>• Appear higher in search results</li>
                    <li>• Receive 5x more genuine inquiries</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CompareModal />

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-muted-foreground mb-8">
            List your property and connect with buyers directly
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="new-listing" className="gap-2">
                <Plus className="h-4 w-4" />
                New Listing
              </TabsTrigger>
              <TabsTrigger value="my-listings" className="gap-2">
                <Home className="h-4 w-4" />
                My Listings
              </TabsTrigger>
              <TabsTrigger value="leads" className="gap-2">
                <Users className="h-4 w-4" />
                Leads
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new-listing">
              <Card>
                <CardHeader>
                  <CardTitle>List Your Property</CardTitle>
                  <CardDescription>
                    Complete all steps to publish your listing
                  </CardDescription>
                  
                  {/* Progress */}
                  <div className="pt-4">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between mt-4">
                      {steps.map((step) => (
                        <div
                          key={step.id}
                          className={`flex flex-col items-center cursor-pointer ${
                            step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                          }`}
                          onClick={() => setCurrentStep(step.id)}
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            step.id < currentStep
                              ? 'bg-primary border-primary text-primary-foreground'
                              : step.id === currentStep
                              ? 'border-primary text-primary'
                              : 'border-muted'
                          }`}>
                            {step.id < currentStep ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <step.icon className="h-5 w-5" />
                            )}
                          </div>
                          <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <AnimatePresence mode="wait">
                    {renderStepContent()}
                  </AnimatePresence>

                  <Separator className="my-6" />

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    {currentStep < steps.length ? (
                      <Button onClick={nextStep}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button className="gap-2">
                        <Check className="h-4 w-4" />
                        Publish Listing
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-listings">
              <div className="space-y-4">
                {mockUserListings.map((listing) => (
                  <Card key={listing.id} className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{listing.title}</h3>
                            <p className="text-lg font-bold text-primary mt-1">
                              {formatPrice(listing.price)}
                            </p>
                          </div>
                          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                            {listing.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {listing.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {listing.leads} leads
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="leads">
              <Card>
                <CardHeader>
                  <CardTitle>Interested Buyers</CardTitle>
                  <CardDescription>
                    People who have shown interest in your properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <h4 className="font-medium">{lead.name}</h4>
                          <p className="text-sm text-muted-foreground">{lead.phone}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Interested in: {lead.property}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              lead.status === 'new' ? 'default' :
                              lead.status === 'contacted' ? 'secondary' : 'outline'
                            }
                          >
                            {lead.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">{lead.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
