import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2, QrCode, Share2 } from 'lucide-react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
  Image,
} from '@react-pdf/renderer';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Property } from '@/data/listings';

interface PropertyBrochureProps {
  property: Property;
  className?: string;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 10,
    color: '#64748b',
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 20,
  },
  propertyLocation: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
  },
  priceSection: {
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specItem: {
    width: '30%',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  specLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  description: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.6,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    backgroundColor: '#dbeafe',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  amenityText: {
    fontSize: 9,
    color: '#1e40af',
  },
  sellerSection: {
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  sellerPhone: {
    fontSize: 11,
    color: '#3b82f6',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },
  verificationText: {
    fontSize: 9,
    color: '#16a34a',
  },
});

// PDF Document Component
const PropertyPDF = ({ property }: { property: Property }) => {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Nivasa</Text>
          <Text style={styles.tagline}>Your Trusted Real Estate Partner</Text>
        </View>

        {/* Property Title & Location */}
        <Text style={styles.propertyTitle}>{property.title}</Text>
        <Text style={styles.propertyLocation}>
          {property.location.locality}, {property.location.city}, {property.location.state}
        </Text>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Listed Price</Text>
          <Text style={styles.priceValue}>{formatPrice(property.price)}</Text>
        </View>

        {/* Key Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Specifications</Text>
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Bedrooms</Text>
              <Text style={styles.specValue}>{property.specs.bedrooms} BHK</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Bathrooms</Text>
              <Text style={styles.specValue}>{property.specs.bathrooms}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Super Area</Text>
              <Text style={styles.specValue}>{property.specs.area} sq.ft</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Facing</Text>
              <Text style={styles.specValue}>{property.specs.facing}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Floor</Text>
              <Text style={styles.specValue}>{property.specs.floor} of {property.specs.totalFloors}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Furnishing</Text>
              <Text style={styles.specValue}>{property.specs.furnishing}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Parking</Text>
              <Text style={styles.specValue}>{property.specs.parking} Covered</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Age</Text>
              <Text style={styles.specValue}>{property.specs.age}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Price/sq.ft</Text>
              <Text style={styles.specValue}>₹{Math.round(property.price / property.specs.area).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Property</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities & Features</Text>
          <View style={styles.amenitiesGrid}>
            {property.amenities.slice(0, 12).map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Seller Information */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{property.seller.name}</Text>
            <Text style={styles.sellerPhone}>{property.seller.phone}</Text>
            {property.seller.isVerified && (
              <View style={styles.verificationBadge}>
                <Text style={styles.verificationText}>✓ Verified Seller</Text>
              </View>
            )}
          </View>
          <View style={styles.qrPlaceholder}>
            <Text style={{ fontSize: 8, color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>
              QR Code
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Nivasa • {new Date().toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })} • Property ID: {property.id}
        </Text>
      </Page>
    </Document>
  );
};

const PropertyBrochure: React.FC<PropertyBrochureProps> = ({
  property,
  className,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const propertyUrl = `${window.location.origin}/property/${property.id}`;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<PropertyPDF property={property} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${property.title.replace(/[^a-zA-Z0-9]/g, '_')}_Brochure.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Brochure downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate brochure. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn('', className)}>
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 w-full bg-white border-gray-300 text-gray-800 relative overflow-hidden group transition-all duration-300 hover:text-white hover:border-gray-900">
            <span className="absolute inset-0 bg-gray-900 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Download Brochure
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Property Brochure
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview Card */}
            <div className="p-4 rounded-lg border bg-secondary/30">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground line-clamp-2">{property.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {property.location.locality}, {property.location.city}
                  </p>
                  <p className="text-lg font-bold text-primary mt-2">
                    ₹{(property.price / 10000000).toFixed(2)} Cr
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex items-center justify-center p-4 rounded-lg border bg-white">
              <div className="text-center">
                <QRCodeSVG
                  value={propertyUrl}
                  size={120}
                  level="H"
                  includeMargin
                  className="mx-auto"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Scan to view property online
                </p>
              </div>
            </div>

            {/* Brochure Info */}
            <div className="text-sm text-muted-foreground text-center">
              <p>Your brochure will include:</p>
              <ul className="mt-2 space-y-1 text-left list-disc list-inside">
                <li>Property specifications & pricing</li>
                <li>Amenities & features</li>
                <li>Seller contact information</li>
                <li>QR code for online viewing</li>
              </ul>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF Brochure
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyBrochure;
