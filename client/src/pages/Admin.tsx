import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AdminPanel from "@/components/admin/AdminPanel";
import PasswordChange from "@/components/admin/PasswordChange";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const Admin = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Check if user is authenticated and is admin
  const { data: authData, isError } = useQuery({
    queryKey: ['/api/auth/check-admin'],
    retry: false,
  });
  
  useEffect(() => {
    if (isError) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in as an admin to access this page",
        variant: "destructive",
      });
      navigate("/admin/login");
    }
  }, [isError, navigate, toast]);
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/admin/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };
  
  if (!authData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">PlateCustomizer Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Logged in as <span className="font-semibold">{authData.username}</span>
            </span>
            <PasswordChange />
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>
      
      <AdminPanel />
    </div>
  );
};

export default Admin;
