import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Grid, Link as MuiLink, TextField, Button, IconButton } from "@mui/material";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  YouTube,
  LinkedIn,
  Pinterest,
  MusicNote
} from "@mui/icons-material";

const linkSx = {
	color: '#cfcfcf',
	fontSize: { xs: '0.95rem', md: '1rem' },
	fontWeight: 400,
	textDecoration: 'none',
	lineHeight: 1.9,
	letterSpacing: '0.2px',
	'&:hover': { color: '#ffffff' }
};

const headingSx = {
	fontSize: { xs: '1.05rem', md: '1.15rem' },
	fontWeight: 700,
	color: '#ffffff',
	mb: 2,
	letterSpacing: '0.2px'
};

const Footer = () => {
	const textRef = useRef(null);
	const [offset, setOffset] = useState(0);
	const [email, setEmail] = useState('');
	const [isSubscribed, setIsSubscribed] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			const y = window.scrollY || 0;
			setOffset(y * 0.15); // subtle parallax
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const handleNewsletterSubmit = (e) => {
		e.preventDefault();
		if (email.trim()) {
			// Here you would typically send the email to your backend
			console.log('Newsletter subscription:', email);
			setIsSubscribed(true);
			setEmail('');
			// Reset success message after 3 seconds
			setTimeout(() => setIsSubscribed(false), 3000);
		}
	};

	return (
		<Box component="footer" sx={{ width: '100%', backgroundColor: '#000', color: '#fff', m: 0, p: 0, flexShrink: 0 }}>
			{/* Links area */}
			<Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 3, md: 4.5 }, maxWidth: '1280px', mx: 'auto' }}>
				<Grid container columnSpacing={{ xs: 6, md: 8, lg: 12 }} rowSpacing={{ xs: 2, md: 0 }}>
					<Grid item xs={12} md={3}>
						<Typography sx={headingSx}>Information</Typography>
						<Box sx={{ display: 'grid' }}>
							<MuiLink href="/about" sx={linkSx}>About us</MuiLink>
							<MuiLink href="/contact" sx={linkSx}>Contact Us</MuiLink>
							<MuiLink href="#" sx={linkSx}>Career</MuiLink>
							
							<MuiLink href="#" sx={linkSx}>Orders and Returns</MuiLink>
						</Box>
					</Grid>
					<Grid item xs={12} md={3}>
						<Typography sx={headingSx}>Help</Typography>
						<Box sx={{ display: 'grid' }}>
							<MuiLink href="#" sx={linkSx}>Help & FAQs</MuiLink>
							<MuiLink href="#" sx={linkSx}>Returns Policy</MuiLink>
							<MuiLink href="#" sx={linkSx}>Terms & Conditions</MuiLink>
							<MuiLink href="#" sx={linkSx}>Privacy Policy</MuiLink>
							
						</Box>
					</Grid>
					<Grid item xs={12} md={3}>
						<Typography sx={headingSx}>Stay Connected</Typography>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
							<MuiLink href="#" sx={{ ...linkSx, display: 'flex', alignItems: 'center', gap: 1 }}>
								<Facebook sx={{ fontSize: '1.2rem' }} />
								Facebook
							</MuiLink>
							
							<MuiLink href="#" sx={{ ...linkSx, display: 'flex', alignItems: 'center', gap: 1 }}>
								<MusicNote sx={{ fontSize: '1.2rem' }} />
								TikTok
							</MuiLink>
							<MuiLink href="#" sx={{ ...linkSx, display: 'flex', alignItems: 'center', gap: 1 }}>
								<Instagram sx={{ fontSize: '1.2rem' }} />
								Instagram
							</MuiLink>
							<MuiLink href="#" sx={{ ...linkSx, display: 'flex', alignItems: 'center', gap: 1 }}>
								<YouTube sx={{ fontSize: '1.2rem' }} />
								YouTube
							</MuiLink>
						</Box>
					</Grid>
					<Grid item xs={12} md={3}>
						<Typography sx={headingSx}>Join Us for Newsletter</Typography>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
							<Typography sx={{ 
								color: '#cfcfcf', 
								fontSize: '0.9rem', 
								lineHeight: 1.5,
								mb: 1 
							}}>
								Subscribe to get updates on new products and exclusive offers.
							</Typography>
							
							{isSubscribed ? (
								<Typography sx={{ 
									color: '#4CAF50', 
									fontSize: '0.9rem',
									fontWeight: 500
								}}>
									✓ Thank you for subscribing!
								</Typography>
							) : (
								<Box component="form" onSubmit={handleNewsletterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1,width:"300px" }}>
									<TextField
										type="email"
										placeholder="Email address"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										sx={{
											'& .MuiOutlinedInput-root': {
												color: '#fff',
												backgroundColor: 'rgba(255, 255, 255, 0.1)',
												borderRadius: '8px',
												'& fieldset': {
													borderColor: 'rgba(255, 255, 255, 0.3)',
												},
												'&:hover fieldset': {
													borderColor: 'rgba(255, 255, 255, 0.5)',
												},
												'&.Mui-focused fieldset': {
													borderColor: '#FFD700',
												},
											},
											'& .MuiInputBase-input': {
												color: '#fff',
												'&::placeholder': {
													color: 'rgba(255, 255, 255, 0.7)',
													opacity: 1,
												},
											},
										}}
									/>
									<Button
										type="submit"
										variant="contained"
										sx={{
											backgroundColor: '#FFD700',
											color: '#000',
											fontWeight: 600,
											textTransform: 'none',
											borderRadius: '8px',
											py: 1.2,
											'&:hover': {
												backgroundColor: '#FFC107',
											},
										}}
									>
										Subscribe
									</Button>
								</Box>
							)}
						</Box>
					</Grid>
				</Grid>
			</Box>

			{/* Parallax bottom text - flush bottom */}
			<Box sx={{ position: 'relative', m: 0, p: 0 }}>
				<Box
					ref={textRef}
					sx={{
						textAlign: 'center',
						willChange: 'transform',
						transform: `translateY(${Math.max(0, offset * -0.05)}px)`,
						m: 0,
						p: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'flex-end',
						width: '100%'
					}}
				>
					<Typography
						component="div"
						sx={{
							fontFamily: 'Helvetica, Arial, sans-serif',
							textTransform: 'uppercase',
							fontWeight: 250,
							letterSpacing: { xs: '0.06em', md: '0.12em' },
							wordSpacing: 0,
							whiteSpace: 'nowrap',
							fontSize: { xs: '6vw', sm: '7vw', md: '5.6vw' },
							lineHeight: 1.02,
							color: '#ffffff',
							userSelect: 'none',
							display: 'block',
							m: 0,
							p: 0
						}}
					>
						MOVE & WORK IN HARMONY
					</Typography>
				</Box>
			</Box>
		</Box>
	);
};

export default Footer;