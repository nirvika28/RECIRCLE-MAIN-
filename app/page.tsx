import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowRight, Recycle, Sparkles, Users } from "lucide-react"
import FeatureCard from "@/components/feature-card"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold leading-tight tracking-tighter text-green-800 sm:text-5xl md:text-6xl">
                  Close the Loop. <br className="hidden sm:inline" />
                  Open a New Future.
                </h1>
                <p className="max-w-[600px] text-lg text-gray-600 md:text-xl">
                  Join your local circular economy cluster to recycle, reduce waste, and give back to the planet —
                  together.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="#features">
                  <Button className="group bg-green-600 hover:bg-green-700">
                    Join the Movement
                    <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-[350px] md:h-[450px] md:w-[450px]">
                <Image
                  src="/images/design-mode/v0_image.jpg"
                  alt="Circular Economy Illustration"
                  fill
                  className="object-contain"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-60 w-60 rounded-full opacity-30 animate-spin-slow border-none border-background border-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-green-800 sm:text-4xl md:text-5xl">Our Features</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how ReCircle helps communities thrive through sustainable practices and circular economy
              principles.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <FeatureCard
              icon={<Recycle className="h-10 w-10 text-green-600" />}
              title="EcoSort"
              subtitle="Master Waste Segregation"
              description="Learn how to separate waste smartly and earn credits. Our intuitive system makes recycling simple and rewarding for everyone in your community."
            />
            <FeatureCard
              icon={<Sparkles className="h-10 w-10 text-green-600" />}
              title="UpCycle"
              subtitle="Transform Waste into Value"
              description="Discover creative ways to repurpose materials and reduce waste. Connect with local artisans and workshops to give new life to discarded items."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-green-600" />}
              title="Community Hub"
              subtitle="Connect with Eco-Enthusiasts"
              description="Join local initiatives and events focused on sustainability. Network with like-minded individuals and organizations to amplify your impact."
            />
            <FeatureCard
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-10 w-10 text-green-600"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              }
              title="Impact Tracker"
              subtitle="Visualize Your Contribution"
              description="Monitor your environmental impact with our intuitive dashboard. Track waste reduction, recycling rates, and community engagement metrics."
            />
          </div>

          <div className="mt-16 text-center">
            <Link href="/login">
              <Button className="bg-green-600 hover:bg-green-700 group">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-green-50 py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-green-800 sm:text-4xl md:text-5xl">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Join ReCircle in three simple steps and start making a difference in your community.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <span className="text-xl font-semibold text-green-700">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4">Join Your Local Cluster</h3>
              <p className="mt-2 text-gray-600">
                Connect with sustainability initiatives in your neighborhood and meet like-minded individuals.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <span className="text-xl font-semibold text-green-700">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4">Learn & Participate</h3>
              <p className="mt-2 text-gray-600">
                Gain knowledge about sustainable practices and actively contribute to community projects.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <span className="text-xl font-semibold text-green-700">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4">Track Your Impact</h3>
              <p className="mt-2 text-gray-600">
                Monitor your personal and community progress with our easy-to-use dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stories Section */}
      <section id="community" className="py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-green-800 sm:text-4xl md:text-5xl">
              Community Stories
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from people who are already making a difference with ReCircle.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <p className="text-gray-600 italic">
                {
                  '"ReCircle has transformed how our neighborhood approaches waste. We\'ve reduced landfill contributions by 40% in just six months!"'
                }
              </p>
              <div className="mt-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Dev Singh</p>
                  <p className="text-sm text-gray-500">Amritsar, Punjab</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <p className="text-gray-600 italic">
                {
                  '"The EcoSort feature made it easy for our apartment complex to implement effective recycling. It\'s incredibly user-friendly."'
                }
              </p>
              <div className="mt-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Arya Shah</p>
                  <p className="text-sm text-gray-500">Mumbai</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <p className="text-gray-600 italic">
                {
                  "\"I've connected with amazing people through ReCircle's community events. We're not just recycling—we're building meaningful relationships.\""
                }
              </p>
              <div className="mt-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Aisha Jain</p>
                  <p className="text-sm text-gray-500">Bengaluru</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-700 text-white py-16 px-4 md:px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Movement?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-green-50">
            Be part of the solution. Join ReCircle today and help build a sustainable future for generations to come.
          </p>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="bg-white text-green-700 hover:bg-green-50">
              Join ReCircle Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
