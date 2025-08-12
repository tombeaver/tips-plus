import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  BarChart3, 
  CloudSun, 
  Lightbulb,
  ArrowRight,
  Star,
  Download,
  Smartphone,
  FileCode
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const features = [
    {
      icon: Calendar,
      title: "Earnings Calendar",
      description: "Track your daily tips with an intuitive calendar view. See your earnings patterns at a glance and never miss logging your daily income.",
      highlight: "Visual tip tracking"
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set and track daily, weekly, monthly, or yearly earning goals. Stay motivated with progress indicators and achievement tracking.",
      highlight: "Smart goal tracking"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into your earning patterns with beautiful charts, trends analysis, and performance metrics.",
      highlight: "Data-driven insights"
    },
    {
      icon: CloudSun,
      title: "Weather Correlation",
      description: "Discover how weather affects your tips. Our smart tracking helps you identify the best days to work for maximum earnings.",
      highlight: "Weather intelligence"
    },
    {
      icon: Lightbulb,
      title: "Predictive Planning",
      description: "AI-powered predictions help you plan your schedule for optimal earnings based on historical data and trends.",
      highlight: "Smart predictions"
    },
    {
      icon: TrendingUp,
      title: "Performance Insights",
      description: "Get detailed breakdowns of your earning performance with actionable insights to maximize your tip income.",
      highlight: "Performance optimization"
    }
  ];

  const stats = [
    { number: "10K+", label: "Tips Tracked" },
    { number: "500+", label: "Active Users" },
    { number: "25%", label: "Average Increase" },
    { number: "4.9", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen bg-gradient-prism-ethereal">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <span className="heading-sm">TipTracker</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#insights" className="text-muted-foreground hover:text-foreground transition-colors">Insights</a>
              <a href="#download" className="text-muted-foreground hover:text-foreground transition-colors">Download</a>
              <Link to="/export" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <FileCode className="h-4 w-4" />
                Export
              </Link>
            </div>
            <Button variant="prism" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-6">
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit">
                  <Star className="h-3 w-3 mr-1" />
                  #1 Tip Tracking App
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Maximize Your{' '}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Tip Income
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  The smart way to track, analyze, and optimize your tip earnings. 
                  Join thousands of service workers who've increased their income by 25% on average.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="prism" className="group">
                    Download App
                    <Download className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline">
                    View Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-6 mt-12 lg:mt-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-prism-spectrum opacity-20 blur-3xl rounded-full"></div>
                <Card className="relative card-enhanced p-8 text-center">
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {stats.map((stat, index) => (
                        <div key={index} className="space-y-1">
                          <div className="text-2xl font-bold text-primary">{stat.number}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Features</Badge>
            <h2 className="heading-lg">Everything you need to succeed</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools designed specifically for service workers to track, 
              analyze, and maximize their tip earnings.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="card-enhanced hover:card-glow group cursor-pointer">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feature.highlight}
                      </Badge>
                    </div>
                    <h3 className="heading-sm">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section id="insights" className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <Badge variant="secondary">Smart Analytics</Badge>
              <h2 className="heading-lg">Data-driven decisions for better earnings</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Track Daily Performance</h4>
                    <p className="text-muted-foreground">Log tips instantly with our intuitive calendar interface</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Analyze Patterns</h4>
                    <p className="text-muted-foreground">Discover trends in your earnings with advanced analytics</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Optimize Schedule</h4>
                    <p className="text-muted-foreground">Use insights to work smarter and earn more</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <Card className="card-enhanced">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="heading-sm">This Week's Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monday</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="w-3/4 h-full bg-gradient-primary"></div>
                          </div>
                          <span className="text-sm font-medium">$45</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Tuesday</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="w-4/5 h-full bg-gradient-primary"></div>
                          </div>
                          <span className="text-sm font-medium">$52</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Wednesday</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="w-full h-full bg-gradient-primary"></div>
                          </div>
                          <span className="text-sm font-medium">$67</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h2 className="heading-lg">Ready to maximize your tips?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of service workers who've transformed their earning potential with TipTracker.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="prism" className="group">
                Download for iOS
                <Download className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
              </Button>
              <Button size="lg" variant="prism" className="group">
                Download for Android
                <Download className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">TipTracker</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 TipTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
