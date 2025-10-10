import React from "react";
import { Box, Typography, Drawer, IconButton, Divider, Chip, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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
	return (
		<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', md: 520 }, borderLeft: '1px solid #e5e5e5' } }}>
			<Box sx={{ p: 2 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
					<Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#000' }}>Sort and Filter</Typography>
					<IconButton onClick={onClose}>
						<CloseIcon />
					</IconButton>
				</Box>
				<Divider />

				{/* Sort by */}
				<Box sx={{ mt: 2 }}>
					<Typography sx={sectionTitleSx}>Sort by</Typography>
					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
						<Box onClick={() => onSortChange('created_at')} sx={{ ...optionBoxSx, borderColor: sortValue==='created_at'?'#000':'#e5e5e5' }}>Best selling</Box>
						<Box onClick={() => onSortChange('price_low')} sx={{ ...optionBoxSx, borderColor: sortValue==='price_low'?'#000':'#e5e5e5' }}>Price, low to high</Box>
						<Box onClick={() => onSortChange('price_high')} sx={{ ...optionBoxSx, borderColor: sortValue==='price_high'?'#000':'#e5e5e5' }}>Price, high to low</Box>
					</Box>
				</Box>

				<Divider sx={{ my: 2 }} />

				{/* Color */}
				<Box sx={{ mt: 1 }}>
					<Typography sx={sectionTitleSx}>Color</Typography>
					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
						{colors.map((c) => (
							<Box key={c.value} onClick={() => onToggleColor(c.value)} sx={{ ...optionBoxSx, display: 'flex', alignItems: 'center', gap: 1, borderColor: selectedColors.includes(c.value)?'#000':'#e5e5e5' }}>
								<Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c.hex || '#000' }} />
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

				{/* Collection (optional) */}
				{collections?.length ? (
					<Box sx={{ mt: 2 }}>
						<Typography sx={sectionTitleSx}>Collection</Typography>
						<Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
							{collections.map((col) => (
								<Box key={col} onClick={() => onToggleCollection(col)} sx={{ ...optionBoxSx, borderColor: selectedCollections.includes(col)?'#000':'#e5e5e5' }}>{col}</Box>
							))}
						</Box>
					</Box>
				) : null}

				<Divider sx={{ my: 2 }} />

				<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
					<Button variant="text" onClick={onClearAll} sx={{ textTransform: 'none', color: '#666', fontSize: '0.85rem' }}>Clear all</Button>
					<Button variant="contained" onClick={onApply} sx={{ textTransform: 'none', backgroundColor: '#000', color: '#fff', borderRadius: 0, px: 2, py: 1, fontSize: '0.85rem' }}>Apply</Button>
				</Box>
			</Box>
		</Drawer>
	);
}





