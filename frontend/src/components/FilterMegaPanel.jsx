import React, { useState } from "react";
import { Box, Typography, Drawer, IconButton, Divider, Chip, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

const sectionTitleSx = {
	fontSize: '0.9rem',
	fontWeight: 600,
	letterSpacing: '0.3px',
	mb: 1,
	color: '#000'
};

const optionBoxSx = {
	border: '1px solid #e5e5e5',
	borderRadius: 0,
	px: 1.5,
	py: 1,
	fontSize: '0.85rem',
	cursor: 'pointer',
	color: '#000',
	'&:hover': { backgroundColor: '#f7f7f7' }
};

export default function FilterMegaPanel({
	open,
	onClose,
	sizes = [],
	colors = [],
	collections = [],
	sortValue,
	onSortChange,
	selectedSizes = [],
	selectedColors = [],
	selectedCollections = [],
	onToggleSize,
	onToggleColor,
	onToggleCollection,
	onClearAll,
	onApply
}) {
	const [showCollections, setShowCollections] = useState(false);

	return (
		<Drawer 
			anchor="right" 
			open={open} 
			onClose={onClose} 
			sx={{
				zIndex: 1300, // Ensure it's above navbar
				'& .MuiDrawer-paper': {
					width: { xs: '75vw', sm: '60vw', md: 520 },
					maxWidth: { xs: '75vw', sm: '60vw', md: 520 },
					minWidth: { xs: '300px', sm: '400px', md: 520 },
					top: { xs: '64px', sm: '64px', md: 0 }, // Position below navbar
					height: { xs: 'calc(100vh - 64px)', sm: 'calc(100vh - 64px)', md: '100vh' }, // Account for navbar height
					borderLeft: '1px solid #e5e5e5',
				}
			}}
		>
			<Box sx={{ 
				p: { xs: 2, sm: 2, md: 3 },
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden'
			}}>
				<Box sx={{ 
					display: 'flex', 
					alignItems: 'center', 
					justifyContent: 'space-between', 
					mb: 2,
					flexShrink: 0 // Prevent shrinking
				}}>
					<Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#000' }}>
						Sort and Filter
					</Typography>
					<IconButton 
						onClick={onClose}
						sx={{
							color: '#000',
							'&:hover': {
								backgroundColor: '#f5f5f5'
							}
						}}
					>
						<CloseIcon />
					</IconButton>
				</Box>
				<Divider />

				{/* Scrollable content area */}
				<Box sx={{ 
					flex: 1, 
					overflow: 'auto', 
					pr: { xs: 1, sm: 1, md: 0 } // Add padding for scrollbar
				}}>
					{/* Sort by */}
					<Box sx={{ mt: 2 }}>
						<Typography sx={sectionTitleSx}>Sort by</Typography>
						<Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
							<Box onClick={() => onSortChange('created_at')} sx={{ ...optionBoxSx, borderColor: sortValue==='created_at'?'#000':'#e5e5e5' }}>Best selling</Box>
							<Box onClick={() => onSortChange('price_low')} sx={{ ...optionBoxSx, borderColor: sortValue==='price_low'?'#000':'#e5e5e5' }}>Price, low to high</Box>
							<Box onClick={() => onSortChange('price_high')} sx={{ ...optionBoxSx, borderColor: sortValue==='price_high'?'#000':'#e5e5e5' }}>Price, high to low</Box>
						</Box>
					</Box>

					<Divider sx={{ my: 1 }} />

					{/* Color */}
					<Box sx={{ mt: 1 }}>
						<Typography sx={sectionTitleSx}>Color</Typography>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
							{colors.map((c) => (
								<Box 
									key={c.value} 
									onClick={() => onToggleColor(c.value)} 
									sx={{ 
										...optionBoxSx, 
										display: 'flex', 
										alignItems: 'center', 
										gap: 1, 
										borderColor: selectedColors.includes(c.value)?'#000':'#e5e5e5',
										minWidth: 'auto',
										flex: '0 0 auto'
									}}
								>
									<Box sx={{ 
										width: 12, 
										height: 12, 
										borderRadius: '50%', 
										backgroundColor: c.hex || c.value || '#000',
										border: '1px solid #ddd'
									}} />
									{c.label}
								</Box>
							))}
						</Box>
					</Box>

					{/* Size */}
					<Box sx={{ mt: 2 }}>
						<Typography sx={sectionTitleSx}>SIZE</Typography>
						<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
							{sizes.map((s) => (
								<Box key={s} onClick={() => onToggleSize(s)} sx={{ ...optionBoxSx, textAlign: 'center', borderColor: selectedSizes.includes(s)?'#000':'#e5e5e5' }}>{s}</Box>
							))}
						</Box>
					</Box>

					{/* Collections (optional, with expandable plus) */}
					{collections?.length ? (
						<Box sx={{ mt: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<Typography sx={sectionTitleSx}>Collections</Typography>
								<IconButton 
									size="small" 
									onClick={() => setShowCollections(v => !v)}
									sx={{
										backgroundColor: '#FFD700',
										color: '#2C2C2C',
										'&:hover': { backgroundColor: '#FFC107' },
										borderRadius: 1,
										width: 28,
										height: 28
									}}
								>
									<AddIcon sx={{ fontSize: 18 }} />
								</IconButton>
							</Box>
							{showCollections && (
								<Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mt: 1 }}>
									{collections.map((col) => (
										<Box 
											key={col} 
											onClick={() => onToggleCollection(col)} 
											sx={{ 
												...optionBoxSx, 
												borderColor: selectedCollections.includes(col)?'#000':'#e5e5e5' 
											}}
										>
{col}
										</Box>
									))}
								</Box>
							)}
						</Box>
					) : null}
				</Box>

				{/* Fixed footer */}
				<Box sx={{ 
					flexShrink: 0, // Prevent shrinking
					pt: 2,
					borderTop: '1px solid #e5e5e5'
				}}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
						<Button 
							variant="text" 
							onClick={onClearAll} 
							sx={{ 
								textTransform: 'none', 
								color: '#666', 
								fontSize: '0.85rem',
								px: 2
							}}
						>
							Clear all
						</Button>
						<Button 
							variant="contained" 
							onClick={onApply} 
							sx={{ 
								textTransform: 'none', 
								backgroundColor: '#000', 
								color: '#fff', 
								borderRadius: 0, 
								px: 3, 
								py: 1, 
								fontSize: '0.85rem',
								minWidth: '80px'
							}}
						>
							Apply
						</Button>
					</Box>
				</Box>
			</Box>
		</Drawer>
	);
}










