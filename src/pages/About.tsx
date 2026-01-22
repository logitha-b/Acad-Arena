import { Link } from "react-router-dom";
import { 
  Target, 
  Users, 
  Sparkles, 
  Award, 
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Globe,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { value: "50,000+", label: "Active Users" },
  { value: "500+", label: "Events Monthly" },
  { value: "200+", label: "Partner Colleges" },
  { value: "95%", label: "Satisfaction Rate" },
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To democratize access to educational opportunities by connecting students with the right events, workshops, and networking opportunities that can shape their careers."
  },
  {
    icon: Sparkles,
    title: "Our Vision",
    description: "To become India's largest educational event platform where every student can discover opportunities that matter and every organizer can reach their target audience."
  },
  {
    icon: Heart,
    title: "Our Values",
    description: "We believe in accessibility, trust, and community. Every event on our platform is vetted to ensure quality, and we prioritize student success above all."
  },
];


const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <GraduationCap className="w-4 h-4" />
                <span>About AllCollegeEvent</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Empowering Students to{" "}
                <span className="gradient-text">Discover Opportunities</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                We're on a mission to connect every student in India with educational events 
                that can transform their careers. From hackathons to workshops, we make 
                discovery effortless.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/events">
                  <Button variant="hero" size="lg" className="group">
                    Explore Events
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/host">
                  <Button variant="outline" size="lg">
                    Host an Event
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {values.map((value) => (
                <div key={value.title} className="bg-card rounded-2xl p-8 card-shadow">
                  <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6">
                    <value.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 md:p-12 card-shadow text-center">
              <Globe className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Join Our Growing Community
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Whether you're a student looking to learn, an organizer wanting to host, 
                or a college looking to partner—we'd love to have you on board.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth?mode=signup">
                  <Button variant="hero" size="lg">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
