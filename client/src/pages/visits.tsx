import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, Trash2, Star, StarIcon } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime, getInitials } from "@/lib/utils";
import VisitForm from "@/components/forms/visit-form";
import type { VisitWithDetails } from "@shared/schema";

export default function Visits() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitWithDetails | null>(null);
  const { toast } = useToast();

  const { data: visits = [], isLoading } = useQuery<VisitWithDetails[]>({
    queryKey: ["/api/visits"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/visits/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visits"] });
      toast({ title: "Visit deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete visit", variant: "destructive" });
    },
  });

  const filteredVisits = visits.filter((visit) => {
    const matchesSearch = visit.customer.name.toLowerCase().includes(search.toLowerCase()) ||
                         visit.property.title.toLowerCase().includes(search.toLowerCase()) ||
                         visit.property.location.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (visit: VisitWithDetails) => {
    setEditingVisit(visit);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVisit(null);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400">No rating</span>;
    
    return (
      <div className="flex items-center">
        <div className="flex text-yellow-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${star <= rating ? "fill-current" : ""}`}
            />
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-500">{rating}.0</span>
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-urban-text">Visit History Tracking</h2>
            <p className="text-sm text-gray-500">
              Track customer visits and feedback for all properties.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search visits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" onClick={() => setEditingVisit(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Visit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingVisit ? "Edit Visit" : "Log New Visit"}
                  </DialogTitle>
                </DialogHeader>
                <VisitForm
                  visit={editingVisit}
                  onSuccess={handleCloseDialog}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center">Loading visits...</div>
            ) : filteredVisits.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {search ? "No visits found matching your criteria" : "No visits logged yet"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Property</th>
                      <th>Visit Date</th>
                      <th>Feedback</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVisits.map((visit) => (
                      <tr key={visit.id}>
                        <td>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-urban-primary bg-opacity-10 rounded-full flex items-center justify-center">
                              <span className="text-urban-primary text-sm font-medium">
                                {getInitials(visit.customer.name)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-urban-text">{visit.customer.name}</div>
                              <div className="text-sm text-gray-500">{visit.customer.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm font-medium text-urban-text">{visit.property.title}</div>
                          <div className="text-sm text-gray-500">{visit.property.location}</div>
                        </td>
                        <td>
                          <div className="text-sm text-urban-text">{formatDateTime(visit.visitDate)}</div>
                        </td>
                        <td>
                          <div className="text-sm text-urban-text max-w-xs truncate">
                            {visit.feedback || "No feedback provided"}
                          </div>
                        </td>
                        <td>
                          {renderStars(visit.rating)}
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 text-urban-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(visit)}>
                              <Edit className="h-4 w-4 text-urban-secondary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(visit.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-urban-accent" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
