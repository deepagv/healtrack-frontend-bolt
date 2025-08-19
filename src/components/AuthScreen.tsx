import React, { useState } from 'react';
import { Eye, EyeOff, Heart, Shield, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { signIn, signUp } from '../utils/supabase/client';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user, error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        setError(error.message || 'Sign in failed');
      } else if (user) {
        onAuthSuccess(user);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the terms and privacy policy');
      setLoading(false);
      return;
    }

    try {
      const { user, error } = await signUp(signUpData.email, signUpData.password, signUpData.name);
      
      if (error) {
        setError(error.message || 'Sign up failed');
      } else if (user) {
        onAuthSuccess(user);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    // For demo purposes, create a mock user
    const mockUser = {
      id: 'guest-user',
      email: 'guest@healtrack.com',
      user_metadata: { name: 'Guest User' }
    };
    onAuthSuccess(mockUser);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-primary-600/5 via-background to-accent/5">
      {/* Header */}
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-h1 font-bold text-foreground mb-2">HealTrack</h1>
        <p className="text-body text-low">Your health, organized.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-md mx-auto">
          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-caption text-low">Track Health</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <p className="text-caption text-low">AI Insights</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <p className="text-caption text-low">Appointments</p>
            </div>
          </div>

          {/* Auth Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-h2 text-center">Welcome</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {error && (
                  <div className="bg-critical/10 border border-critical/20 rounded-lg p-3 mb-4">
                    <p className="text-caption text-critical">{error}</p>
                  </div>
                )}

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                        className="h-12 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-primary-600 hover:bg-primary-700"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Full name"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>

                    <div>
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                        className="h-12 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div>
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                        className="mt-1"
                      />
                      <label htmlFor="terms" className="text-caption text-low leading-relaxed">
                        I agree to the Terms & Privacy Policy and understand that this app is not a substitute for professional medical advice.
                      </label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-primary-600 hover:bg-primary-700"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Social Sign In */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-caption">
                    <span className="bg-background px-2 text-low">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button variant="outline" className="h-12">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="h-12">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Apple
                  </Button>
                </div>
              </div>

              {/* Guest Access */}
              <div className="mt-6 text-center">
                <Button 
                  variant="link" 
                  className="text-primary-600"
                  onClick={handleGuestAccess}
                >
                  Continue as Guest (Demo Mode)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Medical Disclaimer */}
          <div className="mt-6 bg-warning/5 border border-warning/20 rounded-lg p-4">
            <h3 className="text-body font-medium mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-warning" />
              Important Medical Disclaimer
            </h3>
            <p className="text-caption text-low">
              HealTrack is designed for health tracking and organization purposes only. 
              It is not intended to diagnose, treat, cure, or prevent any disease. 
              Always consult with qualified healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}