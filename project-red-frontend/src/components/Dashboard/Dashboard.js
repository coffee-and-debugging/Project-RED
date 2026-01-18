import { useState, useEffect } from "react";
import { notificationService } from "../../services/notifications";
import { newsService, statsService } from "../../services/news";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Skeleton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  alpha,
  useMediaQuery,
  Stack,
  Badge,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  HealthAndSafety as HealthIcon,
  LocalHospital as HospitalIcon,
  Favorite as FavoriteIcon,
  VolunteerActivism as DonateIcon,
  Person as PersonIcon,
  Science as ScienceIcon,
  Close as CloseIcon,
  Campaign as CampaignIcon,
  Newspaper as NewsIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  EmojiEvents as SuccessIcon,
  Announcement as AnnouncementIcon,
  Bloodtype as BloodtypeIcon,
  WaterDrop as WaterDropIcon,
  KeyboardArrowRight as ArrowRightIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Notifications from "../Common/Notifications";
import DonationHistory from "../Donor/DonationHistory";
import api from "../../services/api";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
}

const categoryIcons = {
  announcement: <AnnouncementIcon fontSize="small" />,
  health_tip: <LightbulbIcon fontSize="small" />,
  success_story: <SuccessIcon fontSize="small" />,
  event: <EventIcon fontSize="small" />,
  urgent: <WarningIcon fontSize="small" />,
  campaign: <CampaignIcon fontSize="small" />,
};

const categoryColors = {
  announcement: "#1976D2",
  health_tip: "#2E7D32",
  success_story: "#7B1FA2",
  event: "#F57C00",
  urgent: "#D32F2F",
  campaign: "#00838F",
};

// Keep news card text lengths consistent without altering card height
const truncateText = (text, max) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

const formatCategory = (category) => {
  if (!category) return "";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tabValue, setTabValue] = useState(0);
  const [healthPredictions, setHealthPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchHealthPredictions();
    fetchNotifications();
    fetchNews();
    fetchStats();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchHealthPredictions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/donations/?expand=blood_test");
      const donations = response.data.results || response.data;

      const predictions = donations
        .filter(
          (donation) =>
            donation.blood_test && donation.blood_test.health_risk_prediction
        )
        .map((donation) => ({
          id: donation.blood_test.id,
          donationId: donation.id,
          donationDate: donation.donation_date || donation.created_at,
          hospital: donation.hospital_name,
          prediction: donation.blood_test.health_risk_prediction,
          summary: donation.blood_test.disease_prediction,
          confidence: donation.blood_test.prediction_confidence,
          bloodTestData: donation.blood_test,
          lifeSaved: donation.blood_test.life_saved,
        }));

      setHealthPredictions(predictions);
    } catch (error) {
      console.error("Error fetching health predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      const data = response?.data || response;
      const notificationsList = Array.isArray(data) ? data : (data?.results || []);
      setNotifications(notificationsList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const newsData = await newsService.getNews({ limit: 6 });
      setNews(newsData.results || newsData);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await statsService.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const viewPredictionDetails = (prediction) => {
    setSelectedPrediction(prediction);
    setPredictionDialogOpen(true);
  };

  const quickActions = [
    {
      title: "Request Blood",
      description: "Need blood urgently",
      icon: <FavoriteIcon />,
      path: "/request-blood",
      color: theme.palette.error.main,
      gradient: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
    },
    {
      title: "Donate Blood",
      description: "Save a life today",
      icon: <DonateIcon />,
      path: "/donate-blood",
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    },
    {
      title: "Find Hospitals",
      description: "Nearby centers",
      icon: <HospitalIcon />,
      path: "/hospitals",
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
    },
    {
      title: "My Profile",
      description: "View & update",
      icon: <PersonIcon />,
      path: "/profile",
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
    },
  ];

  const statCards = [
    {
      label: "Total Donations",
      value: stats?.total_donations || 0,
      icon: <DonateIcon />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.08),
    },
    {
      label: "Lives Saved",
      value: stats?.lives_saved || 0,
      icon: <FavoriteIcon />,
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.08),
    },
    {
      label: "Active Donors",
      value: stats?.active_donors || 0,
      icon: <GroupIcon />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.08),
    },
    {
      label: "Pending Requests",
      value: stats?.pending_requests || 0,
      icon: <TrendingUpIcon />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.08),
    },
  ];

  const unreadNotifications = Array.isArray(notifications)
    ? notifications.filter(n => !n.is_read).length
    : 0;

  return (
    <Box
      className="fade-in"
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#f5f7fa',
        pb: { xs: 8, md: 4 },
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.error.main} 100%)`,
          color: "white",
          pt: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 4, sm: 5, md: 6 },
          px: { xs: 2, sm: 3 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {isMobile ? (
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  border: "3px solid rgba(255,255,255,0.3)",
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}
              >
                {currentUser?.blood_group || "?"}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Welcome, {currentUser?.first_name || "User"}!
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Your blood type: <strong>{currentUser?.blood_group || "Not set"}</strong>
                </Typography>
              </Box>
              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {healthPredictions.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Donations
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {healthPredictions.filter((p) => p.lifeSaved).length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Lives Saved
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1}>
                {currentUser?.is_donor && (
                  <Chip
                    icon={<WaterDropIcon sx={{ color: "white !important" }} />}
                    label="Donor"
                    size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                  />
                )}
                {currentUser?.is_recipient && (
                  <Chip
                    icon={<FavoriteIcon sx={{ color: "white !important" }} />}
                    label="Recipient"
                    size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                  />
                )}
              </Stack>
            </Stack>
          ) : (
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={5}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Welcome back, {currentUser?.first_name || "User"}!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 2, maxWidth: 400 }}>
                  Track your donations, view health insights, and help save lives.
                </Typography>
                <Stack direction="row" spacing={1}>
                  {currentUser?.is_donor && (
                    <Chip
                      icon={<WaterDropIcon sx={{ color: "white !important" }} />}
                      label="Verified Donor"
                      sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                    />
                  )}
                  {currentUser?.is_recipient && (
                    <Chip
                      icon={<FavoriteIcon sx={{ color: "white !important" }} />}
                      label="Recipient"
                      sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                    />
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: "flex", justifyContent: "center" }}>
                <Card
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "white",
                    minWidth: 160,
                  }}
                >
                  <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 }, textAlign: "center" }}>
                    <BloodtypeIcon sx={{ fontSize: 28, mb: 1, opacity: 0.8 }} />
                    <Typography variant="caption" sx={{ opacity: 0.8, display: "block" }}>
                      Blood Type
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: 1 }}>
                      {currentUser?.blood_group || "N/A"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)" }}>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {healthPredictions.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Total Donations
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)" }}>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {healthPredictions.filter((p) => p.lifeSaved).length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Lives Saved
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: { xs: -3, sm: -4 }, position: "relative", zIndex: 2 }}>
        {/* Quick Actions - Centered */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box sx={{ width: "100%", maxWidth: { xs: "100%", md: "70%" } }}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }} justifyContent="center">
              {quickActions.map((action) => (
                <Grid item xs={6} sm={3} key={action.title}>
                  <Card
                    onClick={() => navigate(action.path)}
                    sx={{
                      cursor: "pointer",
                      height: "100%",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      background: "white",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 12px 28px ${alpha(action.color, 0.25)}`,
                        "& .action-icon": { transform: "scale(1.1)" },
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: action.gradient,
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: "center" }}>
                      <Avatar
                        className="action-icon"
                        sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          bgcolor: alpha(action.color, 0.1),
                          color: action.color,
                          mx: "auto",
                          mb: 1,
                          transition: "transform 0.3s ease",
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        {action.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Platform Stats - Full Width */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 3,
            borderRadius: 3,
            background: "white",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <Typography variant="overline" sx={{ mb: 2, display: "block", fontWeight: 600, color: "text.secondary", letterSpacing: 1.5 }}>
            Platform Statistics
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {statsLoading
              ? [1, 2, 3, 4].map((i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Skeleton variant="rounded" height={isMobile ? 60 : 80} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))
              : statCards.map((stat) => (
                  <Grid item xs={6} sm={3} key={stat.label}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: "center",
                        gap: { xs: 0.5, sm: 1.5 },
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: stat.bgColor,
                        textAlign: { xs: "center", sm: "left" },
                        transition: "transform 0.2s ease",
                        "&:hover": { transform: "scale(1.02)" },
                      }}
                    >
                      <Avatar sx={{ width: { xs: 32, sm: 44 }, height: { xs: 32, sm: 44 }, bgcolor: alpha(stat.color, 0.15), color: stat.color }}>
                        {stat.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: { xs: "1.25rem", sm: "1.5rem" }, color: stat.color }}>
                          {stat.value.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: { xs: "0.65rem", sm: "0.75rem" }, whiteSpace: "nowrap" }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
          </Grid>
        </Paper>

        {/* Notifications, History, Health - Full Width */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background: "white",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            mb: 3,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              "& .MuiTab-root": { py: { xs: 1.5, sm: 2 }, minHeight: { xs: 48, sm: 56 }, textTransform: "none", fontWeight: 500 },
              "& .Mui-selected": { fontWeight: 600 },
            }}
          >
            <Tab
              icon={<Badge badgeContent={unreadNotifications} color="error" max={99}><NotificationsIcon fontSize="small" /></Badge>}
              iconPosition="start"
              label={!isMobile && "Notifications"}
              sx={{ gap: 0.5 }}
            />
            <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label={!isMobile && "History"} sx={{ gap: 0.5 }} />
            <Tab icon={<HealthIcon fontSize="small" />} iconPosition="start" label={!isMobile && "Health"} sx={{ gap: 0.5 }} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Notifications notifications={notifications} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <DonationHistory />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {loading ? (
              <Stack spacing={2}>
                {[1, 2].map((i) => (
                  <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            ) : healthPredictions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: { xs: 4, sm: 6 } }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mx: "auto", mb: 2 }}>
                  <ScienceIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Health Predictions Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: "auto" }}>
                  Health insights will appear here after your blood tests are analyzed.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {healthPredictions.slice(0, 3).map((prediction) => (
                  <Card
                    key={prediction.id}
                    onClick={() => viewPredictionDetails(prediction)}
                    sx={{
                      cursor: "pointer",
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": { borderColor: theme.palette.primary.main, boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}` },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                          <ScienceIcon fontSize="small" />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>Blood Test Analysis</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(prediction.donationDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {prediction.lifeSaved && (
                          <Chip icon={<FavoriteIcon sx={{ fontSize: 14 }} />} label="Life Saved" size="small" color="success" sx={{ height: 24, fontSize: "0.7rem" }} />
                        )}
                      </Stack>
                      {prediction.summary && (
                        <Typography variant="body2" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {prediction.summary}
                        </Typography>
                      )}
                      {prediction.confidence && (
                        <Box sx={{ mt: 1.5 }}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Confidence</Typography>
                            <Typography variant="caption" fontWeight={600} color="primary">{prediction.confidence}%</Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={prediction.confidence} sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </TabPanel>
        </Paper>

        {/* News & Updates - Full Width */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background: "white",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            mb: 3,
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: "flex", alignItems: "center", gap: 1, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <NewsIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>News & Updates</Typography>
          </Box>

          {newsLoading ? (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : news.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <NewsIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">No news available</Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {news.slice(0, 4).map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item.id}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        height: "100%",
                        transition: "all 0.2s ease",
                        "&:hover": { borderColor: categoryColors[item.category] || theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.02) },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(categoryColors[item.category] || theme.palette.primary.main, 0.1), color: categoryColors[item.category] || theme.palette.primary.main }}>
                          {categoryIcons[item.category] || <NewsIcon fontSize="small" />}
                        </Avatar>
                        {item.is_featured && <Chip label="Featured" size="small" sx={{ height: 18, fontSize: "0.6rem", bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.dark }} />}
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4, mb: 0.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.summary}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Donor Distribution - Full Width */}
        {stats?.blood_group_stats && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 3,
              background: "white",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <BloodtypeIcon color="error" />
              <Typography variant="subtitle1" fontWeight={600}>Donor Distribution by Blood Type</Typography>
            </Stack>
            <Grid container spacing={2}>
              {Object.entries(stats.blood_group_stats).map(([group, count]) => (
                <Grid item xs={3} sm={1.5} key={group}>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.error.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                      transition: "all 0.2s ease",
                      "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.1), transform: "scale(1.05)" },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.error.main }}>{group}</Typography>
                    <Typography variant="body2" color="text.secondary">{count}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Container>

      {/* Health Prediction Dialog */}
      <Dialog
        open={predictionDialogOpen}
        onClose={() => setPredictionDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : 3, m: isMobile ? 0 : 2 } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.palette.divider}`, p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: { xs: 36, sm: 44 }, height: { xs: 36, sm: 44 } }}>
              <ScienceIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>Blood Test Analysis</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedPrediction && new Date(selectedPrediction.donationDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setPredictionDialogOpen(false)} size={isMobile ? "small" : "medium"}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {selectedPrediction && (
            <Box>
              <Typography variant="overline" sx={{ mb: 2, display: "block", color: "text.secondary", fontWeight: 600 }}>
                Blood Test Results
              </Typography>
              <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                {[
                  { label: "Sugar", value: selectedPrediction.bloodTestData.sugar_level, unit: "mg/dL" },
                  { label: "Hemoglobin", value: selectedPrediction.bloodTestData.hemoglobin, unit: "g/dL" },
                  { label: "Uric Acid", value: selectedPrediction.bloodTestData.uric_acid_level, unit: "mg/dL" },
                  { label: "WBC", value: selectedPrediction.bloodTestData.wbc_count, unit: "/mcL" },
                  { label: "RBC", value: selectedPrediction.bloodTestData.rbc_count, unit: "M/mcL" },
                  { label: "Platelets", value: selectedPrediction.bloodTestData.platelet_count, unit: "/mcL" },
                ].map((item) => (
                  <Grid item xs={4} key={item.label}>
                    <Box sx={{ p: { xs: 1, sm: 1.5 }, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), textAlign: "center", border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.6rem", sm: "0.75rem" } }}>{item.label}</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        {item.value || "-"} <Typography component="span" variant="caption" sx={{ fontSize: { xs: "0.5rem", sm: "0.65rem" } }}>{item.unit}</Typography>
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {selectedPrediction.lifeSaved && (
                <Box sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), display: "flex", alignItems: "center", gap: 1.5, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                  <FavoriteIcon sx={{ color: theme.palette.success.main }} />
                  <Typography variant="body2" color="success.dark" fontWeight={500}>This donation saved a life!</Typography>
                </Box>
              )}

              <Typography variant="overline" sx={{ mb: 1.5, display: "block", color: "text.secondary", fontWeight: 600 }}>
                AI Health Analysis
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                  {selectedPrediction.prediction}
                </Typography>
              </Paper>

              {selectedPrediction.confidence && (
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Confidence Level</Typography>
                    <Typography variant="caption" fontWeight={600} color="primary">{selectedPrediction.confidence}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={selectedPrediction.confidence} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button variant="contained" onClick={() => setPredictionDialogOpen(false)} fullWidth={isMobile} sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
