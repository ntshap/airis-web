import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase'; // Import supabase client
import { toast } from '@/components/ui/use-toast'; // Import toast untuk notifikasi

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
        return;
      }

      if (data?.user) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate('/');
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email first",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for the reset link",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send reset email",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <div className="flex justify-center py-6">
          <img 
            src="/airis-logo.svg" 
            alt="AIRIS Logo" 
            className="h-20 w-20"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-logo.svg';
              console.log('Logo failed to load');
            }}
          />
        </div>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">Welcome Back</CardTitle>
          <p className="text-gray-500">Sign in to continue to AIRIS</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <div className="text-right">
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <Separator className="my-4" />
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};