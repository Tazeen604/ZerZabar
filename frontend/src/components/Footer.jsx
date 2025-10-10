import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Grid, Link as MuiLink } from "@mui/material";

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

	useEffect(() => {
		const onScroll = () => {
			const y = window.scrollY || 0;
			setOffset(y * 0.15); // subtle parallax
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<Box component="footer" sx={{ width: '100%', backgroundColor: '#000', color: '#fff', m: 0, p: 0 }}>
			{/* Links area */}
			<Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 3, md: 4.5 }, maxWidth: '1280px', mx: 'auto' }}>
				<Grid container columnSpacing={{ xs: 6, md: 16, lg: 24 }} rowSpacing={{ xs: 2, md: 0 }}>
					<Grid item xs={12} md={4}>
						<Typography sx={headingSx}>Information</Typography>
						<Box sx={{ display: 'grid' }}>
							<MuiLink href="#" sx={linkSx}>About us</MuiLink>
							<MuiLink href="#" sx={linkSx}>Contact Us</MuiLink>
							<MuiLink href="#" sx={linkSx}>Career</MuiLink>
							<MuiLink href="#" sx={linkSx}>My Account</MuiLink>
							<MuiLink href="#" sx={linkSx}>Orders and Returns</MuiLink>
						</Box>
					</Grid>
					<Grid item xs={12} md={4}>
						<Typography sx={headingSx}>Help</Typography>
						<Box sx={{ display: 'grid' }}>
							<MuiLink href="#" sx={linkSx}>Help & FAQs</MuiLink>
							<MuiLink href="#" sx={linkSx}>Returns Policy</MuiLink>
							<MuiLink href="#" sx={linkSx}>Terms & Conditions</MuiLink>
							<MuiLink href="#" sx={linkSx}>Privacy Policy</MuiLink>
							<MuiLink href="#" sx={linkSx}>Support Center</MuiLink>
						</Box>
					</Grid>
					<Grid item xs={12} md={4}>
						<Typography sx={headingSx}>Stay Connected</Typography>
						<Box sx={{ display: 'grid' }}>
							<MuiLink href="#" sx={linkSx}>Facebook</MuiLink>
							<MuiLink href="#" sx={linkSx}>Twitter</MuiLink>
							<MuiLink href="#" sx={linkSx}>Pinterest</MuiLink>
							<MuiLink href="#" sx={linkSx}>Instagram</MuiLink>
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
							fontSize: { xs: '7vw', sm: '7vw', md: '5.6vw' },
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