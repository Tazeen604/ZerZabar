import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import PageHeaderWithSettings from "../components/PageHeaderWithSettings";
import Footer from '../components/Footer';
import {
  Style,
  TrendingUp,
  Favorite,
  LocalShipping,
  VerifiedUser,
  Star,
} from '@mui/icons-material';

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [isVisible, setIsVisible] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(true);

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all sections
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const values = [
    {
      icon: <Style sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: 'Premium Quality',
      description: 'We source only the finest materials to ensure every piece meets our high standards of excellence.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: 'Trend Setting',
      description: 'Stay ahead of the curve with our latest fashion trends and contemporary designs.',
    },
    {
      icon: <Favorite sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We go above and beyond to exceed your expectations.',
    },
    {
      icon: <LocalShipping sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping to get your favorite pieces to you as soon as possible.',
    },
    {
      icon: <VerifiedUser sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: 'Authentic Products',
      description: 'Every item is authentic and comes with our quality guarantee.',
    },
    {
      icon: <Star sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: 'Excellence',
      description: 'Committed to excellence in every aspect of our business, from design to delivery.',
    },
  ];

  return (
    <>
      <PageHeaderWithSettings 
        title="About Us" 
        breadcrumb="Home / About" 
        defaultBgImage="/images/new-arrival.jpg" 
      />
      
      {/* Section 1: Hero/Introduction */}
      <Box
        sx={{
          minHeight: { xs: 'auto', md: '70vh' },
          backgroundColor: '#000',
          color: '#fff',
          py: { xs: 6, md: 10 },
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Fade in={isVisible} timeout={1000}>
            <Box sx={{ maxWidth: '900px', mx: 'auto', textAlign: { xs: 'left', md: 'center' } }}>
              <Slide direction="down" in={isVisible} timeout={800}>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem' },
                      fontWeight: 700,
                      mb: 3,
                      lineHeight: 1.1,
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    ZER ZABAR
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 600,
                      mb: 3,
                      color: '#FFD700',
                    }}
                  >
                    Redefining Men's Fashion
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                      lineHeight: 1.8,
                      color: '#cfcfcf',
                      mb: 4,
                    }}
                  >
                    At Zer Zabar, we believe that style is not just about what you wear, but how you wear it. 
                    As a premier men's clothing brand, we are dedicated to crafting exceptional fashion pieces 
                    that blend contemporary trends with timeless elegance. Our mission is to empower men to 
                    express their unique personality through carefully curated collections that speak to quality, 
                    sophistication, and modern style.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                      lineHeight: 1.8,
                      color: '#cfcfcf',
                      mb: 4,
                    }}
                  >
                    Founded with a passion for excellence, Zer Zabar has become synonymous with premium men's 
                    fashion. We carefully select each piece in our collection, ensuring that every garment 
                    meets our uncompromising standards for quality, fit, and style. From casual wear to formal 
                    attire, our diverse range caters to the modern man who values both comfort and sophistication.
                  </Typography>
                </Box>
              </Slide>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Section 2: Mission & Values (White Background) */}
      <Box
        id="mission-section"
        ref={(el) => (sectionRefs.current['mission'] = el)}
        sx={{
          backgroundColor: '#fff',
          color: '#000',
          py: { xs: 6, md: 10 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container maxWidth="lg">
          <Fade in={visibleSections['mission'] || isVisible} timeout={1200}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Slide direction="up" in={visibleSections['mission'] || isVisible} timeout={800}>
                <Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                      fontWeight: 700,
                      mb: 2,
                      color: '#000',
                    }}
                  >
                    Our Mission & Values
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      color: '#666',
                      maxWidth: '800px',
                      mx: 'auto',
                      lineHeight: 1.8,
                    }}
                  >
                    At Zer Zabar, we are committed to delivering exceptional men's fashion that combines 
                    quality craftsmanship with contemporary style. Our mission is to empower every man to 
                    look and feel his best, while our values guide everything we do.
                  </Typography>
                </Box>
              </Slide>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Section 3: Our Story (Black Background) */}
      <Box
        id="story-section"
        ref={(el) => (sectionRefs.current['story'] = el)}
        sx={{
          backgroundColor: '#000',
          color: '#fff',
          py: { xs: 6, md: 10 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container maxWidth="lg">
          <Fade in={visibleSections['story'] || isVisible} timeout={1500}>
            <Box
              sx={{
                p: { xs: 3, md: 6 },
                textAlign: 'center',
                maxWidth: '900px',
                mx: 'auto',
              }}
            >
              <Slide direction="up" in={visibleSections['story'] || isVisible} timeout={1000}>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                      fontWeight: 700,
                      mb: 3,
                      color: '#FFD700',
                    }}
                  >
                    Our Story
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      lineHeight: 1.8,
                      color: '#cfcfcf',
                      mb: 3,
                    }}
                  >
                    Zer Zabar was born from a simple yet powerful vision: to create a men's clothing brand 
                    that truly understands the modern man's needs. We recognized that today's man wants 
                    more than just clothes – he wants pieces that reflect his personality, support his lifestyle, 
                    and make him feel confident in every situation.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      lineHeight: 1.8,
                      color: '#cfcfcf',
                    }}
                  >
                    From our carefully curated collections to our commitment to quality and customer service, 
                    every aspect of Zer Zabar is designed with you in mind. We're not just selling clothes – 
                    we're helping you build a wardrobe that tells your story. Join us on this journey as we 
                    continue to redefine what it means to be stylish, confident, and authentically you.
                  </Typography>
                </Box>
              </Slide>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Section 4: Value Cards (2 in a row, organized) */}
      <Box
        id="values-section"
        ref={(el) => (sectionRefs.current['values'] = el)}
        sx={{
          backgroundColor: '#fff',
          color: '#000',
          py: { xs: 6, md: 10 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={6} key={index}>
                <Zoom
                  in={visibleSections['values'] || isVisible}
                  timeout={600 + index * 150}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      backgroundColor: '#000',
                      color: '#fff',
                      borderRadius: '20px',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '2px solid rgba(255, 215, 0, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent)',
                        transition: 'left 0.5s ease',
                      },
                      '&:hover': {
                        transform: 'translateY(-15px) scale(1.02)',
                        boxShadow: '0 25px 50px rgba(255, 215, 0, 0.4)',
                        borderColor: '#FFD700',
                        '&::before': {
                          left: '100%',
                        },
                        '& .icon-box': {
                          transform: 'scale(1.2) rotate(5deg)',
                          color: '#FFD700',
                        },
                        '& .card-title': {
                          color: '#FFD700',
                          transform: 'scale(1.05)',
                        },
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      <Box
                        className="icon-box"
                        sx={{
                          mb: 3,
                          display: 'flex',
                          justifyContent: 'center',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          '& .MuiSvgIcon-root': {
                            filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.3))',
                          },
                        }}
                      >
                        {value.icon}
                      </Box>
                      <Typography
                        className="card-title"
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: '#fff',
                          fontSize: { xs: '1.4rem', md: '1.6rem' },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {value.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#cfcfcf',
                          lineHeight: 1.8,
                          fontSize: { xs: '0.95rem', md: '1.05rem' },
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {value.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />
    </>
  );
};

export default About;

