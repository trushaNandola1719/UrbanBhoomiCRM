import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Clock, 
  User, 
  Home, 
  MessageSquare, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Pause,
  X,
  Filter
} from "lucide-react";
import { formatDateTime, getRelativeTime } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InteractionWithDetails, Customer, Broker, Property } from "@shared/schema";
import InteractionForm from "@/components/forms/interaction-form";

export default function Interactions() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<InteractionWithDetails | null>(null);
  const { toast } = useToast();

  const { data: interactions = [], isLoading } = useQuery<InteractionWithDetails[]>({
    queryKey: ["/api/interactions"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: brokers = [] } = useQuery<Broker[]>({
    queryKey: ["/api/brokers"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/interactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interactions"] });
      toast({ title: "Interaction deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete interaction", variant: "destructive" });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      apiRequest("PATCH", `/api/interactions/${id}/pause`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interactions"] });
      toast({ title: "Interaction paused successfully" });
    },
    onError: () => {
      toast({ title: "Failed to pause interaction", variant: "destructive" });
    },
  });

  const endMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      apiRequest("PATCH", `/api/interactions/${id}/end`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interactions"] });
      toast({ title: "Interaction ended successfully" });
    },
    onError: () => {
      toast({ title: "Failed to end interaction", variant: "destructive" });
    },
  });

  const filteredInteractions = interactions.filter((interaction) => {
    const matchesSearch = interaction.title.toLowerCase().includes(search.toLowerCase()) ||
                         interaction.customer.name.toLowerCase().includes(search.toLowerCase()) ||
                         interaction.broker.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === "all" || interaction.type === typeFilter;
    const matchesStatus = statusFilter === "all" || interaction.status === statusFilter;
    const matchesCustomer = customerFilter === "all" || interaction.customerId.toString() === customerFilter;
    const matchesBroker = brokerFilter === "all" || interaction.brokerId.toString() === brokerFilter;
    const matchesPriority = priorityFilter === "all" || interaction.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesCustomer && matchesBroker && matchesPriority;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "digital_sharing": return <MessageSquare className="h-4 w-4" />;
      case "follow_up": return <Clock className="h-4 w-4" />;
      case "property_visit": return <Home className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "digital_sharing": return "Digital Sharing";
      case "follow_up": return "Follow Up";
      case "property_visit": return "Property Visit";
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "paused": return "bg-gray-100 text-gray-800";
      case "ended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-amber-100 text-amber-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleEdit = (interaction: InteractionWithDetails) => {
    setEditingInteraction(interaction);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInteraction(null);
    queryClient.invalidateQueries({ queryKey: ["/api/interactions"] });
  };

  const getOverdueInteractions = () => {
    const now = new Date();
    const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
    
    return interactions.filter(interaction => 
      (interaction.status === "pending" || interaction.status === "in_progress") &&
      new Date(interaction.updatedAt) < twentyDaysAgo
    );
  };

  const overdueCount = getOverdueInteractions().length;

  return (
    <>
      {/* Modern Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Interactions</h1>
            <p className="text-gray-600 flex items-center">
              <span className="mr-2">📞</span>
              Track all customer touchpoints and follow-ups
            </p>
            {overdueCount > 0 && (
              <div className="mt-2">
                <Badge className="bg-red-100 text-red-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {overdueCount} overdue interactions
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary flex items-center gap-2" onClick={() => setEditingInteraction(null)}>
                  <Plus className="h-5 w-5" />
                  New Interaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingInteraction ? "Edit Interaction" : "Create New Interaction"}
                  </DialogTitle>
                </DialogHeader>
                <InteractionForm
                  interaction={editingInteraction}
                  onSuccess={handleCloseDialog}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="modern-filter-row">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search interactions, customers, or brokers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="modern-input pl-11 pr-4"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="modern-select w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="digital_sharing">📤 Digital Sharing</SelectItem>
                  <SelectItem value="follow_up">📞 Follow Up</SelectItem>
                  <SelectItem value="property_visit">🏠 Property Visit</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="modern-select w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                  <SelectItem value="in_progress">🔄 In Progress</SelectItem>
                  <SelectItem value="completed">✅ Completed</SelectItem>
                  <SelectItem value="paused">⏸️ Paused</SelectItem>
                  <SelectItem value="ended">❌ Ended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="modern-select w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setCustomerFilter("all");
                  setBrokerFilter("all");
                  setPriorityFilter("all");
                }}
                className="px-4 py-2 text-sm"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="text-center py-8">Loading interactions...</div>
        ) : filteredInteractions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search || typeFilter !== "all" || statusFilter !== "all" ? 
              "No interactions found matching your criteria" : 
              "No interactions yet"
            }
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInteractions.map((interaction) => (
              <Card key={interaction.id} className="property-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTypeIcon(interaction.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{interaction.title}</h3>
                          <p className="text-sm text-gray-600">{getTypeLabel(interaction.type)}</p>
                        </div>
                        <div className="flex gap-2 ml-auto">
                          <Badge className={getStatusBadge(interaction.status)}>
                            {interaction.status.replace("_", " ")}
                          </Badge>
                          <Badge className={getPriorityBadge(interaction.priority)}>
                            {interaction.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{interaction.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Agent: {interaction.broker.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {getRelativeTime(interaction.updatedAt)}
                          </span>
                        </div>
                      </div>

                      {interaction.description && (
                        <p className="text-gray-700 mb-4">{interaction.description}</p>
                      )}

                      {interaction.nextFollowUpDate && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 mb-4">
                          <Clock className="h-4 w-4" />
                          Next follow-up: {formatDateTime(interaction.nextFollowUpDate)}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(interaction)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Edit
                      </Button>
                      {(interaction.status === "pending" || interaction.status === "in_progress") && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => pauseMutation.mutate({ id: interaction.id, reason: "Manual pause" })}
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => endMutation.mutate({ id: interaction.id, reason: "Manual end" })}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
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