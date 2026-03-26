// js/payment.js
import { db, ref, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    
    // Naye HTML ke hisaab se IDs select ki hain
    const qrImg = document.getElementById('qr-code-img'); 
    const upiText = document.getElementById('upi-text'); 
    const upiInput = document.getElementById('upiID'); 
    const phonepeLink = document.getElementById('phonepe-link');
    const paytmLink = document.getElementById('paytm-link');
    const priceDisplays = document.querySelectorAll('.final_paid_price');
    
    // Price fetch karna (Aapke JS me finalPrice tha, HTML me selectedTotalPrice, maine dono handle kar liye hain)
    const finalPrice = localStorage.getItem('finalPrice') || localStorage.getItem('selectedTotalPrice') || 0;

    // UI me price update karna
    priceDisplays.forEach(el => el.innerText = '₹' + finalPrice);

    // Firebase se QR/UPI settings fetch karna
    onValue(ref(db, 'settings/payment'), (snap) => {
        if (snap.exists()) {
            const data = snap.val();
            const payeeName = "AarushFashion"; 
            
            // Agar Admin ne UPI ID dali hai
            if (data.upiId && data.upiId.trim() !== "") {
                const upiId = data.upiId.trim();
                
                // Copy button aur screen par dikhane ke liye UPI ID set karna
                if(upiText) upiText.innerText = upiId;
                if(upiInput) upiInput.value = upiId;
                
                // 1. UPI String generate karna
                const upiString = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${finalPrice}&cu=INR`;
                const encodedUpi = encodeURIComponent(upiString);

                // 2. Mobile Deep Links (PhonePe & Paytm) Update karna
                const phonepePayload = {
                    contact: { cbcName: payeeName, nickName: payeeName, vpa: upiId, type: "VPA" },
                    p2pPaymentCheckoutParams: {
                        note: "Secure Payment",
                        isByDefaultKnownContact: true,
                        initialAmount: Number(finalPrice) * 100,
                        currency: "INR",
                        checkoutType: "DEFAULT",
                        transactionContext: "p2p"
                    }
                };
                const phonepeBase64 = encodeURIComponent(btoa(JSON.stringify(phonepePayload)));
                
                if(phonepeLink) phonepeLink.href = "phonepe://native?data=" + phonepeBase64 + "&id=p2ppayment";
                if(paytmLink) paytmLink.href = `paytmmp://cash_wallet?pa=${upiId}&pn=${payeeName}&am=${finalPrice}&cu=INR&featuretype=money_transfer`;

                // 3. QR Code Update karna (Agar direct image link nahi hai)
                if (!data.qrUrl || data.qrUrl.trim() === "") {
                    if(qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedUpi}`;
                }
            } else {
                if(upiText) upiText.innerText = "UPI ID not set";
            }

            // Agar Admin ne direct QR Image URL dala hai (Yeh override karega auto-generated QR ko)
            if (data.qrUrl && data.qrUrl.trim() !== "") {
                if(qrImg) qrImg.src = data.qrUrl;
            }

        } else {
            if(upiText) upiText.innerText = "Setup incomplete";
            console.log("QR Setup is incomplete. Check Admin Panel.");
        }
    });
});

// Copy UPI ka function global scope me banana padega kyuki type="module" use ho raha hai
window.copyUpi = function() {
    const copyText = document.getElementById("upiID");
    const btn = event.currentTarget; 
    
    if(copyText && copyText.value) {
        navigator.clipboard.writeText(copyText.value).then(() => {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Copied!';
            btn.classList.add('bg-green-100', 'text-green-700', 'border-green-200');
            btn.classList.remove('bg-blue-50', 'text-blue-600', 'border-blue-100');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('bg-green-100', 'text-green-700', 'border-green-200');
                btn.classList.add('bg-blue-50', 'text-blue-600', 'border-blue-100');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
};
