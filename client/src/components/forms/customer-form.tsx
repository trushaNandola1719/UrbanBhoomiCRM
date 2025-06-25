import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCustomerSchema } from "@shared/schema";
import type { Customer, InsertCustomer } from "@shared/schema";
import { z } from "zod";

const formSchema = insertCustomerSchema.extend({
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
});

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess: () => void;
}

export default function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      alternatePhone: customer?.alternatePhone || "",
      city: customer?.city || "",
      state: customer?.state || "",
      occupation: customer?.occupation || "",
      caste: customer?.caste || "",
      priority: customer?.priority || "",
      purpose: customer?.purpose || "",
      preferences: customer?.preferences || "",
      budgetMin: customer?.budgetMin || "",
      budgetMax: customer?.budgetMax || "",
      notes: customer?.notes || "",
      status: customer?.status || "active",
      lastCallDate: customer?.lastCallDate ? new Date(customer.lastCallDate) : undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertCustomer) => apiRequest("POST", "/api/customers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Customer created successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to create customer", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<InsertCustomer>) => 
      apiRequest("PUT", `/api/customers/${customer!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Customer updated successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to update customer", variant: "destructive" });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data = {
      ...values,
      lastCallDate: values.lastCallDate || null,
    };

    if (customer) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="XXXXX XXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="XXXXX XXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    {/* <SelectItem value="follow-up">Follow-up</SelectItem> */}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <FormField
          control={form.control}
          name="preferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type Preference</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2-3 BHK Apartment, Independent Bungalow" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel className="text-sm font-medium text-urban-text mb-2 block">Budget Range</FormLabel>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="budgetMin"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Min budget (₹)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budgetMax"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Max budget (₹)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  rows={3} 
                  placeholder="Any additional requirements or notes..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
