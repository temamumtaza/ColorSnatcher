# InvoiceIn - Invoice Generator Application

A professional invoice generator application with authentication, company management, and invoice creation features.

## Deployment Requirements

When deploying to Vercel, make sure to set the following environment variables:

- `DATABASE_URL`: Your PostgreSQL connection string (from Neon or another provider)
- `NEXTAUTH_URL`: Your production URL (e.g., https://yourdomain.vercel.app)
- `NEXTAUTH_SECRET`: A secure random string for NextAuth session encryption

## Local Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Run the development server
pnpm dev
```

## Building for Production

```bash
# Generate Prisma client
npx prisma generate

# Build the application
pnpm build
``` 