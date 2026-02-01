import React, { useState, useEffect, useRef } from 'react';
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
  GripVertical,
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
  getPropertiesBySellerEmail,
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
import { generateViewCounts } from '@/components/analytics/PropertyViewsTracker';

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

  // Drag-and-drop state for image reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Load user's listings and leads on mount (for stats display)
  useEffect(() => {
    if (currentUser) {
      loadUserListings();
      loadLeads();
    }
  }, [currentUser]);

  const loadUserListings = async () => {
    if (!currentUser) return;

    setLoadingListings(true);
    try {
      // First try to get by seller ID
      let listings = await getPropertiesBySeller(currentUser.uid);

      // If no listings found by ID, try by email (for seeded properties)
      if (listings.length === 0 && currentUser.email) {
        listings = await getPropertiesBySellerEmail(currentUser.email);
      }

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
    console.log('Selected files:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));

    const validFiles: File[] = [];
    const previews: string[] = [];

    // Allow more image types
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/tiff', 'image/bmp'];

    for (const file of files) {
      // Check if it's an image (starts with 'image/')
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: `${file.name} is not an image file`,
          variant: 'destructive',
        });
        continue;
      }

      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 10MB limit`,
          variant: 'destructive',
        });
        continue;
      }

      try {
        const compressed = await compressImage(file, 1920, 0.85);
        console.log('Compressed file:', compressed.name, compressed.size);
        validFiles.push(compressed);
        const previewUrl = URL.createObjectURL(compressed);
        console.log('Preview URL created:', previewUrl);
        previews.push(previewUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        toast({
          title: 'Error processing image',
          description: `Could not process ${file.name}`,
          variant: 'destructive',
        });
      }
    }

    console.log('Valid files:', validFiles.length, 'Previews:', previews.length);
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...previews]);

    // Clear the input so the same file can be selected again
    e.target.value = '';
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

  // Drag-and-drop handlers for image reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder imagePreviews
    const newPreviews = [...imagePreviews];
    const [draggedItem] = newPreviews.splice(draggedIndex, 1);
    newPreviews.splice(dropIndex, 0, draggedItem);
    setImagePreviews(newPreviews);

    // Also reorder imageUrls if the dragged item is a URL
    const draggedPreview = imagePreviews[draggedIndex];
    if (imageUrls.includes(draggedPreview)) {
      const urlDragIndex = imageUrls.indexOf(draggedPreview);
      const dropPreview = imagePreviews[dropIndex];
      const urlDropIndex = imageUrls.includes(dropPreview) ? imageUrls.indexOf(dropPreview) : urlDragIndex;
      
      const newUrls = [...imageUrls];
      const [draggedUrl] = newUrls.splice(urlDragIndex, 1);
      newUrls.splice(urlDropIndex, 0, draggedUrl);
      setImageUrls(newUrls);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
        highlights: formData.highlights.filter(h => h.trim()),
        thingsToConsider: formData.thingsToConsider.filter(t => t.trim()),
        nearbyPlaces: formData.nearbyPlaces
          .filter(place => place.name.trim() && place.distance.trim())
          .map(place => ({
            type: place.type as any,
            name: place.name.trim(),
            distance: place.distance.trim(),
          })),
        isPetFriendly: formData.isPetFriendly,
        hasParking: formData.hasParking,
        isNewListing: true,
        listedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Only include panoramaImages if there are any (Firestore doesn't accept undefined)
        ...(panoramaUrls.length > 0 && { panoramaImages: panoramaUrls }),
        // Only include floor plan if data exists (Firestore doesn't accept undefined)
        ...(floorPlanData && {
          floorPlan: {
            ...floorPlanData,
            ...(floorPlanImage && { floorPlanImage }),
          },
        }),
      };

      // Debug: Log what floor plan data is being saved
      console.log('=== SAVING PROPERTY ===');
      console.log('Floor Plan Data:', propertyData.floorPlan);
      console.log('Floor Plan Image present:', !!propertyData.floorPlan?.floorPlanImage);
      console.log('Floor Plan Image type:', typeof propertyData.floorPlan?.floorPlanImage);
      console.log('Floor Plan Image length:', propertyData.floorPlan?.floorPlanImage?.length || 0);

      if (editingPropertyId) {
        // Update existing property
        await updateProperty(editingPropertyId, propertyData);
        toast({
          variant: 'success',
          title: 'Success!',
          description: 'Property updated successfully',
        });
      } else {
        // Add new property
        await addProperty(propertyData);
        toast({
          variant: 'success',
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
    // Set both imageUrls AND imagePreviews so existing images are preserved on submit
    setImageUrls(property.images || []);
    setImagePreviews(property.images || []);
    setSelectedFiles([]); // Clear any previously selected files
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
                className="flex flex-wrap gap-3"
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
                onClick={() => {
                  console.log('Add Photos button clicked');
                  console.log('File input ref:', fileInputRef.current);
                  fileInputRef.current?.click();
                }}
                disabled={uploading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Photos
              </Button>
              <input
                ref={fileInputRef}
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

            {/* Image Preview Grid */}
            {imagePreviews.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <GripVertical className="h-3 w-3" />
                  Drag images to reorder. First image will be the cover photo.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagePreviews.map((preview, i) => {
                    const isUrl = imageUrls.includes(preview);
                    const isDragging = draggedIndex === i;
                    const isDragOver = dragOverIndex === i;
                    return (
                      <div
                        key={`preview-${i}`}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDrop={(e) => handleDrop(e, i)}
                        onDragEnd={handleDragEnd}
                        className={`aspect-[4/3] rounded-lg bg-muted flex items-center justify-center relative group overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 ${
                          isDragging ? 'opacity-50 scale-95' : ''
                        } ${isDragOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      >
                        <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                        {/* Drag handle indicator */}
                        <div className="absolute top-2 right-2 bg-background/80 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
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
                        {isDragOver && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">Drop here</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                        variant: 'success',
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Soft flowing gradient background - flowing bottom to top */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            linear-gradient(0deg, 
              rgba(210, 200, 220, 0.5) 0%,
              rgba(220, 225, 240, 0.7) 25%,
              rgba(245, 243, 240, 1) 50%,
              rgba(240, 238, 233, 0.9) 75%,
              rgba(230, 210, 220, 0.6) 100%
            )
          `
        }}
      />

      {/* Animated gradient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Lavender blob - bottom center */}
        <div
          className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(200, 190, 230, 0.6) 0%, rgba(180, 170, 220, 0.3) 50%, transparent 70%)'
          }}
        />

        {/* Warm peach blob - top right */}
        <div
          className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full opacity-35 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 200, 180, 0.6) 0%, rgba(255, 180, 160, 0.3) 50%, transparent 70%)'
          }}
        />

        {/* Soft blue blob - top left */}
        <div
          className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(180, 200, 240, 0.5) 0%, transparent 60%)'
          }}
        />

        {/* Pink accent blob - right side */}
        <div
          className="absolute top-1/2 -right-20 w-[400px] h-[400px] rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(230, 200, 220, 0.5) 0%, transparent 60%)'
          }}
        />
      </div>

      <Header />
      <CompareModal />

      {/* Premium Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container relative py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Main Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-xl shadow-primary/30"
              >
                <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl sm:text-4xl font-bold text-foreground"
                >
                  Seller Dashboard
                </motion.h1>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm sm:text-lg text-muted-foreground mt-1"
                >
                  List your property and connect with genuine buyers
                </motion.p>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-3 sm:gap-4"
            >
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/50 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    {loadingListings ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 animate-spin" />
                    ) : (
                      <Home className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {loadingListings ? '...' : userListings.length}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Active Listings</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/50 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    {loadingLeads ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 animate-spin" />
                    ) : (
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {loadingLeads ? '...' : leads.length}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Total Leads</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/50 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    {loadingListings ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {loadingListings ? '...' : userListings.reduce((sum, l) => sum + ((l as any).views || 0), 0)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Total Views</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="container py-6 sm:py-10">
        <div className="max-w-4xl mx-auto">

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 sm:mb-8 w-full sm:w-auto flex-wrap h-auto gap-1 sm:gap-2 p-1.5 sm:p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg">
              <TabsTrigger value="new-listing" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none rounded-xl py-2.5 sm:py-3 px-4 sm:px-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all duration-300">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                New Listing
              </TabsTrigger>
              <TabsTrigger value="my-listings" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none rounded-xl py-2.5 sm:py-3 px-4 sm:px-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all duration-300">
                <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                My Listings
              </TabsTrigger>
              <TabsTrigger value="leads" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none rounded-xl py-2.5 sm:py-3 px-4 sm:px-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all duration-300">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Leads
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new-listing">
              <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                {/* Gradient Header Stripe */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-violet-500" />
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                      {editingPropertyId ? <Edit className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">{editingPropertyId ? 'Edit Property' : 'List Your Property'}</CardTitle>
                      <CardDescription className="mt-0.5">
                        {editingPropertyId ? 'Update your property details' : 'Complete all steps to publish your listing'}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Enhanced Progress */}
                  <div className="pt-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-violet-500/20 rounded-full blur-sm" />
                      <Progress value={progress} className="h-2.5 bg-secondary relative" />
                    </div>
                    <div className="flex justify-between mt-5 gap-1 relative">
                      {steps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`flex flex-col items-center cursor-pointer flex-1 group transition-all duration-200 ${step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          onClick={() => setCurrentStep(step.id)}
                        >
                          <div className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:scale-110 ${step.id < currentStep
                            ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30'
                            : step.id === currentStep
                              ? 'border-primary text-primary bg-primary/5 shadow-md shadow-primary/20'
                              : 'border-muted bg-background group-hover:border-muted-foreground/50'
                            }`}>
                            {step.id < currentStep ? (
                              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </div>
                          <span className="text-[10px] sm:text-xs mt-1.5 font-medium hidden sm:block">{step.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <AnimatePresence mode="wait">
                    {renderStepContent()}
                  </AnimatePresence>

                  <Separator className="my-8" />

                  {/* Premium Navigation */}
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 rounded-xl border-2 hover:bg-secondary/80"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    {currentStep < steps.length ? (
                      <Button
                        size="lg"
                        className="gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25"
                        onClick={nextStep}
                        disabled={!validateStep(currentStep)}
                      >
                        Next Step
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25"
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
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary/10 animate-pulse" />
                    <Loader2 className="h-8 w-8 animate-spin text-primary absolute inset-0 m-auto" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">Loading your listings...</p>
                </div>
              ) : userListings.length === 0 ? (
                <Card className="p-8 sm:p-12 text-center border-dashed border-2 bg-gradient-to-br from-background to-secondary/30">
                  <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto mb-5 flex items-center justify-center">
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Start building your portfolio by creating your first property listing
                  </p>
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/25" onClick={() => setActiveTab('new-listing')}>
                    <Plus className="h-5 w-5" />
                    Create First Listing
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userListings.map((listing) => (
                    <Card key={listing.id} className="p-4 hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/90 backdrop-blur-sm group">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative overflow-hidden rounded-xl">
                          <img
                            src={listing.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop'}
                            alt={listing.title}
                            className="w-full sm:w-36 h-44 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold truncate">{listing.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">{listing.location.locality}, {listing.location.city}</p>
                              <p className="text-lg font-bold text-primary mt-1">
                                {formatPrice(listing.price)}
                              </p>
                            </div>
                            <Badge variant="default" className="self-start shrink-0">
                              Active
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                            <span>{listing.specs.bhk} BHK</span>
                            <span>•</span>
                            <span>{listing.specs.sqft} sqft</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {generateViewCounts(listing.id).totalViews.toLocaleString()} views
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 sm:flex-col justify-end">
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
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Interested Buyers</CardTitle>
                      <CardDescription>
                        People who have shown interest in your properties
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingLeads ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-primary/10 animate-pulse" />
                        <Loader2 className="h-8 w-8 animate-spin text-primary absolute inset-0 m-auto" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">Loading your leads...</p>
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto mb-5 flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No leads yet</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Leads will appear here when buyers express interest in your properties. Make sure your listings are complete and eye-catching!
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
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-secondary/50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className="h-10 w-10 shrink-0">
                                      <AvatarFallback>
                                        {lead.userName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <p className="font-medium truncate">{lead.userName}</p>
                                      <p className="text-sm text-muted-foreground truncate">
                                        {lead.userEmail}
                                      </p>
                                      {lead.userPhone && (
                                        <p className="text-sm text-muted-foreground">
                                          {lead.userPhone}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:justify-end gap-3 ml-0 sm:ml-auto">
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
                                      <span className="hidden xs:inline">Message</span>
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
