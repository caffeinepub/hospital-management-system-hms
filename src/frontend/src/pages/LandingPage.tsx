import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Activity, Shield, Clock, Heart } from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  useEffect(() => {
    if (identity && userProfile) {
      const role = userProfile.appRole;
      if (role === 'patient') navigate({ to: '/patient' });
      else if (role === 'doctor') navigate({ to: '/doctor' });
      else if (role === 'admin') navigate({ to: '/admin' });
    }
  }, [identity, userProfile, navigate]);

  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments with your preferred doctors in just a few clicks.',
    },
    {
      icon: Users,
      title: 'Expert Medical Staff',
      description: 'Access a network of qualified doctors and healthcare professionals.',
    },
    {
      icon: Activity,
      title: 'Health Tracking',
      description: 'Keep track of your medical history and appointment records.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is protected with blockchain technology.',
    },
    {
      icon: Clock,
      title: 'Timely Reminders',
      description: 'Never miss an appointment with our notification system.',
    },
    {
      icon: Heart,
      title: 'Patient-Centered Care',
      description: 'Experience healthcare designed around your needs.',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center space-y-6 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Modern Healthcare
                  <span className="block text-primary">Management System</span>
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl">
                  Experience seamless healthcare management with our secure, blockchain-powered platform. Book
                  appointments, track your health, and connect with medical professionals.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" onClick={login} className="text-lg">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={login} className="text-lg">
                  Sign In
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/assets/generated/hms-hero.dim_1600x900.png"
                alt="Hospital Management"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Why Choose HMS?</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Our platform combines cutting-edge technology with patient-centered care to deliver the best healthcare
              experience.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Get Started?</h2>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Join thousands of patients who trust HMS for their healthcare needs. Sign up today and experience the
                future of healthcare management.
              </p>
              <Button size="lg" onClick={login} className="text-lg">
                Create Your Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
