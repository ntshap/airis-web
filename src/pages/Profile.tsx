import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { formatDistance } from "date-fns";
import { 
  Edit, 
  Key, 
  Bell, 
  Shield, 
  LogOut, 
  Camera, 
  User as UserIcon, 
  Mail, 
  Calendar 
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.full_name || '');

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Unable to log out. Please try again."
      });
    }
  };

  const profileSections = [
    {
      icon: <Edit className="h-5 w-5 text-blue-400" />,
      title: "Edit Profile",
      description: "Update your personal information",
      action: () => setIsEditing(true)
    },
    {
      icon: <Key className="h-5 w-5 text-green-400" />,
      title: "Change Password",
      description: "Reset your account password",
      action: () => navigate('/reset-password')
    },
    {
      icon: <Bell className="h-5 w-5 text-purple-400" />,
      title: "Notifications",
      description: "Manage your preferences",
      action: () => {} // Implement notification settings
    },
    {
      icon: <Shield className="h-5 w-5 text-red-400" />,
      title: "Privacy & Security",
      description: "Manage account security",
      action: () => {} // Implement security settings
    }
  ];

  return (
    <div className="min-h-screen bg-dashboard-background dark:bg-dashboard-background-light text-white dark:text-gray-900">
      <Header />
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="md:col-span-1">
            <Card className="bg-dashboard-card dark:bg-white border-none shadow-xl">
              <CardContent className="p-6">
                <div className="relative flex flex-col items-center">
                  <div className="relative group">
                    <img 
                      src={user?.user_metadata?.avatar_url || "/user1.png"}
                      alt="Profile"
                      className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-dashboard-card dark:border-gray-200 group-hover:opacity-70 transition-opacity"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="absolute bottom-2 right-0 bg-blue-500 text-white hover:bg-blue-600 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {isEditing ? (
                    <div className="w-full space-y-2">
                      <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-gray-700 dark:bg-gray-100 text-white dark:text-gray-900"
                      />
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleUpdateProfile} 
                          className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold mt-2 text-white dark:text-gray-900">
                        {user?.user_metadata?.full_name}
                      </h2>
                      <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-600 mt-2">
                        <Mail className="h-4 w-4" />
                        <p>{user?.email}</p>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-600 mt-1">
                        <Calendar className="h-4 w-4" />
                        <p>
                          Member since {user?.user_metadata?.created_at 
                            ? formatDistance(
                                new Date(user.user_metadata.created_at), 
                                new Date(),
                                { addSuffix: true }
                              )
                            : 'N/A'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Actions */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-dashboard-card dark:bg-white border-none shadow-xl">
              <CardHeader className="border-b border-gray-700 dark:border-gray-200">
                <CardTitle className="text-white dark:text-gray-900">
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {profileSections.map((section, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-800 dark:bg-gray-100 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-700 dark:hover:bg-gray-200 transition cursor-pointer group"
                      onClick={section.action}
                    >
                      <div className="bg-gray-700 dark:bg-gray-200 p-3 rounded-full group-hover:bg-gray-600 dark:group-hover:bg-gray-300 transition">
                        {section.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white dark:text-gray-900 group-hover:text-blue-400 dark:group-hover:text-blue-600 transition">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-400 dark:text-gray-600">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Button 
              variant="destructive" 
              className="w-full mt-4 bg-red-500 hover:bg-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};