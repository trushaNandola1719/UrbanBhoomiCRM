import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getInitials } from "@/lib/utils";
import BrokerForm from "@/components/forms/broker-form";
import type { Broker } from "@shared/schema";
import Header from "@/components/layout/header";

export default function Brokers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);
  const { toast } = useToast();

  const { data: brokers = [], isLoading } = useQuery<Broker[]>({
    queryKey: ["/api/brokers"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/brokers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brokers"] });
      toast({ title: "Broker deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete broker", variant: "destructive" });
    },
  });

  const filteredBrokers = brokers.filter((broker) => {
    const matchesSearch = broker.name.toLowerCase().includes(search.toLowerCase()) ||
                         broker.email.toLowerCase().includes(search.toLowerCase()) ||
                         broker.phone.includes(search);
    const matchesStatus = statusFilter === "all" || broker.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (broker: Broker) => {
    setEditingBroker(broker);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBroker(null);
  };

  return (
    <>
      {/* Header */}
      {/* <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-urban-text">Broker Management</h2>
            <p className="text-sm text-gray-500">
              Manage broker relationships and commission tracking.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search brokers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            </div>
            </div>
      </header> */}

      <Header title='Brokers'>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" onClick={() => setEditingBroker(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Broker
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingBroker ? "Edit Broker" : "Add New Broker"}
                  </DialogTitle>
                </DialogHeader>
                <BrokerForm
                  broker={editingBroker}
                  onSuccess={handleCloseDialog}
                />
              </DialogContent>
            </Dialog>
      </Header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center">Loading brokers...</div>
            ) : filteredBrokers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {search || statusFilter !== "all" ? "No brokers found matching your criteria" : "No brokers yet"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Broker</th>
                      <th>Contact</th>
                      <th>Specialization</th>
                      <th>Commission Rate</th>
                      <th>Total Commission</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBrokers.map((broker) => (
                      <tr key={broker.id}>
                        <td>
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-urban-primary bg-opacity-10 rounded-full flex items-center justify-center">
                              <span className="text-urban-primary font-medium text-sm">
                                {getInitials(broker.name)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-urban-text">{broker.name}</div>
                              <div className="text-sm text-gray-500">ID: BRK{broker.id.toString().padStart(3, '0')}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-urban-text">{broker.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{broker.email}</span>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm text-urban-text">
                            {broker.specialization ? 
                              JSON.parse(broker.specialization).join(", ") : 
                              "Not specified"
                            }
                          </div>
                        </td>
                        <td>
                          <div className="text-sm font-medium text-urban-text">
                            {broker.commissionRate}%
                          </div>
                        </td>
                        <td>
                          <div className="text-sm font-medium text-urban-text">
                            {formatCurrency(broker.totalCommission || "0")}
                          </div>
                        </td>
                        <td>
                          <Badge className={`status-badge ${broker.status}`}>
                            {broker.status.charAt(0).toUpperCase() + broker.status.slice(1)}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 text-urban-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(broker)}>
                              <Edit className="h-4 w-4 text-urban-secondary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(broker.id)}
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
