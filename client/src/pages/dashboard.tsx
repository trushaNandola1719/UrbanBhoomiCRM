import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Users, Home, CalendarCheck, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  return (
    <>
      {/* Modern Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600 flex items-center">
              <span className="mr-2">🏢</span>
              Welcome to Urban Bhoomi CRM - Your premium real estate hub
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card className="stats-card group hover:scale-105 transition-transform duration-200">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Users className="text-white" size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">
                      {isLoading ? "..." : metrics?.totalCustomers || 0}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">Total Customers</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="text-green-500 mr-2" size={16} />
                  <span className="text-sm text-green-600 font-medium">+12% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Properties</p>
                  <p className="text-3xl font-bold text-urban-text">
                    {isLoading ? "..." : metrics?.activeProperties || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-urban-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Home className="text-urban-secondary" size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-urban-success text-sm font-medium">+8.2%</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Visits This Month</p>
                  <p className="text-3xl font-bold text-urban-text">
                    {isLoading ? "..." : metrics?.visitsThisMonth || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                  <CalendarCheck className="text-yellow-600" size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-urban-success text-sm font-medium">+24.1%</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Revenue</p>
                  <p className="text-3xl font-bold text-urban-text">
                    {isLoading ? "..." : formatCurrency(metrics?.totalRevenue || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-urban-success text-sm font-medium">+18.7%</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities and Top Properties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Customers */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-urban-text">Recent Customers</h3>
            </div>
            <div className="p-6 space-y-4">
              {customers.slice(0, 5).map((customer: any) => (
                <div key={customer.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-urban-primary bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="text-urban-primary" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-urban-text">
                      New customer <span className="font-medium">{customer.name}</span> registered
                    </p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                </div>
              ))}
              {customers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No customers yet</p>
              )}
            </div>
          </Card>

          {/* Top Properties */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-urban-text">Recent Properties</h3>
            </div>
            <div className="p-6 space-y-4">
              {properties.slice(0, 5).map((property: any) => (
                <div key={property.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Home className="text-gray-500" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-urban-text">{property.title}</p>
                      <p className="text-sm text-gray-500">{property.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-urban-text">{formatCurrency(property.price)}</p>
                    <p className="text-sm text-urban-success capitalize">{property.status}</p>
                  </div>
                </div>
              ))}
              {properties.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No properties yet</p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
