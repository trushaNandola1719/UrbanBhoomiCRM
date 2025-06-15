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
import { insertBrokerSchema } from "@shared/schema";
import type { Broker, InsertBroker } from "@shared/schema";
import { z } from "zod";

const formSchema = insertBrokerSchema.extend({
  commissionRate: z.string().min(1, "Commission rate is required"),
  totalCommission: z.string().optional(),
  specializations: z.string().optional(), // Comma-separated specializations
});

interface BrokerFormProps {
  broker?: Broker | null;
  onSuccess: () => void;
}

export default function BrokerForm({ broker, onSuccess }: BrokerFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: broker?.name || "",
      email: broker?.email || "",
      phone: broker?.phone || "",
      specializations: broker?.specialization ? 
        JSON.parse(broker.specialization).join(", ") : "",
      commissionRate: broker?.commissionRate || "2.5",
      totalCommission: broker?.totalCommission || "0",
      status: broker?.status || "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertBroker) => apiRequest("POST", "/api/brokers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brokers"] });
      toast({ title: "Broker created successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to create broker", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<InsertBroker>) => 
      apiRequest("PUT", `/api/brokers/${broker!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brokers"] });
      toast({ title: "Broker updated successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to update broker", variant: "destructive" });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const specializationsArray = values.specializations
      ? values.specializations.split(",").map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const data = {
      ...values,
      specialization: JSON.stringify(specializationsArray),
    };

    if (broker) {
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
                  <Input placeholder="+91 XXXXX XXXXX" {...field} />
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
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commissionRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commission Rate (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="100" 
                    placeholder="2.5" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalCommission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Commission (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="0" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specializations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specializations</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Luxury Apartments, Commercial Properties, Residential Plots" 
                  {...field} 
                />
              </FormControl>
              <div className="text-sm text-gray-500">
                Enter specializations separated by commas
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Saving..." : broker ? "Update Broker" : "Create Broker"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
