const ITEMS_PER_PAGE = 8;
let currentPage = 1;

function createPaginationControls(currentPage, totalPages) {
    const paginationDiv = document.createElement('div');
    paginationDiv.classList.add('pagination');
    
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.id = 'prev-page';
    if (currentPage === 1) prevButton.disabled = true;

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.id = 'next-page';
    if (currentPage >= totalPages) nextButton.disabled = true;

    prevButton.addEventListener('click', () => fetchCoupons(currentPage - 1));
    nextButton.addEventListener('click', () => fetchCoupons(currentPage + 1));

    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextButton);

    return paginationDiv;
}

function fetchCoupons(page = 1) {
    fetch(`/coupons?page=${page}&limit=${ITEMS_PER_PAGE}`)
        .then(response => response.json())
        .then(response => {
            const couponList = document.querySelector('.coupons-list');
            couponList.innerHTML = '';
            
            const oldPagination = document.querySelector('.pagination');
            if (oldPagination) {
                oldPagination.remove();
            }

            response.data.forEach(coupon => {
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
                
                const button = couponCard.querySelector('.redeem-btn');
                if (!coupon.redeemed) {
                    button.addEventListener('click', () => redeemCoupon(coupon.id));
                }
                
                couponList.appendChild(couponCard);
            });
            
            const paginationControls = createPaginationControls(
                response.pagination.currentPage,
                response.pagination.totalPages
            );
            
            couponList.after(paginationControls);
        })
        .catch(error => {
            console.error('Error fetching coupons:', error);
            const couponList = document.querySelector('.coupons-list');
            couponList.innerHTML = '<p class="error">Failed to load coupons. Please try again.</p>';
        });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCoupons(1);
});

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
