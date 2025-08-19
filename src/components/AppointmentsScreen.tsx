import React, { useState } from 'react';
import { Calendar, Plus, Video, MapPin, Phone, Clock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function AppointmentsScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const appointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: 'Today',
      time: '2:30 PM',
      type: 'video',
      clinic: 'Heart Health Center',
      notes: 'Follow-up on cholesterol levels',
      avatar: null,
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'Primary Care',
      date: 'Tomorrow',
      time: '10:00 AM',
      type: 'in-person',
      clinic: 'Downtown Medical',
      notes: 'Annual physical examination',
      avatar: null,
    },
    {
      id: 3,
      doctor: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      date: 'Mar 25',
      time: '3:15 PM',
      type: 'in-person',
      clinic: 'Skin Care Specialists',
      notes: 'Mole check appointment',
      avatar: null,
    },
  ];

  const doctors = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      clinic: 'Heart Health Center',
      phone: '(555) 123-4567',
      email: 'sjohnson@hearthealth.com',
      rating: 4.9,
      avatar: null,
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Primary Care',
      clinic: 'Downtown Medical',
      phone: '(555) 234-5678',
      email: 'mchen@downmed.com',
      rating: 4.8,
      avatar: null,
    },
    {
      name: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      clinic: 'Skin Care Specialists',
      phone: '(555) 345-6789',
      email: 'erodriguez@skincare.com',
      rating: 4.9,
      avatar: null,
    },
  ];

  const getAppointmentIcon = (type: string) => {
    return type === 'video' ? Video : MapPin;
  };

  const getAppointmentTypeColor = (type: string) => {
    return type === 'video' ? 'text-accent border-accent' : 'text-success border-success';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card p-4 border-b border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 font-semibold">Appointments</h1>
            <p className="text-caption text-low">Manage your healthcare schedule</p>
          </div>
          <Button size="icon" className="bg-primary-600 hover:bg-primary-700">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Calendar Strip - Simplified for mobile */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-primary-600" />
              <span className="text-body font-medium">March 2024</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center p-2">
                  <span className="text-caption text-low">{day}</span>
                </div>
              ))}
              {[25, 26, 27, 28, 29, 30, 31].map((date) => (
                <div
                  key={date}
                  className={`text-center p-2 rounded-lg cursor-pointer ${
                    date === 29 
                      ? 'bg-primary-600 text-white' 
                      : 'hover:bg-surface-subtle'
                  }`}
                >
                  <span className="text-body">{date}</span>
                  {(date === 29 || date === 30) && (
                    <div className="w-1 h-1 bg-current rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <div>
          <h2 className="text-h3 font-semibold mb-3">Upcoming</h2>
          <div className="space-y-3">
            {appointments.map((appointment) => {
              const Icon = getAppointmentIcon(appointment.type);
              return (
                <Card key={appointment.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {appointment.doctor.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="text-body font-medium">{appointment.doctor}</h3>
                            <p className="text-caption text-low">{appointment.specialty}</p>
                          </div>
                          <Badge variant="outline" className={getAppointmentTypeColor(appointment.type)}>
                            <Icon className="w-3 h-3 mr-1" />
                            {appointment.type === 'video' ? 'Video' : 'In-person'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-low" />
                            <span className="text-caption text-low">{appointment.date} at {appointment.time}</span>
                          </div>
                        </div>
                        
                        <p className="text-caption text-low mb-3">{appointment.notes}</p>
                        
                        <div className="flex gap-2">
                          {appointment.type === 'video' ? (
                            <Button size="sm" className="bg-accent hover:bg-accent/90">
                              <Video className="w-4 h-4 mr-1" />
                              Join Video
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline">
                              <MapPin className="w-4 h-4 mr-1" />
                              Navigate
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Book Appointment CTA */}
        <Card className="shadow-card border-primary-600/20 bg-gradient-to-r from-primary-600/5 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-600/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-h3 font-semibold mb-1">Need an appointment?</h3>
                <p className="text-caption text-low">Book with your healthcare providers</p>
              </div>
              <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                Book Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Contacts */}
        <div>
          <h2 className="text-h3 font-semibold mb-3">Your Doctors</h2>
          <div className="space-y-3">
            {doctors.map((doctor, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="text-body font-medium">{doctor.name}</h3>
                      <p className="text-caption text-low">{doctor.specialty} • {doctor.clinic}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-caption text-warning">★</span>
                        <span className="text-caption text-low">{doctor.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="w-8 h-8">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="w-8 h-8">
                        <User className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}