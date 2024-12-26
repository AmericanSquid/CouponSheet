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
                <button class="redeem-btn" 
                    data-id="${coupon.id}"
                    ${coupon.redeemed ? 'disabled' : ''}>
                    ${coupon.redeemed ? 'Redeemed' : 'Redeem'}
                </button>
            `;

            if (coupon.redeemed) {
                couponCard.classList.add('redeemed');
            }

           // Add click handler right after creating the button
            const button = couponCard.querySelector('.redeem-btn');
            if (!coupon.redeemed) {
                button.addEventListener('click', () => redeemCoupon(coupon.id));
            }
            
            couponList.appendChild(couponCard);
        });
    })
    .catch(error => console.error('Error fetching coupons:', error));

function redeemCoupon(couponId) {
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
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.redeem-btn');
    buttons.forEach(button => {
        const isRedeemed = button.closest('.coupon-card').dataset.redeemed === 'true';
        
        if (isRedeemed) {
            button.textContent = 'Redeemed';
            button.disabled = true;
        }
        
        if (!isRedeemed) {
            button.addEventListener('click', () => {
                redeemCoupon(button.dataset.id);
            });
        }
    });
});

