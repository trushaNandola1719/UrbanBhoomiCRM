import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertInteractionSchema } from "@shared/schema";
import type { InteractionWithDetails, Customer, Broker, Property } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";

const formSchema = insertInteractionSchema.extend({
  customerId: z.string().min(1, "Customer is required"),
  brokerId: z.string().min(1, "Broker is required"),
  propertyId: z.string().optional(),
  sharedPropertyIds: z.array(z.string()).optional(),
  visitDate: z.string().optional(),
  scheduledDate: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
  rating: z.string().optional(),
});

interface InteractionFormProps {
  interaction?: InteractionWithDetails | null;
  onSuccess: () => void;
}

export default function InteractionForm({ interaction, onSuccess }: InteractionFormProps) {
  const [selectedProperties, setSelectedProperties] = useState<string[]>(
    interaction?.sharedProperties ? JSON.parse(interaction.sharedProperties) : []
  );
  const { toast } = useToast();

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: brokers = [] } = useQuery<Broker[]>({
    queryKey: ["/api/brokers"],
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: interaction?.type || "follow_up",
      title: interaction?.title || "",
      description: interaction?.description || "",
      customerId: interaction?.customerId?.toString() || "",
      brokerId: interaction?.brokerId?.toString() || "",
      propertyId: interaction?.propertyId?.toString() || "",
      priority: interaction?.priority || "medium",
      status: interaction?.status || "pending",
      scheduledDate: interaction?.scheduledDate ? 
        new Date(interaction.scheduledDate).toISOString().slice(0, 16) : "",
      visitDate: interaction?.visitDate ? 
        new Date(interaction.visitDate).toISOString().slice(0, 16) : "",
      nextFollowUpDate: interaction?.nextFollowUpDate ? 
        new Date(interaction.nextFollowUpDate).toISOString().slice(0, 16) : "",
      customerFeedback: interaction?.customerFeedback || "",
      rating: interaction?.rating?.toString() || "",
      notes: interaction?.notes || "",
    },
  });

  const watchType = form.watch("type");

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/interactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interactions"] });
      toast({ title: "Interaction created successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to create interaction", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/interactions/${interaction?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interactions"] });
      toast({ title: "Interaction updated successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to update interaction", variant: "destructive" });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data = {
      ...values,
      customerId: parseInt(values.customerId),
      brokerId: parseInt(values.brokerId),
      propertyId: values.propertyId ? parseInt(values.propertyId) : null,
      rating: values.rating ? parseInt(values.rating) : null,
      sharedProperties: watchType === "digital_sharing" ? JSON.stringify(selectedProperties) : null,
      scheduledDate: values.scheduledDate ? new Date(values.scheduledDate).toISOString() : null,
      visitDate: values.visitDate ? new Date(values.visitDate).toISOString() : null,
      nextFollowUpDate: values.nextFollowUpDate ? new Date(values.nextFollowUpDate).toISOString() : null,
    };

    if (interaction) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handlePropertySelection = (propertyId: string, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, propertyId]);
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interaction Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="digital_sharing">📤 Digital Property Sharing</SelectItem>
                        <SelectItem value="follow_up">📞 Follow Up Call</SelectItem>
                        <SelectItem value="property_visit">🏠 Property Visit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">🔴 High</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="low">🟢 Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title for this interaction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brokerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Broker/Agent</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select broker" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brokers.map(broker => (
                          <SelectItem key={broker.id} value={broker.id.toString()}>
                            {broker.name} - {broker.affiliation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Type-specific Fields */}
        {watchType === "digital_sharing" && (
          <Card>
            <CardHeader>
              <CardTitle>Digital Property Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FormLabel>Select Properties to Share</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                  {properties.map(property => (
                    <div key={property.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={`property-${property.id}`}
                        checked={selectedProperties.includes(property.id.toString())}
                        onCheckedChange={(checked) => 
                          handlePropertySelection(property.id.toString(), !!checked)
                        }
                      />
                      <label 
                        htmlFor={`property-${property.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <p className="text-xs text-gray-500">{property.location}</p>
                          <p className="text-xs text-gray-500">₹{property.price}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Selected: {selectedProperties.length} properties
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {watchType === "property_visit" && (
          <Card>
            <CardHeader>
              <CardTitle>Property Visit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property to visit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map(property => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.title} - {property.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Feedback</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        placeholder="Customer's feedback about the property visit" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Rating (1-5 stars)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">⭐ 1 Star</SelectItem>
                        <SelectItem value="2">⭐⭐ 2 Stars</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ 3 Stars</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ 4 Stars</SelectItem>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Scheduling and Follow-up */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduling & Follow-up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextFollowUpDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Follow-up Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <SelectItem value="pending">⏳ Pending</SelectItem>
                      <SelectItem value="in_progress">🔄 In Progress</SelectItem>
                      <SelectItem value="completed">✅ Completed</SelectItem>
                      <SelectItem value="paused">⏸️ Paused</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3} 
                      placeholder="Detailed description of the interaction" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={2} 
                      placeholder="Internal notes for team reference" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "Saving..." : interaction ? "Update Interaction" : "Create Interaction"}
          </Button>
        </div>
      </form>
    </Form>
  );
}