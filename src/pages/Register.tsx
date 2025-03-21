import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "Passwords do not match",
      });
      setLoading(false);
      return;
    }

    try {
      // Register user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (authError) throw authError;

      // Create profile in profiles table
      if (authData.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: authData.user.id,
                    name,
                    email: authData.user.email,  
                    created_at: new Date().toISOString()
                },
            ]);
    
        if (profileError) throw profileError;
    }

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account",
      });

      navigate('/login');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
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
          <CardTitle className="text-3xl font-bold text-gray-800">Create Account</CardTitle>
          <p className="text-gray-500">Start your AIRIS journey</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input 
                type="text" 
                placeholder="Enter your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                className="focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input 
                type="password" 
                placeholder="Create a strong password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <Input 
                type="password" 
                placeholder="Confirm your password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                className="focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <Separator className="my-4" />
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-green-600 hover:text-green-800 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};