import React, { useState } from 'react';
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
  Check,
  DollarSign,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import appIcon from '@/assets/app-icon-new.png';

const Landing = () => {
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: "Earnings Calendar",
      description: "Track your daily tips with an intuitive calendar view. See your earnings patterns at a glance.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: Target,
      title: "Smart Goal Setting",
      description: "Set daily, weekly, monthly, or yearly earning goals with progress tracking and achievement badges.",
      color: "from-violet-500 to-purple-600"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Beautiful charts and insights reveal your earning patterns and help you optimize your schedule.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: CloudSun,
      title: "Weather Correlation",
      description: "Discover how weather impacts your tips and identify the best days to work.",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: Lightbulb,
      title: "Predictive Planning",
      description: "AI-powered predictions help you plan your schedule for maximum earnings.",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: TrendingUp,
      title: "Performance Insights",
      description: "Get actionable insights to maximize your tip income with detailed performance breakdowns.",
      color: "from-cyan-500 to-blue-600"
    }
  ];

  const benefits = [
    { icon: DollarSign, text: "Track every dollar you earn" },
    { icon: Clock, text: "Save hours on manual tracking" },
    { icon: Shield, text: "Your data stays private & secure" },
    { icon: Zap, text: "Instant insights at your fingertips" }
  ];

  const testimonials = [
    {
      quote: "TipTracker helped me increase my tips by 30% just by understanding my best-performing days.",
      author: "Sarah M.",
      role: "Server, 3 years"
    },
    {
      quote: "Finally, an app that understands the service industry. The goal tracking keeps me motivated!",
      author: "Marcus T.",
      role: "Bartender, 5 years"
    },
    {
      quote: "The analytics blew my mind. I had no idea weather affected my tips so much!",
      author: "Jessica L.",
      role: "Waitress, 2 years"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={appIcon} alt="TipTracker" className="w-10 h-10 rounded-xl shadow-md" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                TipTracker
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">How It Works</a>
              <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Reviews</a>
            </div>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
              Download Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <img 
                src={appIcon} 
                alt="TipTracker App Icon" 
                className="w-28 h-28 rounded-3xl shadow-2xl shadow-emerald-500/30 ring-4 ring-white"
              />
            </div>
            
            <Badge className="mb-6 bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-1.5">
              <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
              #1 Tip Tracking App for Service Workers
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Track Your Tips.{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                Maximize Your Income.
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              The smartest way for servers, bartenders, and service workers to track earnings, 
              set goals, and discover insights that boost your tip income.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/30 text-lg px-8 py-6 h-auto">
                <Download className="mr-2 h-5 w-5" />
                Download for iOS
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-lg px-8 py-6 h-auto">
                Download for Android
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Quick Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-center gap-2 text-slate-600">
                  <benefit.icon className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-200/60 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "$2M+", label: "Tips Tracked" },
              { number: "10K+", label: "Active Users" },
              { number: "25%", label: "Avg. Income Boost" },
              { number: "4.9★", label: "App Store Rating" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-slate-100 text-slate-700 border-slate-200">Powerful Features</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Tools designed specifically for service industry workers to track, analyze, and maximize earnings.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200/60 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">Simple Process</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Start earning more in 3 steps
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Log Your Shifts", description: "Quickly record your tips, hours, and sales after each shift. Takes less than 30 seconds." },
              { step: "2", title: "Track Progress", description: "Watch your earnings grow on the calendar. Set goals and see your progress in real-time." },
              { step: "3", title: "Optimize & Earn", description: "Use insights to pick your best shifts, understand patterns, and maximize your income." }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-slate-100 text-slate-700 border-slate-200">Testimonials</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Loved by service workers
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Checklist */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">Complete Solution</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Built for the service industry
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Whether you're a server, bartender, delivery driver, or any tipped worker, 
                TipTracker has everything you need.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Track tips, wages, and total earnings",
                  "Set and monitor financial goals",
                  "Visualize trends with beautiful charts",
                  "Weather correlation insights",
                  "Shift performance analysis",
                  "Budget planning tools",
                  "Achievement badges & gamification",
                  "Cloud backup & sync"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-12 lg:mt-0 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-3xl opacity-20"></div>
                <img 
                  src={appIcon} 
                  alt="TipTracker App" 
                  className="relative w-64 h-64 rounded-3xl shadow-2xl ring-4 ring-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-12 lg:p-16 shadow-2xl shadow-emerald-500/30">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to maximize your tips?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join thousands of service workers who've boosted their earnings with TipTracker. 
              Download free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl text-lg px-8 py-6 h-auto font-semibold">
                <Download className="mr-2 h-5 w-5" />
                Download for iOS
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto">
                Download for Android
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <img src={appIcon} alt="TipTracker" className="w-8 h-8 rounded-lg shadow-sm" />
              <span className="font-semibold text-slate-900">TipTracker</span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} TipTracker. All rights reserved.
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <button
                onClick={() => setPrivacyOpen(true)}
                className="text-slate-500 hover:text-slate-700 underline underline-offset-4"
                aria-label="Open Privacy Policy"
              >
                Privacy Policy
              </button>
              <a href="#" className="text-slate-500 hover:text-slate-700 underline underline-offset-4">
                Terms of Service
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-700 underline underline-offset-4">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <PrivacyPolicy isOpen={isPrivacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
};

export default Landing;
