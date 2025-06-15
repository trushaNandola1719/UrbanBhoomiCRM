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
                         property.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || property.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-urban-text">Property Management</h2>
            <p className="text-sm text-gray-500">
              View and manage all property listings and details.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search properties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="flats">Flats</SelectItem>
                <SelectItem value="tenement">Tenement</SelectItem>
                <SelectItem value="bungalow">Bungalow</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" onClick={() => setEditingProperty(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
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
                    {property.location}
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
