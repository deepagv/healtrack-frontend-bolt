import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  HelpCircle, 
  FileText, 
  Heart, 
  Activity,
  Download,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { NotificationSettings } from './NotificationSettings';
import { DataExportModal } from './DataExportModal';
import { signOut } from '../utils/supabase/client';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
  };
}

interface ProfileScreenProps {
  user: User;
  onSignOut: () => void;
}

export function ProfileScreen({ user, onSignOut }: ProfileScreenProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const profileData = {
    name: user.user_metadata?.name || 'User',
    email: user.email,
    age: 34,
    height: '5\'6"',
    weight: '142 lbs',
    bloodType: 'O+',
  };

  const conditions = ['Hypertension', 'High Cholesterol'];
  const allergies = ['Penicillin', 'Shellfish'];

  const handleSignOut = async () => {
    try {
      await signOut();
      onSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const menuItems = [
    {
      section: 'Health Profile',
      items: [
        { 
          icon: User, 
          label: 'Personal Information', 
          hasChevron: true,
          onClick: () => console.log('Navigate to personal info')
        },
        { 
          icon: Heart, 
          label: 'Conditions & Allergies', 
          hasChevron: true,
          onClick: () => console.log('Navigate to conditions')
        },
        { 
          icon: Activity, 
          label: 'Emergency Contacts', 
          hasChevron: true,
          onClick: () => console.log('Navigate to emergency contacts')
        },
      ],
    },
    {
      section: 'App Settings',
      items: [
        { 
          icon: Bell, 
          label: 'Notifications & Reminders', 
          hasChevron: true,
          onClick: () => setShowNotifications(true)
        },
        { 
          icon: Download, 
          label: 'Export Health Data', 
          hasChevron: true,
          onClick: () => setShowExport(true)
        },
        { 
          icon: Activity, 
          label: 'Connected Apps', 
          hasChevron: true,
          onClick: () => console.log('Navigate to connected apps')
        },
      ],
    },
    {
      section: 'Data & Privacy',
      items: [
        { 
          icon: Shield, 
          label: 'Privacy Settings', 
          hasChevron: true,
          onClick: () => console.log('Navigate to privacy settings')
        },
        { 
          icon: FileText, 
          label: 'Data Management', 
          hasChevron: true,
          onClick: () => console.log('Navigate to data management')
        },
        { 
          icon: Settings, 
          label: 'Account Settings', 
          hasChevron: true,
          onClick: () => console.log('Navigate to account settings')
        },
      ],
    },
    {
      section: 'Support',
      items: [
        { 
          icon: HelpCircle, 
          label: 'Help & FAQ', 
          hasChevron: true,
          onClick: () => console.log('Navigate to help')
        },
        { 
          icon: FileText, 
          label: 'Terms & Privacy Policy', 
          hasChevron: true,
          onClick: () => console.log('Navigate to terms')
        },
        { 
          icon: Settings, 
          label: 'About HealTrack', 
          hasChevron: true,
          onClick: () => console.log('Navigate to about')
        },
      ],
    },
  ];

  if (showNotifications) {
    return (
      <NotificationSettings 
        user={user} 
        onClose={() => setShowNotifications(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card p-4 border-b border-subtle">
        <h1 className="text-h2 font-semibold">Profile</h1>
        <p className="text-caption text-low">Manage your health profile and settings</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Info */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary-600 text-white text-h3">
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-h3 font-semibold">{profileData.name}</h2>
                <p className="text-body text-low">{profileData.email}</p>
                <Button variant="link" className="p-0 h-auto text-primary-600 text-caption">
                  Edit Profile
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-low">Age</p>
                <p className="text-body font-medium">{profileData.age} years</p>
              </div>
              <div>
                <p className="text-caption text-low">Blood Type</p>
                <p className="text-body font-medium">{profileData.bloodType}</p>
              </div>
              <div>
                <p className="text-caption text-low">Height</p>
                <p className="text-body font-medium">{profileData.height}</p>
              </div>
              <div>
                <p className="text-caption text-low">Weight</p>
                <p className="text-body font-medium">{profileData.weight}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <h3 className="text-body font-medium mb-2">Conditions</h3>
              {conditions.length > 0 ? (
                <div className="space-y-1">
                  {conditions.map((condition, index) => (
                    <p key={index} className="text-caption text-low">{condition}</p>
                  ))}
                </div>
              ) : (
                <p className="text-caption text-low italic">None reported</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <h3 className="text-body font-medium mb-2">Allergies</h3>
              {allergies.length > 0 ? (
                <div className="space-y-1">
                  {allergies.map((allergy, index) => (
                    <p key={index} className="text-caption text-low">{allergy}</p>
                  ))}
                </div>
              ) : (
                <p className="text-caption text-low italic">None reported</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-1"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="w-5 h-5" />
            <span className="text-caption">Notifications</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-1"
            onClick={() => setShowExport(true)}
          >
            <Download className="w-5 h-5" />
            <span className="text-caption">Export Data</span>
          </Button>
        </div>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="shadow-card">
            <CardHeader>
              <CardTitle className="text-h3">{section.section}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <button 
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-4 hover:bg-surface-subtle transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-low" />
                      <span className="text-body">{item.label}</span>
                    </div>
                    {item.hasChevron && <ChevronRight className="w-5 h-5 text-low" />}
                  </button>
                  {itemIndex < section.items.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Sign Out */}
        <Button 
          variant="outline" 
          className="w-full text-critical border-critical hover:bg-critical/5"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        {/* App Info */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-body font-medium">HealTrack</p>
                  <p className="text-caption text-low">Version 1.0.0</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-caption">
                <span className="text-low">OpenAI Integration</span>
                <span className="text-success">✓ Active</span>
              </div>
              <div className="flex items-center justify-between text-caption">
                <span className="text-low">Notifications</span>
                <span className="text-success">✓ Enabled</span>
              </div>
              <div className="flex items-center justify-between text-caption">
                <span className="text-low">Data Export</span>
                <span className="text-success">✓ Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Disclaimer */}
        <div className="bg-surface-subtle rounded-lg p-4">
          <h3 className="text-body font-medium mb-2">Important Disclaimer</h3>
          <p className="text-caption text-low">
            HealTrack is not intended to replace professional medical advice, diagnosis, or treatment. 
            Always consult with a qualified healthcare provider for medical concerns. 
            This app is designed for educational and organizational purposes only.
          </p>
        </div>
      </div>

      {/* Modals */}
      {showExport && (
        <DataExportModal 
          user={user} 
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}