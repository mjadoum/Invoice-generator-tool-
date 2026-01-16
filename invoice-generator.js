/**
 * Invoice Generator - Web App
 * Author: Mustafa Jadoun
 * 
 * A browser-based invoice generator that creates PDF invoices
 */

// ============================================================
// CONFIGURATION - Your Business Details
// ============================================================
const CONFIG = {
    business: {
        name: "MUSTAFA JADOUN",
        title: "Web Developer",
        address: "55 Kirkton avenue",
        city: "GLASGOW",
        postcode: "G13 3SB",
        phone: "07460032396",
        email: "Mjadoon133@gmail.com"
    },
    defaults: {
        rate: 25,
        currency: "£"
    }
};

// ============================================================
// STATE
// ============================================================
let items = [];
let itemCounter = 0;
let logoDataUrl = null;

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    
    // Generate initial invoice number
    generateInvoiceNumber();
    
    // Add first item
    addItem();
    
    // Load default logo
    loadDefaultLogo();
    
    // Add event listeners for live preview
    addEventListeners();
    
    // Initial preview render
    setTimeout(updatePreview, 100);
});

function loadDefaultLogo() {
    const img = document.getElementById('logoPreviewImg');
    if (img && img.src) {
        // Create a canvas to convert the image to data URL
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const tempImg = new Image();
        tempImg.crossOrigin = 'anonymous';
        tempImg.onload = function() {
            canvas.width = tempImg.width;
            canvas.height = tempImg.height;
            ctx.drawImage(tempImg, 0, 0);
            try {
                logoDataUrl = canvas.toDataURL('image/png');
                updatePreview();
            } catch (e) {
                console.log('Could not load default logo');
            }
        };
        tempImg.src = 'logo.png';
    }
}

function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 100)).padStart(3, '0');
    document.getElementById('invoiceNumber').value = `INV${year}${month}${random}`;
}

function addEventListeners() {
    // Add listeners to all form inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });
}

// ============================================================
// LOGO HANDLING
// ============================================================
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            logoDataUrl = e.target.result;
            document.getElementById('logoPreviewImg').src = logoDataUrl;
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

// ============================================================
// ITEM MANAGEMENT
// ============================================================
function addItem() {
    itemCounter++;
    const itemId = itemCounter;
    
    const itemHtml = `
        <div class="item-card" id="item-${itemId}">
            <div class="item-header">
                <h4>Item #${itemId}</h4>
                <button type="button" class="remove-item" onclick="removeItem(${itemId})" title="Remove item">×</button>
            </div>
            <div class="form-group">
                <label>Description (each line = bullet point)</label>
                <textarea 
                    id="desc-${itemId}" 
                    placeholder="Development and implementation of custom CMS&#10;Creation of gallery templates&#10;Migration of image galleries"
                    oninput="updateItemAndPreview()"
                ></textarea>
            </div>
            <div class="item-row">
                <div class="form-group">
                    <label>Rate (${CONFIG.defaults.currency})</label>
                    <input 
                        type="number" 
                        id="rate-${itemId}" 
                        value="${CONFIG.defaults.rate}" 
                        min="0" 
                        step="0.01"
                        oninput="updateItemAndPreview()"
                    >
                </div>
                <div class="form-group">
                    <label>Hours/Qty</label>
                    <input 
                        type="number" 
                        id="qty-${itemId}" 
                        value="1" 
                        min="0" 
                        step="0.5"
                        oninput="updateItemAndPreview()"
                    >
                </div>
                <div class="form-group">
                    <label>Unit</label>
                    <select id="unit-${itemId}" onchange="updateItemAndPreview()">
                        <option value="hrs">hrs</option>
                        <option value="days">days</option>
                        <option value="items">items</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Amount</label>
                    <input 
                        type="text" 
                        id="amount-${itemId}" 
                        value="${CONFIG.defaults.currency}${CONFIG.defaults.rate.toFixed(2)}" 
                        readonly
                        style="background: #f0f0f0; font-weight: bold;"
                    >
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('itemsContainer').insertAdjacentHTML('beforeend', itemHtml);
    
    // Add item to array
    items.push({
        id: itemId,
        description: '',
        rate: CONFIG.defaults.rate,
        qty: 1,
        unit: 'hrs',
        amount: CONFIG.defaults.rate
    });
    
    updatePreview();
}

function removeItem(itemId) {
    if (items.length <= 1) {
        alert('You must have at least one item.');
        return;
    }
    
    // Remove from DOM
    const itemElement = document.getElementById(`item-${itemId}`);
    if (itemElement) {
        itemElement.remove();
    }
    
    // Remove from array
    items = items.filter(item => item.id !== itemId);
    
    updatePreview();
}

function updateItemAndPreview() {
    // Update all items from form
    items.forEach(item => {
        const descEl = document.getElementById(`desc-${item.id}`);
        const rateEl = document.getElementById(`rate-${item.id}`);
        const qtyEl = document.getElementById(`qty-${item.id}`);
        const unitEl = document.getElementById(`unit-${item.id}`);
        const amountEl = document.getElementById(`amount-${item.id}`);
        
        if (descEl && rateEl && qtyEl && unitEl && amountEl) {
            item.description = descEl.value;
            item.rate = parseFloat(rateEl.value) || 0;
            item.qty = parseFloat(qtyEl.value) || 0;
            item.unit = unitEl.value;
            item.amount = item.rate * item.qty;
            
            const currency = document.getElementById('currency').value;
            amountEl.value = `${currency}${item.amount.toFixed(2)}`;
        }
    });
    
    updatePreview();
}

// ============================================================
// CALCULATE TOTALS
// ============================================================
function calculateTotal() {
    return items.reduce((sum, item) => sum + item.amount, 0);
}

// ============================================================
// PREVIEW UPDATE
// ============================================================
function updatePreview() {
    const currency = document.getElementById('currency').value;
    const total = calculateTotal();
    
    // Update total display
    document.getElementById('totalDisplay').textContent = `${currency}${total.toFixed(2)}`;
    
    // Get form values
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV0001';
    const invoiceDate = document.getElementById('invoiceDate').value;
    const dueTerms = document.getElementById('dueTerms').value;
    const clientName = document.getElementById('clientName').value || 'Client Name';
    const clientPhone = document.getElementById('clientPhone').value;
    const clientMobile = document.getElementById('clientMobile').value;
    const clientEmail = document.getElementById('clientEmail').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const clientCity = document.getElementById('clientCity').value;
    const clientPostcode = document.getElementById('clientPostcode').value;
    
    // Bank details
    const bankName = document.getElementById('bankName').value;
    const bankSortCode = document.getElementById('bankSortCode').value;
    const bankAccountNumber = document.getElementById('bankAccountNumber').value;
    
    // Format date
    const formattedDate = invoiceDate ? formatDate(invoiceDate) : formatDate(new Date());
    
    // Build items HTML
    let itemsHtml = '';
    items.forEach(item => {
        if (item.description || item.qty > 0) {
            const descLines = item.description.split('\n').filter(line => line.trim());
            const descHtml = descLines.length > 0 
                ? descLines.map(line => `• ${line}`).join('<br>') 
                : '• No description';
            
            itemsHtml += `
                <tr>
                    <td class="desc-cell">${descHtml}</td>
                    <td>${currency}${item.rate}</td>
                    <td>${item.qty}${item.unit}</td>
                    <td>${currency}${item.amount.toFixed(2)}</td>
                </tr>
            `;
        }
    });
    
    // Logo HTML
    const logoHtml = logoDataUrl 
        ? `<img src="${logoDataUrl}" alt="Logo" style="max-width: 110px; height: auto;">` 
        : `<div style="font-size: 24px; font-weight: bold; color: #c41e3a;">&lt;/&gt; Web developer</div>`;
    
    // Build preview HTML
    const previewHtml = `
        <div class="preview-header">
            <div class="preview-logo">
                ${logoHtml}
            </div>
            <div class="preview-business">
                <h2>${CONFIG.business.name}</h2>
                <p>
                    ${CONFIG.business.title}<br>
                    ${CONFIG.business.address}<br>
                    ${CONFIG.business.city}<br>
                    ${CONFIG.business.postcode}<br>
                    ${CONFIG.business.phone}<br>
                    <span style="color: #0563C1;">${CONFIG.business.email}</span>
                </p>
            </div>
            <div class="preview-invoice-details">
                <div class="inv-title">INVOICE</div>
                <div class="inv-number">${invoiceNumber}</div>
                
                <div class="label">DATE</div>
                <div class="value">${formattedDate}</div>
                
                <div class="label">DUE</div>
                <div class="value">${dueTerms}</div>
                
                <div class="preview-balance-box">
                    <div class="balance-label">BALANCE DUE</div>
                    <div class="balance-value">GBP ${currency}${total.toFixed(2)}</div>
                </div>
            </div>
        </div>
        
        <div class="preview-client-section">
            <div class="preview-client">
                <h4>BILL TO</h4>
                <h3>${clientName}</h3>
                <p>
                    ${clientPhone ? clientPhone + '<br>' : ''}
                    ${clientMobile ? clientMobile + '<br>' : ''}
                    ${clientEmail ? '<span style="color: #0563C1;">' + clientEmail + '</span>' : ''}
                </p>
            </div>
            <div class="preview-address">
                ${clientAddress || clientCity || clientPostcode ? `
                    <h4>Address:</h4>
                    <p>
                        ${clientAddress ? clientAddress + '<br>' : ''}
                        ${clientCity ? clientCity + '<br>' : ''}
                        ${clientPostcode || ''}
                    </p>
                ` : ''}
            </div>
            <div></div>
        </div>
        
        <table class="preview-table">
            <thead>
                <tr>
                    <th>DESCRIPTION</th>
                    <th>RATE</th>
                    <th>QTY</th>
                    <th>AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <div class="preview-totals">
            <div class="preview-totals-table">
                <div class="preview-totals-row">
                    <span>SUBTOTAL</span>
                    <span>${currency}${total.toFixed(2)}</span>
                </div>
                <div class="preview-totals-row total">
                    <span>TOTAL</span>
                    <span>${currency}${total.toFixed(2)}</span>
                </div>
                <div class="preview-totals-row balance">
                    <span>BALANCE DUE</span>
                    <span>GBP ${currency}${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        <div class="preview-payment">
            <h4>PAYMENT INSTRUCTIONS:</h4>
            <p>Please transfer the payment to the following account:</p>
            <p><strong>Name:</strong> ${bankName}</p>
            <p><strong>Sort Code:</strong> ${bankSortCode}</p>
            <p><strong>Account Number:</strong> ${bankAccountNumber}</p>
        </div>
        
        <div class="preview-footer">
            Please email <span style="color: #0563C1;">${CONFIG.business.email}</span> if you have any questions regarding this invoice.
        </div>
    `;
    
    document.getElementById('invoicePreview').innerHTML = previewHtml;
}

// ============================================================
// DATE FORMATTING
// ============================================================
function formatDate(dateInput) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const d = new Date(dateInput);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ============================================================
// PDF GENERATION
// ============================================================
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const currency = document.getElementById('currency').value;
    const total = calculateTotal();
    
    // Get form values
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV0001';
    const invoiceDate = document.getElementById('invoiceDate').value;
    const dueTerms = document.getElementById('dueTerms').value;
    const clientName = document.getElementById('clientName').value || 'Client Name';
    const clientPhone = document.getElementById('clientPhone').value;
    const clientMobile = document.getElementById('clientMobile').value;
    const clientEmail = document.getElementById('clientEmail').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const clientCity = document.getElementById('clientCity').value;
    const clientPostcode = document.getElementById('clientPostcode').value;
    
    // Bank details
    const bankName = document.getElementById('bankName').value;
    const bankSortCode = document.getElementById('bankSortCode').value;
    const bankAccountNumber = document.getElementById('bankAccountNumber').value;
    
    const formattedDate = invoiceDate ? formatDate(invoiceDate) : formatDate(new Date());
    
    // Page settings
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    let y = 15;
    
    // ===== HEADER =====
    // Logo
    if (logoDataUrl) {
        try {
            doc.addImage(logoDataUrl, 'PNG', margin, y, 30, 10);
        } catch (e) {
            // Fallback text if image fails
            doc.setFontSize(12);
            doc.setTextColor(196, 30, 58);
            doc.setFont('helvetica', 'bold');
            doc.text('</> Web developer', margin, y + 7);
        }
    } else {
        doc.setFontSize(12);
        doc.setTextColor(196, 30, 58);
        doc.setFont('helvetica', 'bold');
        doc.text('</> Web developer', margin, y + 7);
    }
    
    // Business Name - positioned to the right of logo
    const businessX = margin + 45;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(CONFIG.business.name, businessX, y);
    
    // Business Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    y += 5;
    doc.text(CONFIG.business.title, businessX, y);
    y += 4;
    doc.text(CONFIG.business.address, businessX, y);
    y += 4;
    doc.text(CONFIG.business.city, businessX, y);
    y += 4;
    doc.text(CONFIG.business.postcode, businessX, y);
    y += 4;
    doc.text(CONFIG.business.phone, businessX, y);
    y += 4;
    doc.setTextColor(5, 99, 193);
    doc.text(CONFIG.business.email, businessX, y);
    
    // Invoice Details (right side)
    let rightX = pageWidth - margin;
    let rightY = 15;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', rightX, rightY, { align: 'right' });
    rightY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoiceNumber, rightX, rightY, { align: 'right' });
    
    rightY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('DATE', rightX, rightY, { align: 'right' });
    rightY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(formattedDate, rightX, rightY, { align: 'right' });
    
    rightY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('DUE', rightX, rightY, { align: 'right' });
    rightY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(dueTerms, rightX, rightY, { align: 'right' });
    
    rightY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('BALANCE DUE', rightX, rightY, { align: 'right' });
    rightY += 4;
    doc.text(`GBP ${currency}${total.toFixed(2)}`, rightX, rightY, { align: 'right' });
    
    // Separator line
    y = 50;
    doc.setDrawColor(126, 126, 126);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    
    // ===== BILL TO =====
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'normal');
    doc.text('BILL TO', margin, y);
    
    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(clientName, margin, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    
    if (clientPhone) {
        y += 5;
        doc.text(clientPhone, margin, y);
    }
    if (clientMobile) {
        y += 4;
        doc.text(clientMobile, margin, y);
    }
    if (clientEmail) {
        y += 4;
        doc.setTextColor(5, 99, 193);
        doc.text(clientEmail, margin, y);
        doc.setTextColor(51, 51, 51);
    }
    
    // Address (middle column)
    if (clientAddress || clientCity || clientPostcode) {
        let addrY = 58;
        const addrX = margin + 55;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Address:', addrX, addrY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);
        addrY += 5;
        if (clientAddress) {
            doc.text(clientAddress, addrX, addrY);
            addrY += 4;
        }
        if (clientCity) {
            doc.text(clientCity, addrX, addrY);
            addrY += 4;
        }
        if (clientPostcode) {
            doc.text(clientPostcode, addrX, addrY);
        }
    }
    
    // ===== ITEMS TABLE =====
    y = 92;
    
    // Table header
    doc.setDrawColor(126, 126, 126);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', margin + 2, y);
    doc.text('RATE', margin + 115, y);
    doc.text('QTY', margin + 140, y);
    doc.text('AMOUNT', margin + 162, y);
    
    y += 3;
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 5;
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    items.forEach(item => {
        if (item.description || item.qty > 0) {
            const descLines = item.description.split('\n').filter(line => line.trim());
            
            // Wrap each description line if too long
            const maxCharsPerLine = 70;
            const wrappedLines = [];
            
            descLines.forEach(line => {
                const bulletLine = `• ${line}`;
                if (bulletLine.length <= maxCharsPerLine) {
                    wrappedLines.push(bulletLine);
                } else {
                    // Split long lines
                    let remaining = line;
                    let isFirst = true;
                    while (remaining.length > 0) {
                        const prefix = isFirst ? '• ' : '  ';
                        const maxLen = maxCharsPerLine - prefix.length;
                        
                        // Find a good break point (space)
                        let breakPoint = maxLen;
                        if (remaining.length > maxLen) {
                            const lastSpace = remaining.substring(0, maxLen).lastIndexOf(' ');
                            if (lastSpace > maxLen * 0.5) {
                                breakPoint = lastSpace;
                            }
                        }
                        
                        const chunk = remaining.substring(0, breakPoint).trim();
                        wrappedLines.push(prefix + chunk);
                        remaining = remaining.substring(breakPoint).trim();
                        isFirst = false;
                    }
                }
            });
            
            // Calculate row height based on wrapped lines
            const lineHeight = 4.5;
            const rowHeight = Math.max(wrappedLines.length * lineHeight + 4, 10);
            
            // Check if we need a new page
            if (y + rowHeight > 265) {
                doc.addPage();
                y = 20;
            }
            
            // Description with bullets - full text
            doc.setTextColor(0, 0, 0);
            let descY = y;
            wrappedLines.forEach(line => {
                doc.text(line, margin + 2, descY);
                descY += lineHeight;
            });
            
            // Rate, Qty, Amount - aligned with first line of description
            doc.text(`${currency}${item.rate}`, margin + 120, y);
            doc.text(`${item.qty}${item.unit}`, margin + 145, y);
            doc.text(`${currency}${item.amount.toFixed(2)}`, margin + 168, y);
            
            y += rowHeight;
            
            // Row separator
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 3;
        }
    });
    
    // ===== TOTALS =====
    y += 8;
    
    const totalsX = margin + 120;
    
    // Subtotal
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('SUBTOTAL', totalsX, y);
    doc.text(`${currency}${total.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(totalsX, y, pageWidth - margin, y);
    
    // Total
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', totalsX, y);
    doc.text(`${currency}${total.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    
    y += 2;
    doc.setDrawColor(126, 126, 126);
    doc.line(totalsX, y, pageWidth - margin, y);
    
    // Balance Due
    y += 7;
    doc.setFontSize(11);
    doc.text('BALANCE DUE', totalsX, y);
    doc.text(`GBP ${currency}${total.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    
    // ===== PAYMENT INSTRUCTIONS =====
    y += 20;
    
    // Check if we need a new page
    if (y > 240) {
        doc.addPage();
        y = 20;
    }
    
    doc.setDrawColor(126, 126, 126);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('PAYMENT INSTRUCTIONS:', margin, y);
    
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text('Please transfer the payment to the following account:', margin, y);
    
    y += 7;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bankName, margin + 18, y);
    
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Sort Code:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bankSortCode, margin + 25, y);
    
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Account Number:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bankAccountNumber, margin + 38, y);
    
    // Footer
    y += 12;
    doc.setDrawColor(126, 126, 126);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(51, 51, 51);
    doc.text(`Please email ${CONFIG.business.email} if you have any questions regarding this invoice.`, margin, y);
    
    // Save the PDF
    const fileName = `Invoice-${invoiceNumber}-${clientName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    // Show success message
    showNotification(`Invoice downloaded: ${fileName}`);
}

// ============================================================
// NOTIFICATION
// ============================================================
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        font-size: 16px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.5s ease;
    `;
    notification.textContent = `✓ ${message}`;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.5s ease reverse';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// ============================================================
// EXPORT FUNCTIONS FOR EXTERNAL USE
// ============================================================
window.addItem = addItem;
window.removeItem = removeItem;
window.updateItemAndPreview = updateItemAndPreview;
window.generatePDF = generatePDF;
window.handleLogoUpload = handleLogoUpload;
