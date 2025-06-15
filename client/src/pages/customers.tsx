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
import { formatCurrency, getInitials, getRelativeTime } from "@/lib/utils";
import CustomerForm from "@/components/forms/customer-form";
import type { Customer } from "@shared/schema";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Customer deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete customer", variant: "destructive" });
    },
  });

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(search.toLowerCase()) ||
                         customer.email.toLowerCase().includes(search.toLowerCase()) ||
                         customer.phone.includes(search);
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-urban-success bg-opacity-10 text-urban-success",
      inactive: "bg-gray-500 bg-opacity-10 text-gray-500",
      "follow-up": "bg-yellow-500 bg-opacity-10 text-yellow-600",
    };
    return variants[status as keyof typeof variants] || variants.active;
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-urban-text">Customer Management</h2>
            <p className="text-sm text-gray-500">
              Manage your customer database and track their preferences.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search customers..."
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
                <SelectItem value="follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" onClick={() => setEditingCustomer(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCustomer ? "Edit Customer" : "Add New Customer"}
                  </DialogTitle>
                </DialogHeader>
                <CustomerForm
                  customer={editingCustomer}
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
              <div className="p-6 text-center">Loading customers...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {search || statusFilter !== "all" ? "No customers found matching your criteria" : "No customers yet"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Preferences</th>
                      <th>Last Call</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-urban-primary bg-opacity-10 rounded-full flex items-center justify-center">
                              <span className="text-urban-primary font-medium text-sm">
                                {getInitials(customer.name)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-urban-text">{customer.name}</div>
                              <div className="text-sm text-gray-500">ID: CUS{customer.id.toString().padStart(3, '0')}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-urban-text">{customer.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{customer.email}</span>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm text-urban-text">{customer.preferences || "Not specified"}</div>
                          {customer.budgetMin && customer.budgetMax && (
                            <div className="text-sm text-gray-500">
                              Budget: {formatCurrency(customer.budgetMin)} - {formatCurrency(customer.budgetMax)}
                            </div>
                          )}
                        </td>
                        <td className="text-sm text-gray-500">
                          {customer.lastCallDate ? getRelativeTime(customer.lastCallDate) : "Never"}
                        </td>
                        <td>
                          <Badge className={`status-badge ${customer.status}`}>
                            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 text-urban-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                              <Edit className="h-4 w-4 text-urban-secondary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(customer.id)}
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
