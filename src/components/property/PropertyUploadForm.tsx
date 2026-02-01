/**
 * Complete Property Upload Example using Cloudinary + Firebase Firestore
 * This is a working example you can use in your app
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  uploadPropertyImages,
  compressImage,
  validateFile,
  getOptimizedUrl,
} from '@/services/cloudinaryService';
import { addProperty } from '@/services/firestoreService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Check } from 'lucide-react';

export const PropertyUploadForm = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [bhk, setBhk] = useState('');
  const [sqft, setSqft] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  
  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  // Handle image selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    const previews: string[] = [];
    
    for (const file of files) {
      // Validate
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
        // Compress to reduce upload time
        const compressed = await compressImage(file, 1920, 0.85);
        validFiles.push(compressed);
        previews.push(URL.createObjectURL(compressed));
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
    
    setSelectedFiles(validFiles);
    setImagePreviews(previews);
  };
  
  // Remove image
  const removeImage = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
    setImagePreviews(previews => previews.filter((_, i) => i !== index));
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to post a property',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast({
        title: 'No images',
        description: 'Please upload at least one image',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Step 1: Upload images to Cloudinary
      toast({
        title: 'Uploading images...',
        description: 'This may take a moment',
      });
      
      const tempPropertyId = 'prop-' + Date.now();
      const imageUrls = await uploadPropertyImages(
        selectedFiles,
        tempPropertyId,
        (progress) => setUploadProgress(progress)
      );
      
      // Step 2: Create property in Firestore
      setUploadProgress(95);
      toast({
        title: 'Saving property...',
        description: 'Almost done',
      });
      
      const propertyId = await addProperty({
        title,
        description,
        price: parseFloat(price),
        pricePerSqft: Math.round(parseFloat(price) / parseFloat(sqft)),
        images: imageUrls,
        location: {
          address: '',
          locality,
          city,
          state: '',
          pincode: '',
          coordinates: { lat: 0, lng: 0 },
        },
        specs: {
          bhk: parseInt(bhk),
          bathrooms: parseInt(bathrooms) || 2,
          sqft: parseFloat(sqft),
          floor: 1,
          totalFloors: 10,
          facing: 'East',
          propertyAge: 0,
          furnishing: 'semi-furnished',
          propertyType: 'apartment',
        },
        amenities: ['Gym', 'Swimming Pool', 'Security'],
        features: [],
        seller: {
          id: currentUser.uid,
          name: userData?.displayName || currentUser.email || 'User',
          phone: '',
          email: currentUser.email || '',
          isVerified: false,
          memberSince: new Date().toISOString(),
          responseRate: 0,
        },
        verification: {
          ownerVerified: false,
          documentsReady: false,
          reraApproved: false,
        },
        walkScore: 65,
        safetyScore: 70,
        connectivityScore: 75,
        lifestyleScore: 80,
        highlights: ['Spacious rooms', 'Good location'],
        thingsToConsider: ['Under construction nearby'],
        nearbyPlaces: [{
          type: 'metro',
          name: 'Metro Station',
          distance: '500m'
        }],
        isPetFriendly: false,
        hasParking: true,
        isNewListing: true,
        listedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      setUploadProgress(100);
      setUploadComplete(true);
      
      toast({
        variant: 'success',
        title: 'Success! 🎉',
        description: `Property posted successfully!`,
      });
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setPrice('');
        setCity('');
        setLocality('');
        setBhk('');
        setSqft('');
        setBathrooms('');
        setSelectedFiles([]);
        setImagePreviews([]);
        setUploadComplete(false);
        setUploadProgress(0);
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to post property',
        variant: 'destructive',
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Post Your Property</h2>
        <p className="text-muted-foreground mt-2">
          Upload images to Cloudinary (FREE 25GB) & save to Firestore
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Details</h3>
          
          <div>
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Spacious 3BHK with Garden View"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your property, amenities, nearby locations..."
              rows={4}
              required
            />
          </div>
        </div>
        
        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bangalore"
                required
              />
            </div>
            <div>
              <Label htmlFor="locality">Locality *</Label>
              <Input
                id="locality"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Koramangala"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Property Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Property Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="5000000"
                required
              />
            </div>
            <div>
              <Label htmlFor="sqft">Area (sq.ft) *</Label>
              <Input
                id="sqft"
                type="number"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                placeholder="1200"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bhk">BHK *</Label>
              <Input
                id="bhk"
                type="number"
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                placeholder="3"
                required
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="2"
              />
            </div>
          </div>
        </div>
        
        {/* Image Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Property Images *</h3>
          
          <div className="border-2 border-dashed border-border rounded-lg p-8">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Click to upload images</p>
              <p className="text-xs text-muted-foreground">
                Max 10MB per image • JPEG, PNG, WebP
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{imagePreviews.length}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {uploadProgress < 95 ? 'Uploading to Cloudinary...' : 'Saving to Firestore...'}
              </span>
              <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
        
        {/* Success Message */}
        {uploadComplete && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              Property posted successfully!
            </span>
          </div>
        )}
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={uploading || uploadComplete}
        >
          {uploading ? 'Posting...' : uploadComplete ? 'Posted!' : 'Post Property'}
        </Button>
      </form>
    </div>
  );
};
