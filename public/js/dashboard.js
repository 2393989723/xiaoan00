// 全局变量
let products = [];
let orders = [];

// 初始化仪表板
async function initDashboard() {
    await loadUserInfo();
    await loadProducts();
    await loadOrders();
    setupTabs();
    setupModal();
}

// 加载用户信息
async function loadUserInfo() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('userInfo').innerHTML = `
                <p>用户名: ${data.user.username}</p>
                <p class="user-diamonds">钻石余额: ${data.user.diamonds}</p>
            `;
        } else {
            throw new Error('获取用户信息失败');
        }
    } catch (error) {
        console.error('加载用户信息错误:', error);
        alert('获取用户信息失败');
    }
}

// 加载商品列表
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        
        if (response.ok) {
            products = await response.json();
            renderProducts();
        } else {
            throw new Error('获取商品列表失败');
        }
    } catch (error) {
        console.error('加载商品错误:', error);
        document.getElementById('productsGrid').innerHTML = '<p>加载商品失败</p>';
    }
}

// 渲染商品列表
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p>暂无商品</p>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-box"></i>
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price} 钻石</div>
                <div class="product-stock">库存: ${product.stock}</div>
                <button class="btn btn-primary" onclick="openPurchaseModal('${product._id}')">购买</button>
            </div>
        </div>
    `).join('');
}

// 加载订单列表
async function loadOrders() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/orders/my-orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            orders = await response.json();
            renderOrders();
        } else {
            throw new Error('获取订单列表失败');
        }
    } catch (error) {
        console.error('加载订单错误:', error);
        document.getElementById('ordersList').innerHTML = '<p>加载订单失败</p>';
    }
}

// 渲染订单列表
function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p>暂无订单</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>${order.productName}</h3>
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <p>数量: ${order.quantity}</p>
            <p>总价: ${order.totalPrice} 钻石</p>
            <p>联系方式: ${order.contactInfo}</p>
            <p>下单时间: ${new Date(order.createdAt).toLocaleString()}</p>
            ${order.adminNotes ? `<p>管理员备注: ${order.adminNotes}</p>` : ''}
        </div>
    `).join('');
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

// 设置标签页
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有激活状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // 添加激活状态
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 设置模态框
function setupModal() {
    const modal = document.getElementById('purchaseModal');
    const closeBtn = document.querySelector('.close');
    const quantityInput = document.getElementById('quantity');
    const totalPriceSpan = document.getElementById('totalPrice');
    
    // 关闭模态框
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 数量变化时更新总价
    quantityInput.addEventListener('input', updateTotalPrice);
}

// 打开购买模态框
function openPurchaseModal(productId) {
    const product = products.find(p => p._id === productId);
    
    if (!product) {
        alert('商品不存在');
        return;
    }
    
    // 检查库存
    if (product.stock <= 0) {
        alert('该商品已售罄');
        return;
    }
    
    // 填充模态框数据
    document.getElementById('productId').value = product._id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('quantity').value = 1;
    document.getElementById('quantity').max = product.stock;
    document.getElementById('contactInfo').value = '';
    
    updateTotalPrice();
    
    // 显示模态框
    document.getElementById('purchaseModal').style.display = 'block';
}

// 更新总价
function updateTotalPrice() {
    const price = parseInt(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const totalPrice = price * quantity;
    document.getElementById('totalPrice').textContent = totalPrice;
}

// 处理购买表单提交
document.getElementById('purchaseForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const contactInfo = document.getElementById('contactInfo').value;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId,
                quantity,
                contactInfo
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('购买成功！客服会尽快联系您');
            document.getElementById('purchaseModal').style.display = 'none';
            // 重新加载数据和用户信息
            await loadUserInfo();
            await loadProducts();
            await loadOrders();
        } else {
            alert('购买失败: ' + data.error);
        }
    } catch (error) {
        console.error('购买错误:', error);
        alert('购买失败，请重试');
    }
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initDashboard);
