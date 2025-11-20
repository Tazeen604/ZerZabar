# Environment Configuration Setup

## For Development Environment
Create a file named `.env.development` in the frontend folder with:
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_STORAGE_URL=http://localhost:8000/storage
```

## For Production Environment  
Create a file named `.env.production` in the frontend folder with:
```
VITE_API_BASE_URL=/api
VITE_STORAGE_URL=/storage
```

## How to Use

### Development:
1. Create `.env.development` file in frontend folder
2. Add the development environment variables above
3. Run your development server

### Production:
1. Create `.env.production` file in frontend folder  
2. Add the production environment variables above
3. Build and deploy

## What This Fixes

- **Product Images**: Will work on both development and production
- **Category Images**: Will work on both development and production  
- **Homepage Settings Images**: Will work on both development and production
- **New Product Uploads**: Will display correctly on production
- **Image Editing**: Will work for all image types

## File Structure Expected

### Development:
```
your-project/
├── frontend/
│   ├── .env.development
│   └── src/
└── ecommerce-admin/ (Laravel backend)
```

### Production:
```
public_html/
├── api/ (Laravel backend)
│   └── storage/app/public/
│       ├── products/
│       ├── categories/
│       └── homepage/
└── frontend/ (built frontend)
    └── .env.production
```

## Testing

After setup, test by:
1. Adding a new product in admin panel
2. Uploading homepage settings images
3. Uploading category images
4. Verify all images display correctly on both environments















