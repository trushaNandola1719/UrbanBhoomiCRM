import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, Trash2, Bed, Bath, MapPin } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import PropertyForm from "@/components/forms/property-form";
import type { Property } from "@shared/schema";

export default function Properties() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  const [bedroomsFilter, setBedroomsFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [furnishingFilter, setFurnishingFilter] = useState("all");
  const [parkingFilter, setParkingFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const { toast } = useToast();

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({ title: "Property deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete property", variant: "destructive" });
    },
  });

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(search.toLowerCase()) ||
                         property.location.toLowerCase().includes(search.toLowerCase()) ||
                         (property.city && property.city.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || property.category === categoryFilter;
    
    const matchesPriceRange = priceRangeFilter === "all" || (() => {
      const price = parseFloat(property.price);
      switch (priceRangeFilter) {
        case "0-50L": return price <= 5000000;
        case "50L-1Cr": return price > 5000000 && price <= 10000000;
        case "1Cr-2Cr": return price > 10000000 && price <= 20000000;
        case "2Cr+": return price > 20000000;
        default: return true;
      }
    })();
    
    const matchesBedrooms = bedroomsFilter === "all" || 
      (property.bedrooms && property.bedrooms.toString() === bedroomsFilter);
    
    const matchesCity = cityFilter === "all" || 
      (property.city && property.city === cityFilter);
    
    const matchesFurnishing = furnishingFilter === "all" || 
      (property.furnishing === furnishingFilter);
    
    const matchesParking = parkingFilter === "all" || 
      (parkingFilter === "yes" ? property.parking === true : property.parking === false);
    
    return matchesSearch && matchesCategory && matchesPriceRange && 
           matchesBedrooms && matchesCity && matchesFurnishing && matchesParking;
  });

  // Get unique cities for filter
  const uniqueCities = Array.from(new Set(properties.map(p => p.city).filter(Boolean))).sort();

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProperty(null);
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      flats: "bg-urban-primary bg-opacity-10 text-urban-primary",
      bungalow: "bg-urban-secondary bg-opacity-10 text-urban-secondary",
      tenement: "bg-yellow-500 bg-opacity-10 text-yellow-600",
      land: "bg-purple-500 bg-opacity-10 text-purple-600",
    };
    return variants[category as keyof typeof variants] || variants.flats;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      flats: "Apartment",
      bungalow: "Bungalow",
      tenement: "Tenement",
      land: "Land",
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <>
      {/* Modern Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Portfolio</h1>
            <p className="text-gray-600 flex items-center">
              <span className="mr-2">📍</span>
              Discover and manage premium real estate listings
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary flex items-center gap-2" onClick={() => setEditingProperty(null)}>
                  <Plus className="h-5 w-5" />
                  Add New Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProperty ? "Edit Property" : "Add New Property"}
                  </DialogTitle>
                </DialogHeader>
                <PropertyForm
                  property={editingProperty}
                  onSuccess={handleCloseDialog}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Modern Filter Panel */}
        <div className="modern-filter-row">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, location, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="modern-input pl-11 pr-4"
              />
            </div>

            {/* Primary Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="modern-select w-40">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="flats">🏢 Apartments</SelectItem>
                  <SelectItem value="tenement">🏘️ Tenements</SelectItem>
                  <SelectItem value="bungalow">🏡 Bungalows</SelectItem>
                  <SelectItem value="land">🌳 Land</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
                <SelectTrigger className="modern-select w-36">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="0-50L">₹0-50L</SelectItem>
                  <SelectItem value="50L-1Cr">₹50L-1Cr</SelectItem>
                  <SelectItem value="1Cr-2Cr">₹1Cr-2Cr</SelectItem>
                  <SelectItem value="2Cr+">₹2Cr+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                <SelectTrigger className="modern-select w-32">
                  <SelectValue placeholder="BHK" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any BHK</SelectItem>
                  <SelectItem value="1">1 BHK</SelectItem>
                  <SelectItem value="2">2 BHK</SelectItem>
                  <SelectItem value="3">3 BHK</SelectItem>
                  <SelectItem value="4">4+ BHK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Secondary Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="modern-select w-32">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city || ""}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={furnishingFilter} onValueChange={setFurnishingFilter}>
                <SelectTrigger className="modern-select w-36">
                  <SelectValue placeholder="Furnishing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Furnishing</SelectItem>
                  <SelectItem value="furnished">🪑 Furnished</SelectItem>
                  <SelectItem value="semi-furnished">🛏️ Semi-Furnished</SelectItem>
                  <SelectItem value="unfurnished">📦 Unfurnished</SelectItem>
                </SelectContent>
              </Select>

              <Select value={parkingFilter} onValueChange={setParkingFilter}>
                <SelectTrigger className="modern-select w-32">
                  <SelectValue placeholder="Parking" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="yes">🚗 With Parking</SelectItem>
                  <SelectItem value="no">❌ No Parking</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                  setPriceRangeFilter("all");
                  setBedroomsFilter("all");
                  setCityFilter("all");
                  setFurnishingFilter("all");
                  setParkingFilter("all");
                }}
                className="px-4 py-2 text-sm hover:bg-gray-50 border-gray-200"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(search || categoryFilter !== "all" || priceRangeFilter !== "all" || bedroomsFilter !== "all" || cityFilter !== "all" || furnishingFilter !== "all" || parkingFilter !== "all") && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {search && <span className="filter-badge">Search: "{search}"</span>}
                {categoryFilter !== "all" && <span className="filter-badge">Type: {getCategoryLabel(categoryFilter)}</span>}
                {priceRangeFilter !== "all" && <span className="filter-badge">Price: {priceRangeFilter}</span>}
                {bedroomsFilter !== "all" && <span className="filter-badge">BHK: {bedroomsFilter}</span>}
                {cityFilter !== "all" && <span className="filter-badge">City: {cityFilter}</span>}
                {furnishingFilter !== "all" && <span className="filter-badge">Furnishing: {furnishingFilter}</span>}
                {parkingFilter !== "all" && <span className="filter-badge">Parking: {parkingFilter === "yes" ? "Required" : "Not Required"}</span>}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading properties...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search || categoryFilter !== "all" ? "No properties found matching your criteria" : "No properties yet"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-500">
                    <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MapPin size={24} />
                    </div>
                    <p className="text-sm">No image available</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-urban-text truncate">{property.title}</h4>
                    <Badge className={getCategoryBadge(property.category)}>
                      {getCategoryLabel(property.category)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.city ? `${property.city}, ${property.state}` : property.location}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-urban-text">
                      {formatCurrency(property.price)}
                    </div>
                    {property.bedrooms && property.bathrooms && (
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          {property.bedrooms} BHK
                        </span>
                        <span className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          {property.bathrooms} Bath
                        </span>
                      </div>
                    )}
                  </div>
                  {property.area && (
                    <div className="text-sm text-gray-500 mb-3">
                      Area: {property.area} sq ft
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge className={`status-badge ${property.status}`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 text-urban-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(property)}>
                        <Edit className="h-4 w-4 text-urban-secondary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(property.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-urban-accent" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
