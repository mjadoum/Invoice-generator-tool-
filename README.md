# Invoice Generator - Web App

A browser-based invoice generator that creates professional PDF invoices with live preview.

![Invoice Generator Screenshot](screenshot.png)

## Features

- ✅ **Live Preview** - See your invoice update in real-time as you type
- ✅ **PDF Download** - Generate and download professional PDF invoices
- ✅ **Multiple Line Items** - Add unlimited items with descriptions, rates, quantities
- ✅ **Bullet Points** - Each line in description becomes a bullet point
- ✅ **Auto Calculations** - Totals calculated automatically
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **No Server Required** - Runs entirely in the browser

## Quick Start

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Fill in the invoice details
4. Click "Generate & Download PDF"

That's it! No installation or server required.

## Files

```
invoice-generator/
├── index.html              # Main HTML file
├── invoice-generator.js    # JavaScript logic
└── README.md               # This file
```

## Usage

### 1. Invoice Details
- **Invoice Number** - Auto-generated, but you can change it
- **Invoice Date** - Defaults to today
- **Due Terms** - Select payment terms
- **Currency** - Choose £, $, or €

### 2. Client Details
- Enter the client/company name
- Add contact details (phone, email)
- Add address information

### 3. Line Items
- Click "Add Line Item" to add work items
- Enter description (each line becomes a bullet point)
- Set hourly rate and quantity
- Amount is calculated automatically

### 4. Generate PDF
- Click the green "Generate & Download PDF" button
- PDF will be downloaded with filename: `Invoice-[NUMBER]-[CLIENT].pdf`

## Customization

### Change Your Business Details

Edit the `CONFIG` object in `invoice-generator.js`:

```javascript
const CONFIG = {
    business: {
        name: "YOUR NAME",
        title: "Your Job Title",
        address: "Your Address",
        city: "CITY",
        postcode: "AB1 2CD",
        phone: "07000000000",
        email: "your@email.com"
    },
    bank: {
        name: "Your Name",
        sortCode: "00-00-00",
        accountNumber: "00000000"
    },
    defaults: {
        rate: 25,      // Default hourly rate
        currency: "£"  // Default currency
    }
};
```

### Customize Styling

All styles are in the `<style>` section of `index.html`. Key color variables:

- Primary gradient: `#667eea` → `#764ba2`
- Success button: `#11998e` → `#38ef7d`
- Logo color: `#1a73e8`

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Dependencies

- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation (loaded from CDN)

## Hosting

You can host this on:

- **GitHub Pages** - Free, easy setup
- **Netlify** - Free, drag and drop
- **Vercel** - Free, auto-deploy from Git
- **Any web server** - Just upload the files

### GitHub Pages Setup

1. Push to GitHub repository
2. Go to Settings → Pages
3. Select branch and save
4. Your invoice generator will be live at `https://yourusername.github.io/repo-name/`

## License

MIT License - Feel free to use and modify.

## Author

Mustafa Jadoun - Web Developer
- Email: mjadoon133@gmail.com
- Phone: 07460032396
