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
                    <td style="padding: 12px 5px; border-bottom: 1px solid #ccc; vertical-align: top; font-size: 11px; line-height: 1.6;">${descHtml}</td>
                    <td style="padding: 12px 5px; border-bottom: 1px solid #ccc; text-align: center; vertical-align: top; font-size: 11px;">${currency}${item.rate}</td>
                    <td style="padding: 12px 5px; border-bottom: 1px solid #ccc; text-align: center; vertical-align: top; font-size: 11px;">${item.qty}${item.unit}</td>
                    <td style="padding: 12px 5px; border-bottom: 1px solid #ccc; text-align: right; vertical-align: top; font-size: 11px;">${currency}${item.amount.toFixed(2)}</td>
                </tr>
            `;
        }
    });
    
    // Logo HTML
    const logoHtml = logoDataUrl 
        ? `<img src="${logoDataUrl}" style="max-width: 100px; height: auto;">` 
        : `<div style="font-size: 14px; font-weight: bold; color: #c41e3a;">&lt;/&gt; Web developer</div>`;
    
    // Create hidden div for PDF content
    const pdfContent = document.createElement('div');
    pdfContent.id = 'pdf-content';
    pdfContent.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 210mm; background: white; font-family: Arial, sans-serif; padding: 15mm;';
    
    pdfContent.innerHTML = `
        <!-- HEADER TABLE -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
            <tr>
                <td style="width: 100px; vertical-align: top; padding: 10px 0;">
                    ${logoHtml}
                </td>
                <td style="vertical-align: top; padding: 10px 15px;">
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">${CONFIG.business.name}</div>
                    <div style="font-size: 11px; color: #333; line-height: 1.6;">
                        ${CONFIG.business.title}<br>
                        ${CONFIG.business.address}<br>
                        ${CONFIG.business.city}<br>
                        ${CONFIG.business.postcode}<br>
                        ${CONFIG.business.phone}<br>
                        <span style="color: #0563C1;">${CONFIG.business.email}</span>
                    </div>
                </td>
                <td style="width: 140px; vertical-align: top; padding: 10px 0; text-align: right;">
                    <div style="font-size: 12px; font-weight: bold;">INVOICE</div>
                    <div style="font-size: 11px; margin-bottom: 10px;">${invoiceNumber}</div>
                    
                    <div style="font-size: 11px; font-weight: bold; margin-top: 8px;">DATE</div>
                    <div style="font-size: 11px; margin-bottom: 10px;">${formattedDate}</div>
                    
                    <div style="font-size: 11px; font-weight: bold; margin-top: 8px;">DUE</div>
                    <div style="font-size: 11px; margin-bottom: 10px;">${dueTerms}</div>
                    
                    <div style="font-size: 11px; font-weight: bold; margin-top: 8px;">BALANCE DUE</div>
                    <div style="font-size: 12px;">GBP ${currency}${total.toFixed(2)}</div>
                </td>
            </tr>
        </table>
        
        <!-- SEPARATOR LINE -->
        <div style="border-top: 1px solid #7E7E7E; margin: 15px 0;"></div>
        
        <!-- BILL TO TABLE -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
                <td style="width: 33%; vertical-align: top; padding: 5px 0;">
                    <div style="font-size: 10px; color: #666; margin-bottom: 5px;">BILL TO</div>
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">${clientName}</div>
                    <div style="font-size: 11px; color: #333; line-height: 1.5;">
                        ${clientPhone ? clientPhone + '<br>' : ''}
                        ${clientMobile ? clientMobile + '<br>' : ''}
                        ${clientEmail ? '<span style="color: #0563C1;">' + clientEmail + '</span>' : ''}
                    </div>
                </td>
                <td style="width: 33%; vertical-align: top; padding: 5px 15px;">
                    ${clientAddress || clientCity || clientPostcode ? `
                        <div style="font-size: 11px; font-weight: bold; margin-bottom: 5px;">Address:</div>
                        <div style="font-size: 11px; color: #333; line-height: 1.5;">
                            ${clientAddress ? clientAddress + '<br>' : ''}
                            ${clientCity ? clientCity + '<br>' : ''}
                            ${clientPostcode || ''}
                        </div>
                    ` : ''}
                </td>
                <td style="width: 33%;"></td>
            </tr>
        </table>
        
        <!-- ITEMS TABLE -->
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="padding: 10px 5px; text-align: left; border-top: 1px solid #7E7E7E; border-bottom: 1px solid #7E7E7E; font-size: 12px; font-weight: bold;">DESCRIPTION</th>
                    <th style="padding: 10px 5px; text-align: center; border-top: 1px solid #7E7E7E; border-bottom: 1px solid #7E7E7E; font-size: 12px; font-weight: bold; width: 70px;">RATE</th>
                    <th style="padding: 10px 5px; text-align: center; border-top: 1px solid #7E7E7E; border-bottom: 1px solid #7E7E7E; font-size: 12px; font-weight: bold; width: 70px;">QTY</th>
                    <th style="padding: 10px 5px; text-align: right; border-top: 1px solid #7E7E7E; border-bottom: 1px solid #7E7E7E; font-size: 12px; font-weight: bold; width: 80px;">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <!-- TOTALS -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
                <td style="width: 60%;"></td>
                <td style="padding: 8px 5px; text-align: right; font-size: 11px;">SUBTOTAL</td>
                <td style="padding: 8px 5px; text-align: right; font-size: 11px; width: 100px; border-bottom: 1px solid #ccc;">${currency}${total.toFixed(2)}</td>
            </tr>
            <tr>
                <td></td>
                <td style="padding: 8px 5px; text-align: right; font-size: 12px; font-weight: bold;">TOTAL</td>
                <td style="padding: 8px 5px; text-align: right; font-size: 12px; font-weight: bold; border-bottom: 1px solid #7E7E7E;">${currency}${total.toFixed(2)}</td>
            </tr>
            <tr>
                <td></td>
                <td style="padding: 10px 5px; text-align: right; font-size: 12px; font-weight: bold;">BALANCE DUE</td>
                <td style="padding: 10px 5px; text-align: right; font-size: 12px; font-weight: bold;">GBP ${currency}${total.toFixed(2)}</td>
            </tr>
        </table>
        
        <!-- PAYMENT INSTRUCTIONS -->
        <div style="border-top: 1px solid #7E7E7E; margin-top: 25px; padding-top: 15px;">
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">PAYMENT INSTRUCTIONS:</div>
            <div style="font-size: 11px; color: #333; margin-bottom: 10px;">Please transfer the payment to the following account:</div>
            <div style="font-size: 11px; line-height: 1.6;">
                <strong>Name:</strong> ${bankName}<br>
                <strong>Sort Code:</strong> ${bankSortCode}<br>
                <strong>Account Number:</strong> ${bankAccountNumber}
            </div>
        </div>
        
        <!-- FOOTER -->
        <div style="border-top: 1px solid #7E7E7E; margin-top: 20px; padding-top: 10px;">
            <div style="font-size: 10px; color: #666;">
                Please email <span style="color: #0563C1;">${CONFIG.business.email}</span> if you have any questions regarding this invoice.
            </div>
        </div>
    `;
    
    document.body.appendChild(pdfContent);
    
    // Use html2canvas to capture the HTML
    html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        const imgData = canvas.toDataURL('image/png');
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 0;
        
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Save the PDF
        const fileName = `Invoice-${invoiceNumber}-${clientName.replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
        
        // Remove hidden div
        document.body.removeChild(pdfContent);
        
        // Show success message
        showNotification(`Invoice downloaded: ${fileName}`);
    }).catch(err => {
        console.error('PDF generation error:', err);
        document.body.removeChild(pdfContent);
        alert('Error generating PDF. Please try again.');
    });
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
