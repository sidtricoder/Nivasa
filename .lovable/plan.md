

# HavenHub - P2P Real Estate Platform

## Overview
A modern, trust-focused P2P real estate platform that eliminates intermediaries by connecting buyers and sellers directly. Built with a Zillow-inspired clean, data-rich design using a "Trust Blue" color palette.

---

## 🎨 Design System

**Color Palette:**
- Primary: Trust Blue (#1D4ED8) for CTAs, key actions
- Clean white backgrounds with soft gray (#F8FAFC) sections
- Success green for verified badges
- Muted text using slate tones

**Typography:** Clean, modern sans-serif with clear hierarchy

**Dark Mode:** Full theme toggle with refined dark palette

---

## 📄 Pages & Features

### 1. Landing Page
- **Hero Section:** Bold headline with lifestyle-first search bar
  - Search suggestions: "pet-friendly," "near metro," "office-ready," "garden view"
  - Quick filter chips for popular categories
- **Featured Listings Grid:** 6-8 properties with hover animations
- **Trust Indicators:** Stats section (500+ Direct Sales, $0 Brokerage, 100% Verified)
- **How It Works:** 3-step visual guide for P2P selling
- **CTA Section:** Dual buttons for "Browse Homes" and "List Your Property"

### 2. Discovery Page
- **Advanced Filters Sidebar:**
  - Price range slider
  - BHK selection (1-5+)
  - Locality/area dropdown
  - Property type (Apartment, Villa, House)
  - Lifestyle filters (Pet-friendly, Near Transit, etc.)
- **Property Grid:** Responsive cards showing:
  - Property image with favorites heart icon
  - Price and price/sqft metric
  - Trust Badge (Verified Owner, Documents Ready)
  - Walk Score indicator
  - Quick action buttons
- **View Toggle:** Grid/List view switch
- **Sort Options:** Price, Newest, Walk Score

### 3. Property Detail Page
- **Premium Image Gallery:** Full-width hero with thumbnail navigation
- **Immersive View Tabs:**
  - Photos (gallery with lightbox)
  - Street View (Mapillary placeholder)
  - 3D Virtual Tour (model-viewer placeholder)
- **Property Info Section:**
  - Key specs (BHK, sqft, floor, age)
  - Price breakdown with price/sqft
  - Amenities icons grid
- **Location Section:**
  - Map placeholder (Leaflet-ready)
  - Neighborhood Insights sidebar (parks, schools, transit, shops)
- **Seller Contact Sidebar:**
  - Verified seller badge
  - "Chat with Seller" button
  - Appointment scheduler with date/time picker
  - Phone reveal (masked for privacy)
- **EMI Calculator:** Monthly payment estimator based on loan amount, tenure, interest rate
- **Compare Feature:** "Add to Compare" button

### 4. Seller Dashboard
- **Multi-Step Listing Form:**
  - Step 1: Basics (Title, BHK, Area, Property Type)
  - Step 2: Media (Photo upload with drag-drop, reorder capability)
  - Step 3: Location (Address, Map pin, Nearby landmarks)
  - Step 4: Documentation (Upload verification docs)
- **Price Estimator Tool:** AI-style price suggestion based on locality, sqft, BHK
- **My Listings:** Grid of seller's active/draft listings
- **Leads Overview:** Mock inbox showing interested buyers

### 5. Additional Features
- **Favorites Page:** Saved properties grid
- **Compare Modal:** Side-by-side comparison of up to 3 properties
- **Global Header:** Logo, navigation, theme toggle, favorites count

---

## 🗂️ Data Structure

Mock data via `listings.json` with Supabase-ready schema:
- Properties: id, title, price, images, location, specs, amenities, seller info, verification status
- Ready for easy database migration

---

## 📱 Responsive Design

- Mobile-first approach
- Collapsible filters on mobile
- Touch-friendly cards and actions
- Sticky contact sidebar on desktop

---

## ✨ Interactions & Polish

- Smooth page transitions
- Card hover animations
- Loading skeletons
- Toast notifications for actions
- Modal overlays for gallery and compare

