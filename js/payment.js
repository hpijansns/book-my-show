// js/payment.js
// 🔥 DHYAN DEIN: Yahan 'push' aur 'set' add kiya gaya hai Firebase se data bhejne ke liye
import { db, ref, onValue, push, set } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    
    // Naye HTML ke hisaab se IDs select ki hain
    const qrImg = document.getElementById('qr-code-img'); 
    const upiText = document.getElementById('upi-text'); 
    const upiInput = document.getElementById('upiID'); 
    const phonepeLink = document.getElementById('phonepe-link');
    const paytmLink = document.getElementById('paytm-link');
    const priceDisplays = document.querySelectorAll('.final_paid_price');
    
    // Price fetch karna (Payment.html me update ho chuka hai tax ke sath)
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

    // ==========================================
    // 🔥 POPUP MODAL LOGIC (Important Note / View Details)
    // ==========================================
    const popup = document.getElementById('tnc-modal');
    const viewDetailsBtn = document.getElementById('view-details-btn');
    const acceptBtn = document.getElementById('accept-tnc-btn');

    window.openTnc = () => {
        if (popup) popup.classList.add('active');
    };

    window.closePopup = () => {
        if (popup) popup.classList.remove('active');
    };

    // Modal ke bahar click karne par band karna
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) closePopup();
        });
    }

    // "Okay, Got It" button par click karne se popup band hoga
    if (acceptBtn) {
        acceptBtn.onclick = () => {
            closePopup();
        };
    }

    // "View Details" click par popup open karna
    if (viewDetailsBtn) {
        viewDetailsBtn.onclick = (e) => {
            e.preventDefault(); // Page ko scroll hone se rokne ke liye
            window.openTnc();
        };
    }

    // ==========================================
    // 🔥 NEW: UTR SUBMISSION & LIVE VERIFICATION LOGIC 🔥
    // ==========================================
    const submitUtrBtn = document.getElementById('submit-utr-btn');
    const utrInput = document.getElementById('utr-input');
    const utrError = document.getElementById('utr-error');
    const processingOverlay = document.getElementById('processing-overlay');

    if (submitUtrBtn) {
        submitUtrBtn.addEventListener('click', () => {
            const utrValue = utrInput.value.trim();

            // Validation (UTR 12 digit ka hona chahiye)
            if (utrValue.length !== 12 || isNaN(utrValue)) {
                if(utrError) utrError.classList.remove('hidden');
                if(utrInput) utrInput.classList.add('border-red-500');
                return;
            }

            // Error hide karo
            if(utrError) utrError.classList.add('hidden');
            if(utrInput) utrInput.classList.remove('border-red-500');

            // Loader chalu karo aur UI set karo
            if(processingOverlay) {
                processingOverlay.innerHTML = `
                    <div class="w-14 h-14 border-4 border-gray-200 border-t-[#f84464] rounded-full animate-spin mb-4"></div>
                    <h2 class="text-xl font-bold text-gray-800 text-center">Verifying Payment...</h2>
                    <p class="text-sm text-gray-500 mt-2 text-center px-8 leading-relaxed font-medium">
                        Please wait while we confirm your transaction.<br>
                        <span class="text-[#f84464] font-bold">Do not close or refresh this page.</span>
                    </p>
                `;
                processingOverlay.classList.remove('hidden');
                processingOverlay.style.display = 'flex';
            }

            const name = localStorage.getItem('customerName') || "Unknown";
            const phone = localStorage.getItem('customerPhone') || "Unknown";
            const email = localStorage.getItem('customerEmail') || "Unknown";
            const address = localStorage.getItem('customerAddress') || localStorage.getItem('address') || "Unknown";
            
            let matchTitle = "Unknown Match";
            try {
                const matchData = JSON.parse(localStorage.getItem('selectedMatch'));
                if(matchData) matchTitle = matchData.title;
            } catch(e) {}

            // Firebase me booking create karna
            const bookingsRef = ref(db, 'bookings');
            const newBookingRef = push(bookingsRef); 

            const bookingData = {
                id: newBookingRef.key,
                name: name,
                phone: phone,
                email: email,
                address: address,
                match: matchTitle,
                amount: finalPrice,
                utr: utrValue,
                status: "pending", 
                timestamp: new Date().toISOString()
            };

            set(newBookingRef, bookingData).then(() => {
                
                // 1. LIVE LISTENER SETUP (Admin approved/declined check karega)
                onValue(ref(db, `bookings/${newBookingRef.key}/status`), (snapshot) => {
                    const currentStatus = snapshot.val();

                    if (currentStatus === 'approved') {
                        window.location.href = 'success.html'; 
                    } 
                    else if (currentStatus === 'declined') {
                        if(processingOverlay) {
                            processingOverlay.classList.add('hidden');
                            processingOverlay.style.display = 'none';
                        }
                        alert("❌ Payment Verification Failed!\nWe couldn't verify this UTR. Please check and enter the correct 12-digit UTR number.");
                        if(utrInput) utrInput.value = '';
                        // Firebase status reset taaki wapas try kar sake
                        set(ref(db, `bookings/${newBookingRef.key}/status`), "pending_retry");
                    }
                });

                // 2. 🔥 SMART TIMEOUT SYSTEM (60 Seconds) 🔥
                setTimeout(() => {
                    onValue(ref(db, `bookings/${newBookingRef.key}/status`), (snap) => {
                        if(snap.val() === 'pending' || snap.val() === 'pending_retry') {
                            
                            // Database me status update karo
                            set(ref(db, `bookings/${newBookingRef.key}/status`), "under_review");

                            // User ko screen dikhao
                            if(processingOverlay) {
                                processingOverlay.innerHTML = `
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h2 class="text-xl font-bold text-gray-800 text-center">Payment Under Review</h2>
                                    <p class="text-sm text-gray-500 mt-3 text-center px-6 leading-relaxed font-medium">
                                        We have received your UTR details. Our team is currently verifying the payment manually.<br><br>
                                        Once verified, your M-Ticket will be sent to your WhatsApp/Email within <b class="text-gray-700">1 to 2 hours</b>.
                                    </p>
                                    <button onclick="window.location.href='index.html'" class="mt-6 bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md">
                                        Return to Home
                                    </button>
                                `;
                            }
                        }
                    }, { onlyOnce: true });
                }, 60000); // 60 Seconds Timer

                // 3. Telegram Alert to Admin
                const botToken = "8642950249:AAF8oxzhk-6NvYTEtpIW0oNNwsb2RQljliY"; 
                const chatId = "6820660513";
                const msg = `🟡 *UTR VERIFICATION REQUIRED* 🟡\n\n👤 *Name:* ${name}\n💰 *Amount:* ₹${finalPrice}\n🔢 *UTR:* ${utrValue}\n\n👉 *Action:* Please check Firebase and Approve/Decline. Admin has 60 seconds.`;
                fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`);

            }).catch((error) => {
                console.error("Error saving booking:", error);
                if(processingOverlay) processingOverlay.classList.add('hidden');
                alert("Something went wrong. Please check your internet connection and try again.");
            });
        });
    }

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
