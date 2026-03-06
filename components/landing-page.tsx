"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  BarChart3, 
  Brain, 
  TrendingUp, 
  Users, 
  Upload,
  CheckCircle2,
  Github,
  LineChart,
  Sparkles,
  Zap,
  Menu,
  X
} from "lucide-react"
import { useState } from "react"

const features = [
  {
    icon: TrendingUp,
    title: "Revenue Forecasting",
    description: "AI-powered predictions to forecast future revenue trends with high accuracy.",
  },
  {
    icon: BarChart3,
    title: "Category Performance",
    description: "Identify top-performing product categories and optimize your inventory.",
  },
  {
    icon: Users,
    title: "Shopper Behavior Analytics",
    description: "Understand customer preferences and shopping patterns through deep insights.",
  },
  {
    icon: Brain,
    title: "Data Upload & AI Processing",
    description: "Simply upload your retail data and let our AI extract actionable insights.",
  },
]

const benefits = [
  {
    icon: CheckCircle2,
    title: "Predict Sales Trends",
    description: "Stay ahead of market changes with accurate sales predictions.",
  },
  {
    icon: CheckCircle2,
    title: "Identify Profitable Categories",
    description: "Focus on what works by discovering your best-performing products.",
  },
  {
    icon: CheckCircle2,
    title: "Understand Customer Behavior",
    description: "Gain deep insights into shopping patterns and preferences.",
  },
  {
    icon: CheckCircle2,
    title: "Improve Decision Making",
    description: "Make data-driven decisions that boost revenue and efficiency.",
  },
]

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Data",
    description: "Simply upload your retail transaction data in CSV or Excel format.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Processes Insights",
    description: "Our advanced AI analyzes patterns, trends, and anomalies in your data.",
  },
  {
    number: "03",
    icon: LineChart,
    title: "View Forecasts & Analytics",
    description: "Explore interactive dashboards with forecasts and actionable insights.",
  },
]

export function LandingPage({ onLaunchDashboard }: { onLaunchDashboard?: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLaunchDashboard = () => {
    if (onLaunchDashboard) {
      onLaunchDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Sparkles className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold">ShopIQ</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Benefits
            </a>
            <a 
              href="https://github.com/ankush850/ShopIQ-AI-Retail-Intelligence-Platform" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button size="sm" onClick={handleLaunchDashboard}>
              Launch Dashboard
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Benefits
              </a>
              <a 
                href="https://github.com/ankush850/ShopIQ-AI-Retail-Intelligence-Platform" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
                <Button size="sm" className="w-full" onClick={handleLaunchDashboard}>
                  Launch Dashboard
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] opacity-30" />
          </div>

          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 mb-6">
                <Zap className="size-4 text-primary" />
                <span className="text-sm font-medium">AI-Powered Retail Intelligence</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                Transform Your Retail Data Into{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                  Actionable Insights
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                ShopIQ leverages advanced AI to forecast revenue, analyze shopper behavior, and uncover 
                category performance — empowering you to make smarter retail decisions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="group" onClick={handleLaunchDashboard}>
                  Launch Dashboard
                  <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </div>

              {/* Dashboard Preview */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative mt-16"
              >
                <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-purple-600/5" />
                  <div className="relative aspect-video bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                    <div className="text-center p-8">
                      <BarChart3 className="size-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Interactive Dashboard Preview</p>
                      <p className="text-sm text-muted-foreground/70 mt-2">Real-time analytics and AI-powered insights</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 p-4 rounded-lg bg-card border border-border/50 shadow-lg"
                >
                  <TrendingUp className="size-6 text-green-500" />
                  <p className="text-xs font-medium mt-1">+24% Revenue</p>
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 p-4 rounded-lg bg-card border border-border/50 shadow-lg"
                >
                  <Users className="size-6 text-blue-500" />
                  <p className="text-xs font-medium mt-1">10K+ Customers</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Powerful Features for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                  Retail Excellence
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to transform raw retail data into strategic advantages
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="size-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="size-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Preview Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                See Your Data in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                  New Dimensions
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Beautiful, intuitive dashboards that make complex data simple
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Dashboard Analytics",
                  description: "Comprehensive overview of your retail performance",
                  icon: BarChart3,
                  gradient: "from-blue-500/20 to-cyan-500/20",
                },
                {
                  title: "Forecast Charts",
                  description: "AI-powered revenue predictions with confidence intervals",
                  icon: TrendingUp,
                  gradient: "from-purple-500/20 to-pink-500/20",
                },
                {
                  title: "Behavior Insights",
                  description: "Deep dive into customer shopping patterns",
                  icon: Users,
                  gradient: "from-orange-500/20 to-red-500/20",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="aspect-square rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative h-full p-8 flex flex-col">
                      <div className="size-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center mb-4">
                        <item.icon className="size-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground flex-1">{item.description}</p>
                      <div className="mt-4 h-32 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center">
                        <item.icon className="size-8 text-muted-foreground/50" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                From Data to Insights in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                  Three Simple Steps
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Get started with AI-powered retail analytics in minutes
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-purple-600/50" />
                  )}
                  <div className="relative text-center">
                    <div className="inline-flex size-24 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/30 items-center justify-center mb-6 mx-auto">
                      <step.icon className="size-10 text-primary" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-6xl font-bold text-primary/10">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Why Choose{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                  ShopIQ?
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Empower your retail business with AI-driven intelligence
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4 p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all"
                >
                  <benefit.icon className="size-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="relative rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-background to-purple-600/10 p-12 md:p-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-600/5" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] opacity-30" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[80px] opacity-30" />
                
                <div className="relative text-center">
                  <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    Ready to Transform Your{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                      Retail Business?
                    </span>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join forward-thinking retailers who are leveraging AI to stay ahead of the competition.
                    Start making data-driven decisions today.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="group" onClick={handleLaunchDashboard}>
                      Get Started Free
                      <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button size="lg" variant="outline">
                      Schedule Demo
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Sparkles className="size-5 text-white" />
                </div>
                <span className="text-xl font-bold">ShopIQ</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered retail intelligence platform for modern businesses.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com/ankush850/ShopIQ-AI-Retail-Intelligence-Platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="size-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#benefits" className="hover:text-foreground transition-colors">Benefits</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 ShopIQ. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
