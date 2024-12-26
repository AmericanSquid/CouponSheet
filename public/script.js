fetch('/coupons')
    .then(response => response.json())
    .then(coupons => {
        const couponList = document.querySelector('.coupons-list');
        couponList.innerHTML = ''; // Clear existing coupons

        coupons.forEach(coupon => {
            const couponCard = document.createElement('div');
            couponCard.classList.add('coupon-card');
            couponCard.setAttribute('data-id', coupon.id);

            couponCard.innerHTML = `
                <h3>${coupon.title}</h3>
                <p>${coupon.description}</p>
                <button class="redeem-btn" ${coupon.redeemed ? 'disabled' : ''} 
                    onclick="redeemCoupon(${coupon.id})">
                    ${coupon.redeemed ? 'Redeemed' : 'Redeem'}
                </button>
            `;

            if (coupon.redeemed) {
                couponCard.classList.add('redeemed');
            }

            couponList.appendChild(couponCard);
        });
    })
    .catch(error => console.error('Error fetching coupons:', error));

// This function will be called when the "Redeem" button is clicked
function redeemCoupon(couponId) {
    // Make an HTTP request to redeem the coupon
    fetch(`/redeem/${couponId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Coupon redeemed successfully!');
            // Remove the coupon card
            const card = document.querySelector(`div[data-id="${couponId}"]`);
            if (card) {
                card.remove();
	    }
        } else {
            alert('Error redeeming coupon: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while redeeming the coupon.');
    });
}
