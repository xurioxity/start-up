# Xurioxity - 3D Printing Marketplace

A comprehensive platform for on-demand 3D printing services, connecting MSMEs with manufacturers for custom product manufacturing.

## 🚀 Features

### For Sellers
- **STL File Upload**: Upload your 3D designs and get instant quotes
- **Material Selection**: Choose from various materials (PLA, ABS, PETG, TPU)
- **Order Management**: Track orders from upload to delivery
- **Analytics Dashboard**: Monitor your business performance
- **No MOQ**: True on-demand manufacturing

### For Manufacturers
- **Production Queue**: Manage assigned orders efficiently
- **Status Updates**: Update order status in real-time
- **Quality Control**: Built-in quality check workflows
- **Order Tracking**: Monitor production progress

### For Admins
- **User Management**: Manage sellers and manufacturers
- **Order Oversight**: Monitor all platform orders
- **Analytics**: Platform-wide performance metrics
- **System Management**: Configure platform settings

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, Shadcn UI
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS with custom dark theme

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xurioxity
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Demo Accounts

The seed script creates demo accounts for testing:

- **Seller**: `seller@demo.com` / `demo123`
- **Manufacturer**: `manufacturer@demo.com` / `demo123`
- **Admin**: `admin@demo.com` / `demo123`

## 📁 Project Structure

```
xurioxity/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Seller dashboard
│   ├── manufacturer/       # Manufacturer dashboard
│   ├── admin/             # Admin panel
│   └── upload/            # STL upload page
├── components/            # Reusable components
│   └── ui/               # UI components
├── lib/                  # Utility functions
├── prisma/              # Database schema and seeds
└── public/              # Static assets
```

## 🎨 Design Features

- **Dark Theme**: Modern dark theme with smooth transitions
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth hover effects and page transitions
- **Glass Morphism**: Modern UI elements with backdrop blur
- **Gradient Accents**: Beautiful gradient text and backgrounds

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Database Management

```bash
# Reset database
npx prisma db push --force-reset

# Seed with sample data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables:
   - `DATABASE_URL` (for production database)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your production URL)

### Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 📱 User Flows

### Seller Flow
1. Sign up as a seller
2. Upload STL file
3. Select material and quantity
4. Place order
5. Track order status
6. Receive delivery

### Manufacturer Flow
1. Sign up as manufacturer
2. View assigned orders
3. Update production status
4. Complete quality checks
5. Mark as shipped

### Admin Flow
1. Access admin dashboard
2. Monitor platform metrics
3. Manage users and orders
4. Oversee operations

## 🔮 Future Enhancements

- **3D File Preview**: In-browser STL file viewer
- **Real-time Chat**: Communication between sellers and manufacturers
- **Payment Integration**: Razorpay/Cashfree integration
- **Mobile App**: React Native mobile application
- **AI Pricing**: ML-based cost estimation
- **Marketplace Integration**: Amazon/Flipkart API integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@xurioxity.com or create an issue on GitHub.

---

Built with ❤️ for the future of manufacturing



