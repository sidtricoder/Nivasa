import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Users,
  Loader2,
  X,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  uploadPropertyImages,
  compressImage,
  validateFile,
} from '@/services/cloudinaryService';
import {
  addProperty,
  getPropertiesBySeller,
  updateProperty,
  deleteProperty,
  PropertyLead,
  getLeadsBySeller,
} from '@/services/firestoreService';
import { Property } from '@/data/listings';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompareModal from '@/components/property/CompareModal';
import MapPicker from '@/components/property/MapPicker';
import FirebaseChatDrawer from '@/components/communication/FirebaseChatDrawer';
import FloorPlanUpload from '@/components/seller/FloorPlanUpload';
import { FloorPlanData } from '@/types/floorPlan';

const steps = [
  { id: 1, title: 'Basics', icon: Home, description: 'Property details' },
  { id: 2, title: 'Media', icon: Image, description: 'Photos & videos' },
  { id: 3, title: 'Location', icon: MapPin, description: 'Address & map' },
  { id: 4, title: 'Scores', icon: Calculator, description: 'Ratings & scores' },
  { id: 5, title: 'Details', icon: FileText, description: 'Highlights & nearby' },
];

const propertyTypes = [
  { value: 'apartment', label: 'Apartment', icon: Building2 },
  { value: 'villa', label: 'Villa', icon: Castle },
  { value: 'house', label: 'Independent House', icon: Home },
  { value: 'penthouse', label: 'Penthouse', icon: Warehouse },
];

const SellerDashboard: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Get tab from URL query param, default to 'new-listing'
  const tabFromUrl = searchParams.get('tab') || 'new-listing';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  // Update activeTab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['new-listing', 'my-listings', 'leads'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userListings, setUserListings] = useState<Property[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [leads, setLeads] = useState<PropertyLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  
  // Chat drawer state for messaging leads
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatBuyerId, setChatBuyerId] = useState<string>('');
  const [chatBuyerName, setChatBuyerName] = useState<string>('');
  const [chatPropertyId, setChatPropertyId] = useState<string>('');
  const [chatPropertyTitle, setChatPropertyTitle] = useState<string>('');
  
  // Image files state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  
  // 360° Panorama images state
  const [panoramaUrls, setPanoramaUrls] = useState<string[]>([]);
  const [panoramaUrlInput, setPanoramaUrlInput] = useState('');
  
  // Floor plan state
  const [floorPlanImage, setFloorPlanImage] = useState<string | null>(null);
  const [floorPlanData, setFloorPlanData] = useState<FloorPlanData | null>(null);
  
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
    blockNumber: '',
    road: '',
    society: '',
    locality: '',
    city: '',
    address: '',
    pincode: '',
    state: '',
    amenities: [] as string[],
    features: [] as string[],
    walkScore: '',
    safetyScore: '',
    connectivityScore: '',
    lifestyleScore: '',
    highlights: [] as string[],
    thingsToConsider: [] as string[],
    nearbyPlaces: [] as { type: string; name: string; distance: string }[],
    isPetFriendly: false,
    hasParking: false,
    coordinates: { lat: 0, lng: 0 },
    sellerPhone: '',
    panoramaImages: [] as string[],
  });

  const progress = (currentStep / steps.length) * 100;

  // Load user's listings on mount
  useEffect(() => {
    if (currentUser && activeTab === 'my-listings') {
      loadUserListings();
    }
    if (currentUser && activeTab === 'leads') {
      loadUserListings(); // Load listings to show property names
      loadLeads();
    }
  }, [currentUser, activeTab]);

  const loadUserListings = async () => {
    if (!currentUser) return;
    
    setLoadingListings(true);
    try {
      const listings = await getPropertiesBySeller(currentUser.uid);
      setUserListings(listings);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load listings',
        variant: 'destructive',
      });
    } finally {
      setLoadingListings(false);
    }
  };

  const loadLeads = async () => {
    if (!currentUser) return;
    
    setLoadingLeads(true);
    try {
      const fetchedLeads = await getLeadsBySeller(currentUser.uid);
      setLeads(fetchedLeads);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load leads',
        variant: 'destructive',
      });
    } finally {
      setLoadingLeads(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle image selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    const previews: string[] = [];
    
    for (const file of files) {
      const validation = validateFile(file, 10);
      if (!validation.valid) {
        toast({
          title: 'Invalid file',
          description: validation.error,
          variant: 'destructive',
        });
        continue;
      }
      
      try {
        const compressed = await compressImage(file, 1920, 0.85);
        validFiles.push(compressed);
        previews.push(URL.createObjectURL(compressed));
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
    
    setSelectedFiles([...selectedFiles, ...validFiles]);
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
    setImagePreviews(previews => previews.filter((_, i) => i !== index));
  };

  const addImageUrl = () => {
    if (!urlInput.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid image URL',
        variant: 'destructive',
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
      if (!urlInput.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        toast({
          title: 'Invalid image URL',
          description: 'URL must point to an image file (.jpg, .png, .webp, .gif)',
          variant: 'destructive',
        });
        return;
      }
    } catch (e) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      });
      return;
    }

    setImageUrls(prev => [...prev, urlInput]);
    setImagePreviews(prev => [...prev, urlInput]);
    setUrlInput('');
  };

  const removeImageUrl = (index: number) => {
    const urlIndex = imagePreviews.slice(0, index + 1).filter(url => imageUrls.includes(url)).length - 1;
    setImageUrls(urls => urls.filter((_, i) => i !== urlIndex));
    setImagePreviews(previews => previews.filter((_, i) => i !== index));
  };

  // Submit property listing
  const handleSubmitProperty = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to post a property',
        variant: 'destructive',
      });
      return;
    }

    // Comprehensive validation
    const requiredFields = [
      { field: formData.title, name: 'Title' },
      { field: formData.description, name: 'Description' },
      { field: formData.propertyType, name: 'Property Type' },
      { field: formData.bhk, name: 'BHK' },
      { field: formData.bathrooms, name: 'Bathrooms' },
      { field: formData.sqft, name: 'Area' },
      { field: formData.floor, name: 'Floor' },
      { field: formData.totalFloors, name: 'Total Floors' },
      { field: formData.facing, name: 'Facing' },
      { field: formData.propertyAge, name: 'Property Age' },
      { field: formData.furnishing, name: 'Furnishing' },
      { field: formData.price, name: 'Price' },
      { field: formData.blockNumber, name: 'Block/House Number' },
      { field: formData.road, name: 'Road/Sector' },
      { field: formData.society, name: 'Society/Area Name' },
      { field: formData.locality, name: 'Locality' },
      { field: formData.city, name: 'City' },
      { field: formData.pincode, name: 'Pincode' },
      { field: formData.state, name: 'State' },
    ];

    const missingFields = requiredFields.filter(f => !f.field).map(f => f.name);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing required fields',
        description: `Please fill: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    if (formData.amenities.length === 0) {
      toast({
        title: 'Amenities required',
        description: 'Please add at least one amenity',
        variant: 'destructive',
      });
      return;
    }

    if (formData.highlights.length === 0) {
      toast({
        title: 'Highlights required',
        description: 'Please add at least one highlight',
        variant: 'destructive',
      });
      return;
    }

    if (formData.thingsToConsider.length === 0) {
      toast({
        title: 'Things to Consider required',
        description: 'Please add at least one point to consider',
        variant: 'destructive',
      });
      return;
    }

    if (formData.nearbyPlaces.length === 0) {
      toast({
        title: 'Nearby places required',
        description: 'Please add at least one nearby place',
        variant: 'destructive',
      });
      return;
    }

    if (formData.coordinates.lat === 0 || formData.coordinates.lng === 0) {
      toast({
        title: 'Location coordinates required',
        description: 'Please set the property location on the map',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFiles.length === 0 && imageUrls.length === 0 && !editingPropertyId) {
      toast({
        title: 'Images required',
        description: 'Please upload at least 3 images or add image URLs',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      let uploadedImageUrls: string[] = [];

      // Upload images to Cloudinary if new files selected
      if (selectedFiles.length > 0) {
        toast({
          title: 'Uploading images...',
          description: 'This may take a moment',
        });

        const tempPropertyId = editingPropertyId || 'prop-' + Date.now();
        uploadedImageUrls = await uploadPropertyImages(
          selectedFiles,
          tempPropertyId,
          (progress) => setUploadProgress(progress)
        );
      }

      // Combine uploaded images with URL-based images
      const allImageUrls = [...uploadedImageUrls, ...imageUrls];

      // Build complete address from structured fields
      const completeAddress = `${formData.blockNumber}, ${formData.road}, ${formData.society}`;

      // Debug floor plan data
      console.log('Floor Plan Data being saved:', floorPlanData);
      console.log('Floor Plan Image:', floorPlanImage ? 'Present' : 'Not present');

      const propertyData: Omit<Property, 'id'> = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        pricePerSqft: Math.round(parseFloat(formData.price) / parseFloat(formData.sqft || '1')),
        images: allImageUrls.length > 0 ? allImageUrls : (editingPropertyId ? userListings.find(p => p.id === editingPropertyId)?.images || [] : []),
        location: {
          address: completeAddress,
          locality: formData.locality,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          coordinates: formData.coordinates,
        },
        specs: {
          bhk: parseInt(formData.bhk),
          bathrooms: parseInt(formData.bathrooms),
          sqft: parseFloat(formData.sqft),
          floor: parseInt(formData.floor),
          totalFloors: parseInt(formData.totalFloors),
          facing: formData.facing,
          propertyAge: parseInt(formData.propertyAge),
          furnishing: (formData.furnishing as any),
          propertyType: (formData.propertyType as any),
        },
        amenities: formData.amenities,
        features: formData.features,
        seller: {
          id: currentUser.uid,
          name: userData?.displayName || currentUser.email || 'User',
          phone: formData.sellerPhone || userData?.phoneNumber || '',
          email: currentUser.email || '',
          isVerified: currentUser.emailVerified,
          memberSince: new Date().toISOString(),
          responseRate: 95,
        },
        verification: {
          ownerVerified: currentUser.emailVerified,
          documentsReady: true,
          reraApproved: false,
        },
        // Scores are computed by AI based on location - default to 0
        walkScore: 0,
        safetyScore: 0,
        connectivityScore: 0,
        lifestyleScore: 0,
        highlights: formData.highlights,
        thingsToConsider: formData.thingsToConsider,
        nearbyPlaces: formData.nearbyPlaces.map(place => ({
          type: place.type as any,
          name: place.name,
          distance: place.distance,
        })),
        isPetFriendly: formData.isPetFriendly,
        hasParking: formData.hasParking,
        isNewListing: true,
        listedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        panoramaImages: panoramaUrls.length > 0 ? panoramaUrls : undefined,
        floorPlan: floorPlanData || undefined,
      };

      if (editingPropertyId) {
        // Update existing property
        await updateProperty(editingPropertyId, propertyData);
        toast({
          title: 'Success!',
          description: 'Property updated successfully',
        });
      } else {
        // Add new property
        await addProperty(propertyData);
        toast({
          title: 'Success!',
          description: 'Property posted successfully',
        });
      }

      // Reset form
      resetForm();
      setActiveTab('my-listings');
      loadUserListings();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save property',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
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
      blockNumber: '',
      road: '',
      society: '',
      locality: '',
      city: '',
      address: '',
      pincode: '',
      state: '',
      amenities: [],
      features: [],
      walkScore: '',
      safetyScore: '',
      connectivityScore: '',
      lifestyleScore: '',
      highlights: [],
      thingsToConsider: [],
      nearbyPlaces: [],
      isPetFriendly: false,
      hasParking: false,
      coordinates: { lat: 0, lng: 0 },
      sellerPhone: '',
      panoramaImages: [],
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setImageUrls([]);
    setUrlInput('');
    setPanoramaUrls([]);
    setPanoramaUrlInput('');
    setFloorPlanImage(null);
    setFloorPlanData(null);
    setCurrentStep(1);
    setEditingPropertyId(null);
  };

  const handleEditProperty = (property: Property) => {
    // Try to split the address into structured fields
    // Format expected: "blockNumber, road, society"
    const addressParts = property.location.address.split(',').map(s => s.trim());
    const blockNumber = addressParts[0] || '';
    const road = addressParts[1] || '';
    const society = addressParts[2] || addressParts[0] || ''; // Fallback to first part if only one part exists

    setFormData({
      title: property.title,
      description: property.description,
      propertyType: property.specs.propertyType,
      bhk: property.specs.bhk.toString(),
      bathrooms: property.specs.bathrooms.toString(),
      sqft: property.specs.sqft.toString(),
      floor: property.specs.floor.toString(),
      totalFloors: property.specs.totalFloors.toString(),
      facing: property.specs.facing,
      propertyAge: property.specs.propertyAge.toString(),
      furnishing: property.specs.furnishing,
      price: property.price.toString(),
      blockNumber: blockNumber,
      road: road,
      society: society,
      locality: property.location.locality,
      city: property.location.city,
      address: property.location.address,
      pincode: property.location.pincode,
      state: property.location.state,
      amenities: property.amenities,
      features: property.features,
      walkScore: '0', // Scores are AI-computed
      safetyScore: '0',
      connectivityScore: '0',
      lifestyleScore: '0',
      highlights: property.highlights,
      thingsToConsider: property.thingsToConsider,
      nearbyPlaces: property.nearbyPlaces.map(p => ({ type: p.type, name: p.name, distance: p.distance })),
      isPetFriendly: property.isPetFriendly,
      hasParking: property.hasParking,
      coordinates: property.location.coordinates,
      sellerPhone: property.seller?.phone || '',
      panoramaImages: property.panoramaImages || [],
    });
    setPanoramaUrls(property.panoramaImages || []);
    setImagePreviews(property.images);
    setEditingPropertyId(property.id);
    setActiveTab('new-listing');
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await deleteProperty(propertyId);
      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });
      loadUserListings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete property',
        variant: 'destructive',
      });
    }
  };

  // Validation for each step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Basics
        return !!(
          formData.propertyType &&
          formData.title.trim() &&
          formData.description.trim() &&
          formData.bhk &&
          formData.bathrooms &&
          formData.sqft &&
          formData.floor &&
          formData.totalFloors &&
          formData.facing &&
          formData.propertyAge &&
          formData.furnishing &&
          formData.price &&
          formData.sellerPhone.trim()
        );
      
      case 2: // Media - at least one image required (360° and floor plan are optional)
        return imagePreviews.length > 0;
      
      case 3: // Location
        return !!(
          formData.blockNumber.trim() &&
          formData.road.trim() &&
          formData.society.trim() &&
          formData.locality.trim() &&
          formData.city.trim() &&
          formData.state.trim() &&
          formData.pincode.trim() &&
          formData.coordinates.lat !== 0 &&
          formData.coordinates.lng !== 0
        );
      
      case 4: // Scores - Features are checked (pet friendly, parking)
        // This step only has checkboxes, always valid
        return true;
      
      case 5: // Details
        return (
          formData.highlights.some(h => h.trim()) && // At least 1 highlight
          formData.thingsToConsider.some(t => t.trim()) && // At least 1 thing to consider
          formData.nearbyPlaces.some(p => p.type && p.name.trim() && p.distance.trim()) // At least 1 nearby place
          // Amenities are optional as per requirements
        );
      
      default:
        return true;
    }
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
            </div>

            {/* Seller Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="sellerPhone">Your Phone Number</Label>
              <Input
                id="sellerPhone"
                type="tel"
                placeholder="e.g., 9876543210"
                value={formData.sellerPhone}
                onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will be shown to buyers for "Show Number" and WhatsApp contact
              </p>
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
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-secondary/50 transition-colors">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-1">Drag & drop photos here</h4>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => document.getElementById('property-images')?.click()}
                disabled={uploading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Photos
              </Button>
              <input
                id="property-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploading}
              />
            </div>

            <Separator />

            {/* Image URL Input */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Or Add Image URLs</Label>
              <p className="text-sm text-muted-foreground">
                Paste direct links to images (must end in .jpg, .png, .webp, or .gif)
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addImageUrl();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addImageUrl}
                  disabled={!urlInput.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add URL
                </Button>
              </div>
            </div>

            <Separator />

            {/* 360° Panorama Images */}
            <div className="space-y-3">
              <Label className="text-base font-medium">360° Panorama Images (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Upload 360° panorama images taken with Google Street View app or a 360° camera for an immersive virtual tour.
              </p>
              
              {/* File Upload for 360° */}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  className="flex-1"
                  disabled={uploading}
                  onChange={async (e) => {
                    if (!e.target.files) return;
                    const files = Array.from(e.target.files);
                    if (files.length === 0) return;
                    
                    setUploading(true);
                    try {
                      // Use a temporary ID for panorama uploads
                      const tempId = editingPropertyId || `temp-${Date.now()}`;
                      const uploadedUrls = await uploadPropertyImages(files, tempId, (progress) => {
                        setUploadProgress(progress);
                      });
                      setPanoramaUrls(prev => [...prev, ...uploadedUrls]);
                      toast({
                        title: 'Success!',
                        description: `${uploadedUrls.length} 360° image(s) uploaded`,
                      });
                    } catch (error) {
                      console.error('Upload error:', error);
                      toast({
                        title: 'Upload failed',
                        description: 'Failed to upload 360° images',
                        variant: 'destructive',
                      });
                    } finally {
                      setUploading(false);
                      setUploadProgress(0);
                    }
                    e.target.value = '';
                  }}
                />
              </div>
              
              {/* Or add URL */}
              <div className="flex gap-2">
                <Input
                  placeholder="Or paste 360° image URL..."
                  value={panoramaUrlInput}
                  onChange={(e) => setPanoramaUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (panoramaUrlInput.trim()) {
                        setPanoramaUrls(prev => [...prev, panoramaUrlInput.trim()]);
                        setPanoramaUrlInput('');
                      }
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    if (panoramaUrlInput.trim()) {
                      setPanoramaUrls(prev => [...prev, panoramaUrlInput.trim()]);
                      setPanoramaUrlInput('');
                    }
                  }}
                  disabled={!panoramaUrlInput.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add URL
                </Button>
              </div>
              
              {/* 360° URL Preview List */}
              {panoramaUrls.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{panoramaUrls.length} panorama(s) added</p>
                  {panoramaUrls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                      <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate flex-1">{url.length > 50 ? url.slice(0, 50) + '...' : url}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setPanoramaUrls(prev => prev.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Floor Plan Upload */}
            <FloorPlanUpload
              bhk={parseInt(formData.bhk) || 2}
              sqft={parseFloat(formData.sqft) || 1000}
              onFloorPlanChange={({ image, floorPlanData: data }) => {
                setFloorPlanImage(image);
                setFloorPlanData(data);
              }}
              initialImage={floorPlanImage || undefined}
              initialFloorPlan={floorPlanData || undefined}
            />

            {/* Upload Progress */}
            {uploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading to Cloudinary...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Image Preview Grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {imagePreviews.map((preview, i) => {
                  const isUrl = imageUrls.includes(preview);
                  return (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center relative group overflow-hidden"
                    >
                      <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => isUrl ? removeImageUrl(i) : removeImage(i)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {i === 0 && (
                        <Badge className="absolute top-2 left-2 text-xs">Cover</Badge>
                      )}
                      {isUrl && (
                        <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs">URL</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {imagePreviews.length > 0 
                ? `${imagePreviews.length} image(s) selected` 
                : 'Tip: Properties with 5+ high-quality photos get 3x more inquiries'}
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
            <div className="space-y-2">
              <Label htmlFor="blockNumber">Block/House Number *</Label>
              <Input
                id="blockNumber"
                value={formData.blockNumber}
                onChange={(e) => handleInputChange('blockNumber', e.target.value)}
                placeholder="e.g., C204, House 45, Block B"
              />
              <p className="text-xs text-muted-foreground">Enter your flat number, house number, or block</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="road">Road/Sector *</Label>
              <Input
                id="road"
                value={formData.road}
                onChange={(e) => handleInputChange('road', e.target.value)}
                placeholder="e.g., Sector 5, MG Road, SP Ring Road"
              />
              <p className="text-xs text-muted-foreground">Enter the road, sector, or main street name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="society">Society/Area Name *</Label>
              <Input
                id="society"
                value={formData.society}
                onChange={(e) => handleInputChange('society', e.target.value)}
                placeholder="e.g., Parshwanath Atlantis Park, Green Valley"
              />
              <p className="text-xs text-muted-foreground">🎯 This will be used to locate the area on the map</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locality">Locality *</Label>
                <Input
                  id="locality"
                  placeholder="e.g., Koramangala"
                  value={formData.locality}
                  onChange={(e) => handleInputChange('locality', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Bangalore"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="e.g., Karnataka"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  placeholder="e.g., 560034"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                />
              </div>
            </div>

            {/* Map Picker */}
            <div className="space-y-2">
              <Label>Property Location *</Label>
              <MapPicker
                address={`${formData.society}, ${formData.locality}, ${formData.city}, ${formData.state}, ${formData.pincode}`}
                initialCoordinates={formData.coordinates.lat !== 0 ? formData.coordinates : undefined}
                onCoordinatesChange={(coords) => {
                  setFormData(prev => ({ ...prev, coordinates: coords }));
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 Search for your area name or pincode (e.g., "{formData.pincode || formData.city || 'pincode'}"). You can also click directly on the map to set the exact location.
              </p>
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
              <Label className="text-base font-medium">Property Features *</Label>
              <p className="text-sm text-muted-foreground">
                Select features that apply to your property
              </p>
            </div>

            {/* Pet Friendly & Parking */}
            <div className="space-y-4 p-4 border rounded-lg bg-secondary/10">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPetFriendly"
                  checked={formData.isPetFriendly}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPetFriendly: checked as boolean }))
                  }
                />
                <Label htmlFor="isPetFriendly" className="cursor-pointer">
                  Pet Friendly Property
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasParking"
                  checked={formData.hasParking}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasParking: checked as boolean }))
                  }
                />
                <Label htmlFor="hasParking" className="cursor-pointer">
                  Has Parking Space
                </Label>
              </div>
            </div>

            {/* Note about scores */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Walk Score, Safety Score, and other neighborhood scores are automatically calculated based on your property's location. No manual input needed!
              </p>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Highlights */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Property Highlights *</Label>
              <p className="text-sm text-muted-foreground">
                Add key selling points (at least 1 required)
              </p>
              <div className="space-y-2">
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={highlight}
                      onChange={(e) => {
                        const newHighlights = [...formData.highlights];
                        newHighlights[index] = e.target.value;
                        setFormData(prev => ({ ...prev, highlights: newHighlights }));
                      }}
                      placeholder="e.g., Spacious balcony with city view"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          highlights: prev.highlights.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      highlights: [...prev.highlights, '']
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Highlight
                </Button>
              </div>
            </div>

            {/* Things to Consider */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Things to Consider *</Label>
              <p className="text-sm text-muted-foreground">
                Be transparent about potential concerns (at least 1 required)
              </p>
              <div className="space-y-2">
                {formData.thingsToConsider.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newItems = [...formData.thingsToConsider];
                        newItems[index] = e.target.value;
                        setFormData(prev => ({ ...prev, thingsToConsider: newItems }));
                      }}
                      placeholder="e.g., Under construction nearby"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          thingsToConsider: prev.thingsToConsider.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      thingsToConsider: [...prev.thingsToConsider, '']
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Point
                </Button>
              </div>
            </div>

            {/* Nearby Places */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Nearby Places *</Label>
              <p className="text-sm text-muted-foreground">
                Add important nearby locations (at least 1 required)
              </p>
              <div className="space-y-3">
                {formData.nearbyPlaces.map((place, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={place.type}
                          onValueChange={(value) => {
                            const newPlaces = [...formData.nearbyPlaces];
                            newPlaces[index].type = value;
                            setFormData(prev => ({ ...prev, nearbyPlaces: newPlaces }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="school">School</SelectItem>
                            <SelectItem value="hospital">Hospital</SelectItem>
                            <SelectItem value="metro">Metro</SelectItem>
                            <SelectItem value="park">Park</SelectItem>
                            <SelectItem value="mall">Mall</SelectItem>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={place.name}
                          onChange={(e) => {
                            const newPlaces = [...formData.nearbyPlaces];
                            newPlaces[index].name = e.target.value;
                            setFormData(prev => ({ ...prev, nearbyPlaces: newPlaces }));
                          }}
                          placeholder="e.g., Metro Station"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Distance</Label>
                        <div className="flex gap-2">
                          <Input
                            value={place.distance}
                            onChange={(e) => {
                              const newPlaces = [...formData.nearbyPlaces];
                              newPlaces[index].distance = e.target.value;
                              setFormData(prev => ({ ...prev, nearbyPlaces: newPlaces }));
                            }}
                            placeholder="500m"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                nearbyPlaces: prev.nearbyPlaces.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      nearbyPlaces: [...prev.nearbyPlaces, { type: 'school', name: '', distance: '' }]
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Nearby Place
                </Button>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Amenities *</Label>
              <p className="text-sm text-muted-foreground">
                Select at least one amenity
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Swimming Pool', 'Gym', 'Playground', 'Security', 'Power Backup', 'Lift', 'Club House', 'Garden', 'Visitor Parking'].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            amenities: [...prev.amenities, amenity]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            amenities: prev.amenities.filter(a => a !== amenity)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={amenity} className="text-sm cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary">Complete Information Required</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    All fields marked with * are mandatory. Properties with complete information get 5x more inquiries.
                  </p>
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
    <div className="min-h-screen bg-white">
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
                  <CardTitle>{editingPropertyId ? 'Edit Property' : 'List Your Property'}</CardTitle>
                  <CardDescription>
                    {editingPropertyId ? 'Update your property details' : 'Complete all steps to publish your listing'}
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
                      <Button 
                        onClick={nextStep}
                        disabled={!validateStep(currentStep)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        className="gap-2" 
                        onClick={handleSubmitProperty}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {editingPropertyId ? 'Updating...' : 'Publishing...'}
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            {editingPropertyId ? 'Update Listing' : 'Publish Listing'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-listings">
              {loadingListings ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userListings.length === 0 ? (
                <Card className="p-12 text-center">
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by creating your first property listing
                  </p>
                  <Button onClick={() => setActiveTab('new-listing')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Listing
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userListings.map((listing) => (
                    <Card key={listing.id} className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={listing.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop'}
                          alt={listing.title}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{listing.title}</h3>
                              <p className="text-sm text-muted-foreground">{listing.location.locality}, {listing.location.city}</p>
                              <p className="text-lg font-bold text-primary mt-1">
                                {formatPrice(listing.price)}
                              </p>
                            </div>
                            <Badge variant="default">
                              Active
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span>{listing.specs.bhk} BHK</span>
                            <span>•</span>
                            <span>{listing.specs.sqft} sqft</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {(listing as any).views || 0} views
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEditProperty(listing)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDeleteProperty(listing.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
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
                  {loadingLeads ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading leads...</p>
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
                      <p className="text-muted-foreground">
                        Leads will appear here when buyers express interest in your properties
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Group leads by property */}
                      {Object.entries(
                        leads.reduce((acc, lead) => {
                          if (!acc[lead.propertyId]) {
                            acc[lead.propertyId] = [];
                          }
                          acc[lead.propertyId].push(lead);
                          return acc;
                        }, {} as Record<string, PropertyLead[]>)
                      ).map(([propertyId, propertyLeads]) => {
                        const property = userListings.find(p => p.id === propertyId);
                        return (
                          <div key={propertyId} className="border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <Building2 className="h-5 w-5 text-primary" />
                              <div>
                                <h3 className="font-semibold">
                                  {property?.title || 'Property'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {propertyLeads.length} interested buyer{propertyLeads.length > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {propertyLeads.map((lead) => (
                                <div
                                  key={lead.id}
                                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback>
                                        {lead.userName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{lead.userName}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {lead.userEmail}
                                      </p>
                                      {lead.userPhone && (
                                        <p className="text-sm text-muted-foreground">
                                          {lead.userPhone}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-2"
                                      onClick={() => {
                                        setChatBuyerId(lead.userId);
                                        setChatBuyerName(lead.userName);
                                        setChatPropertyId(lead.propertyId);
                                        setChatPropertyTitle(property?.title || 'Property');
                                        setIsChatOpen(true);
                                      }}
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                      Message
                                    </Button>
                                    <div className="text-right">
                                      <Badge variant="secondary" className="mb-1">
                                        {lead.status}
                                      </Badge>
                                      <p className="text-xs text-muted-foreground">
                                        {lead.createdAt?.toDate ? 
                                          new Date(lead.createdAt.toDate()).toLocaleDateString() : 
                                          'Recently'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Chat drawer for messaging leads */}
      <FirebaseChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        propertyId={chatPropertyId}
        sellerId={chatBuyerId}
        sellerName={chatBuyerName}
        propertyTitle={chatPropertyTitle}
      />

      <Footer />
    </div>
  );
};

export default SellerDashboard;
