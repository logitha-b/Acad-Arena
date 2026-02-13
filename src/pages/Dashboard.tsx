import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Award, Medal, Calendar, Heart, Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProfile();
    fetchRegisteredEvents();
    fetchBookmarks();
    fetchNotifications();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
    if (data) setProfile(data);
  };

  const fetchRegisteredEvents = async () => {
    const { data } = await supabase
      .from("event_registrations")
      .select("*, events(*)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setRegisteredEvents(data);
  };

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("event_bookmarks")
      .select("*, events(*)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setBookmarkedEvents(data);
  };

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    fetchNotifications();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) return null;

  const stats = [
    { label: "Events Attended", value: profile?.events_attended || 0, icon: Calendar, color: "text-primary" },
    { label: "Certificates Earned", value: profile?.certificates_earned || 0, icon: Award, color: "text-accent" },
    { label: "Events Won", value: profile?.events_won || 0, icon: Trophy, color: "text-yellow-500" },
    { label: "Points", value: profile?.participation_points || 0, icon: Medal, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {(profile?.display_name || user.email)?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile?.display_name || "User"}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                {profile?.college && (
                  <Badge variant="secondary" className="mt-1">{profile.college}</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-1" /> Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-1" /> Sign Out
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="registered" className="space-y-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="registered">Registered Events</TabsTrigger>
              <TabsTrigger value="bookmarks">
                <Heart className="w-4 h-4 mr-1" /> Saved Events
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-1" /> Notifications
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {notifications.filter(n => !n.is_read).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registered">
              {registeredEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No registered events yet</h3>
                    <p className="text-muted-foreground mb-4">Explore events and register to see them here</p>
                    <Button variant="hero" onClick={() => navigate("/events")}>Explore Events</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {registeredEvents.map((reg) => (
                    <Card key={reg.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/event/${reg.event_id}`)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={(reg as any).events?.image_url || "/placeholder.svg"} alt="" className="w-16 h-16 rounded-lg object-cover" />
                          <div>
                            <h4 className="font-semibold">{(reg as any).events?.title || "Event"}</h4>
                            <p className="text-sm text-muted-foreground">{(reg as any).events?.date}</p>
                          </div>
                        </div>
                        <Badge variant={reg.status === "won" ? "default" : "secondary"}>
                          {reg.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookmarks">
              {bookmarkedEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No saved events</h3>
                    <p className="text-muted-foreground mb-4">Bookmark events you're interested in</p>
                    <Button variant="hero" onClick={() => navigate("/events")}>Explore Events</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bookmarkedEvents.map((bk) => (
                    <Card key={bk.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/event/${bk.event_id}`)}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <img src={(bk as any).events?.image_url || "/placeholder.svg"} alt="" className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-semibold">{(bk as any).events?.title || "Event"}</h4>
                          <p className="text-sm text-muted-foreground">{(bk as any).events?.date}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notifications">
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-muted-foreground">You're all caught up!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <Card key={notif.id} className={`${!notif.is_read ? "border-primary/50 bg-primary/5" : ""}`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${!notif.is_read ? "font-semibold" : ""}`}>{notif.title}</h4>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markNotificationRead(notif.id); }}>
                            Mark read
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
