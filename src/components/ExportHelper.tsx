
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, FileCode } from 'lucide-react';
import { toast } from 'sonner';

const ExportHelper = () => {
  const [exportType, setExportType] = useState<'react' | 'html'>('react');

  const reactCode = `// TipTracker Landing Page - Framer Ready
import React from 'react';

const TipTrackerLanding = () => {
  const features = [
    {
      icon: "📅",
      title: "Earnings Calendar",
      description: "Track your daily tips with an intuitive calendar view. See your earnings patterns at a glance and never miss logging your daily income.",
      highlight: "Visual tip tracking"
    },
    {
      icon: "🎯",
      title: "Goal Setting", 
      description: "Set and track daily, weekly, monthly, or yearly earning goals. Stay motivated with progress indicators and achievement tracking.",
      highlight: "Smart goal tracking"
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Comprehensive insights into your earning patterns with beautiful charts, trends analysis, and performance metrics.",
      highlight: "Data-driven insights"
    },
    {
      icon: "☀️",
      title: "Weather Correlation",
      description: "Discover how weather affects your tips. Our smart tracking helps you identify the best days to work for maximum earnings.",
      highlight: "Weather intelligence"
    },
    {
      icon: "💡",
      title: "Predictive Planning",
      description: "AI-powered predictions help you plan your schedule for optimal earnings based on historical data and trends.",
      highlight: "Smart predictions"
    },
    {
      icon: "📈",
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      {/* Navigation */}
      <nav style={{ 
        borderBottom: '1px solid #e2e8f0', 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                📱
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>TipTracker</span>
            </div>
            <button style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '5rem 1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{
              background: '#f1f5f9',
              color: '#6366f1',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              ⭐ #1 Tip Tracking App
            </span>
          </div>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            lineHeight: '1.1'
          }}>
            Maximize Your{' '}
            <span style={{ 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Tip Income
            </span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#64748b', 
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            The smart way to track, analyze, and optimize your tip earnings. 
            Join thousands of service workers who've increased their income by 25% on average.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '500',
              fontSize: '1.125rem',
              cursor: 'pointer'
            }}>
              Download App 📥
            </button>
            <button style={{
              background: 'transparent',
              color: '#6366f1',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: '2px solid #6366f1',
              fontWeight: '500',
              fontSize: '1.125rem',
              cursor: 'pointer'
            }}>
              View Demo →
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '2rem 1rem', background: 'rgba(255, 255, 255, 0.5)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '2rem',
            textAlign: 'center'
          }}>
            {stats.map((stat, index) => (
              <div key={index}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>{stat.number}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{
              background: '#f1f5f9',
              color: '#6366f1',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Features
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0' }}>
              Everything you need to succeed
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Comprehensive tools designed specifically for service workers to track, 
              analyze, and maximize their tip earnings.
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{feature.icon}</span>
                  <span style={{
                    background: '#f1f5f9',
                    color: '#6366f1',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {feature.highlight}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 1rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Ready to maximize your tips?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
            Join thousands of service workers who've transformed their earning potential with TipTracker.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              background: 'white',
              color: '#6366f1',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '500',
              fontSize: '1.125rem',
              cursor: 'pointer'
            }}>
              Download for iOS 📱
            </button>
            <button style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontWeight: '500',
              fontSize: '1.125rem',
              cursor: 'pointer'
            }}>
              Download for Android 🤖
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📱</span>
            <span style={{ fontWeight: '600' }}>TipTracker</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            © 2024 TipTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TipTrackerLanding;`;

  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TipTracker - Maximize Your Tip Income</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1a202c;
        }
        
        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        .gradient-bg {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            min-height: 100vh;
        }
        
        .gradient-text {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            border: none;
            font-weight: 500;
            font-size: 1.125rem;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
        }
        
        .btn-outline {
            background: transparent;
            color: #6366f1;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            border: 2px solid #6366f1;
            font-weight: 500;
            font-size: 1.125rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .btn-outline:hover {
            background: #6366f1;
            color: white;
        }
        
        .card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        
        .badge {
            background: #f1f5f9;
            color: #6366f1;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
            display: inline-block;
        }
        
        .grid {
            display: grid;
            gap: 2rem;
        }
        
        .grid-3 {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        
        .grid-4 {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }
        
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem !important;
            }
            
            .btn-group {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="gradient-bg">
        <!-- Navigation -->
        <nav style="border-bottom: 1px solid #e2e8f0; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 50;">
            <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: center; height: 64px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                            📱
                        </div>
                        <span style="font-size: 1.25rem; font-weight: 600;">TipTracker</span>
                    </div>
                    <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 1rem;">Get Started</button>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero" style="padding: 5rem 1rem; text-align: center;">
            <div class="container">
                <div style="margin-bottom: 1.5rem;">
                    <span class="badge">⭐ #1 Tip Tracking App</span>
                </div>
                <h1 style="font-size: 3.5rem; font-weight: bold; margin-bottom: 1.5rem; line-height: 1.1;">
                    Maximize Your <span class="gradient-text">Tip Income</span>
                </h1>
                <p style="font-size: 1.25rem; color: #64748b; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                    The smart way to track, analyze, and optimize your tip earnings. 
                    Join thousands of service workers who've increased their income by 25% on average.
                </p>
                <div class="btn-group" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn-primary">Download App 📥</button>
                    <button class="btn-outline">View Demo →</button>
                </div>
            </div>
        </section>

        <!-- Stats -->
        <section style="padding: 2rem 1rem; background: rgba(255, 255, 255, 0.5);">
            <div class="container">
                <div class="grid grid-4" style="text-align: center;">
                    <div>
                        <div style="font-size: 2rem; font-weight: bold; color: #6366f1;">10K+</div>
                        <div style="font-size: 0.875rem; color: #64748b;">Tips Tracked</div>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: bold; color: #6366f1;">500+</div>
                        <div style="font-size: 0.875rem; color: #64748b;">Active Users</div>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: bold; color: #6366f1;">25%</div>
                        <div style="font-size: 0.875rem; color: #64748b;">Average Increase</div>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: bold; color: #6366f1;">4.9</div>
                        <div style="font-size: 0.875rem; color: #64748b;">User Rating</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features -->
        <section style="padding: 5rem 1rem;">
            <div class="container">
                <div style="text-align: center; margin-bottom: 4rem;">
                    <span class="badge">Features</span>
                    <h2 style="font-size: 2.5rem; font-weight: bold; margin: 1rem 0;">Everything you need to succeed</h2>
                    <p style="font-size: 1.25rem; color: #64748b; max-width: 600px; margin: 0 auto;">
                        Comprehensive tools designed specifically for service workers to track, 
                        analyze, and maximize their tip earnings.
                    </p>
                </div>
                
                <div class="grid grid-3">
                    <div class="card">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                            <span style="font-size: 2rem;">📅</span>
                            <span class="badge" style="font-size: 0.75rem;">Visual tip tracking</span>
                        </div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Earnings Calendar</h3>
                        <p style="color: #64748b; line-height: 1.6;">Track your daily tips with an intuitive calendar view. See your earnings patterns at a glance and never miss logging your daily income.</p>
                    </div>
                    
                    <div class="card">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                            <span style="font-size: 2rem;">🎯</span>
                            <span class="badge" style="font-size: 0.75rem;">Smart goal tracking</span>
                        </div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Goal Setting</h3>
                        <p style="color: #64748b; line-height: 1.6;">Set and track daily, weekly, monthly, or yearly earning goals. Stay motivated with progress indicators and achievement tracking.</p>
                    </div>
                    
                    <div class="card">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                            <span style="font-size: 2rem;">📊</span>
                            <span class="badge" style="font-size: 0.75rem;">Data-driven insights</span>
                        </div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Analytics Dashboard</h3>
                        <p style="color: #64748b; line-height: 1.6;">Comprehensive insights into your earning patterns with beautiful charts, trends analysis, and performance metrics.</p>
                    </div>
                    
                    <div class="card">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                            <span style="font-size: 2rem;">☀️</span>
                            <span class="badge" style="font-size: 0.75rem;">Weather intelligence</span>
                        </div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Weather Correlation</h3>
                        <p style="color: #64748b; line-height: 1.6;">Discover how weather affects your tips. Our smart tracking helps you identify the best days to work for maximum earnings.</p>
                    </div>
                    
                    <div class="card">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                            <span style="font-size: 2rem;">💡</span>
                            <span class="badge" style="font-size: 0.75rem;">Smart predictions</span>
                        </div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Predictive Planning</h3>
                        <p style="color: #64748b; line-height: 1.6;">AI-powered predictions help you plan your schedule for optimal earnings based on historical data and trends.</p>
                    </div>
                    
                    <div class="card">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                            <span style="font-size: 2rem;">📈</span>
                            <span class="badge" style="font-size: 0.75rem;">Performance optimization</span>
                        </div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Performance Insights</h3>
                        <p style="color: #64748b; line-height: 1.6;">Get detailed breakdowns of your earning performance with actionable insights to maximize your tip income.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section style="padding: 5rem 1rem; background: linear-gradient(135deg, #6366f1, #8b5cf6);">
            <div style="max-width: 800px; margin: 0 auto; text-align: center; color: white;">
                <h2 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">Ready to maximize your tips?</h2>
                <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">
                    Join thousands of service workers who've transformed their earning potential with TipTracker.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button style="background: white; color: #6366f1; padding: 0.75rem 2rem; border-radius: 8px; border: none; font-weight: 500; font-size: 1.125rem; cursor: pointer;">
                        Download for iOS 📱
                    </button>
                    <button style="background: rgba(255, 255, 255, 0.2); color: white; padding: 0.75rem 2rem; border-radius: 8px; border: 2px solid rgba(255, 255, 255, 0.3); font-weight: 500; font-size: 1.125rem; cursor: pointer;">
                        Download for Android 🤖
                    </button>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer style="padding: 3rem 1rem; background: #f8fafc; border-top: 1px solid #e2e8f0;">
            <div style="max-width: 1280px; margin: 0 auto; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <span style="font-size: 1.5rem;">📱</span>
                    <span style="font-weight: 600;">TipTracker</span>
                </div>
                <p style="color: #64748b; font-size: 0.875rem;">© 2024 TipTracker. All rights reserved.</p>
            </div>
        </footer>
    </div>
</body>
</html>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied to clipboard!');
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}!`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Export Landing Page for Framer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant={exportType === 'react' ? 'default' : 'outline'} 
              onClick={() => setExportType('react')}
            >
              React Component
            </Button>
            <Button 
              variant={exportType === 'html' ? 'default' : 'outline'} 
              onClick={() => setExportType('html')}
            >
              HTML + CSS
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {exportType === 'react' ? 'React JSX' : 'HTML'}
              </Badge>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => copyToClipboard(exportType === 'react' ? reactCode : htmlCode)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => downloadFile(
                    exportType === 'react' ? reactCode : htmlCode, 
                    exportType === 'react' ? 'TipTrackerLanding.jsx' : 'tiptracker-landing.html'
                  )}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            
            <Textarea 
              value={exportType === 'react' ? reactCode : htmlCode}
              readOnly
              className="h-96 font-mono text-sm"
              placeholder="Export code will appear here..."
            />
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Instructions for Framer:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Copy the {exportType === 'react' ? 'React component' : 'HTML'} code above</li>
              <li>Open Framer and create a new project</li>
              {exportType === 'react' ? (
                <>
                  <li>Create a new code component and paste the React code</li>
                  <li>The component is self-contained with inline styles for Framer compatibility</li>
                </>
              ) : (
                <>
                  <li>Use the "Insert" menu to add an HTML embed</li>
                  <li>Paste the HTML code into the embed component</li>
                </>
              )}
              <li>Customize colors, text, and styling as needed</li>
              <li>Preview and publish your landing page</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportHelper;
