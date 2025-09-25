// 全局变量
let adminProducts = [];
let adminOrders = [];
let adminUsers = [];

// 初始化管理后台
async function initAdmin() {
    await loadAdminData();
    setupAdminTabs();
    setupAdminModals();
}

// 加载管理数据
async function loadAdminData() {
    await loadAdminProducts();
    await loadAdminOrders();
    await loadAdminUsers();
}

// 加载商品数据
async function loadAdminProducts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/products', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            adminProducts = await response.json();
            renderAdminProducts();
        } else {
            throw new Error('获取商品列表失败');
        }
    } catch (error) {
        console.error('加载商品错误:', error);
        document.getElementById('adminProductsList').innerHTML = '<p>加载商品失败</p>';
    }
}

// 加载订单数据
async function loadAdminOrders() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            adminOrders = await response.json();
            renderAdminOrders();
        } else {
            throw new Error('获取订单列表失败');
        }
    } catch (error) {
        console.error('加载订单错误:', error);
        document.getElementById('adminOrdersList').innerHTML = '<p>加载订单失败</p>';
    }
}

// 加载用户数据
async function loadAdminUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            adminUsers = await response.json();
            renderAdminUsers();
        } else {
            throw new Error('获取用户列表失败');
        }
    } catch (error) {
        console.error('加载用户错误:', error);
        document.getElementById('adminUsersList').innerHTML = '<p>加载用户失败</p>';
    }
}

// 渲染商品列表
function renderAdminProducts() {
    const productsList = document.getElementById('adminProductsList');
    
    if (adminProducts.length === 0) {
        productsList.innerHTML = '<p>暂无商品</p>';
        return;
    }
    
    productsList.innerHTML = adminProducts.map(product => `
        <div class="admin-item">
            <div>
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <p>价格: ${product.price} 钻石 | 库存: ${product.stock} | 分类: ${product.category}</p>
            </div>
            <div class="admin-actions">
                <button class="btn btn-primary" onclick="editProduct('${product._id}')">编辑</button>
                <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 渲染订单列表
function renderAdminOrders() {
    const ordersList = document.getElementById('adminOrdersList');
    
    if (adminOrders.length === 0) {
        ordersList.innerHTML = '<p>暂无订单</p>';
        return;
    }
    
    ordersList.innerHTML = adminOrders.map(order => `
        <div class="admin-item">
            <div>
                <h4>${order.productName}</h4>
                <p>用户: ${order.userInfo.username} (${order.userInfo.email})</p>
                <p>数量: ${order.quantity} | 总价: ${order.totalPrice} 钻石</p>
                <p>联系方式: ${order.contactInfo}</p>
                <p>状态: <span class="order-status status-${order.status}">${getStatusText(order.status)}</span></p>
                <p>下单时间: ${new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div class="admin-actions">
                <button class="btn btn-primary" onclick="viewOrder('${order._id}')">查看</button>
                <select onchange="updateOrderStatus('${order._id}', this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>待处理</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>处理中</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>已完成</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>已取消</option>
                </select>
            </div>
        </div>
    `).join('');
}

// 渲染用户列表
function renderAdminUsers() {
    const usersList = document.getElementById('adminUsersList');
    
    if (adminUsers.length === 0) {
        usersList.innerHTML = '<p>暂无用户</p>';
        return;
    }
    
    usersList.innerHTML = adminUsers.map(user => `
        <div class="admin-item">
            <div>
                <h4>${user.username}</h4>
                <p>邮箱: ${user.email}</p>
                <p>角色: ${user.role}</p>
                <p>钻石: ${user.diamonds}</p>
                <p>注册时间: ${new Date(user.createdAt).toLocaleString()}</p>
            </div>
            <div class="admin-actions">
                <button class="btn btn-primary" onclick="viewUser('${user._id}')">查看</button>
                <button class="btn btn-success" onclick="rechargeUser('${user._id}')">充值</button>
            </div>
        </div>
    `).join('');
}

// 设置管理标签页
function setupAdminTabs() {
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

// 设置管理模态框
function setupAdminModals() {
    // 商品模态框
    const productModal = document.getElementById('productModal');
    const productCloseBtn = productModal.querySelector('.close');
    
    productCloseBtn.addEventListener('click', () => {
        productModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
    });
    
    // 订单模态框
    const orderModal = document.getElementById('orderModal');
    const orderCloseBtn = orderModal.querySelector('.close');
    
    orderCloseBtn.addEventListener('click', () => {
        orderModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
        }
    });
    
    // 用户模态框
    const userModal = document.getElementById('userModal');
    const userCloseBtn = userModal.querySelector('.close');
    
    userCloseBtn.addEventListener('click', () => {
        userModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === userModal) {
            userModal.style.display = 'none';
        }
    });
}

// 添加商品按钮事件
document.getElementById('addProductBtn').addEventListener('click', () => {
    document.getElementById('productModalTitle').textContent = '添加商品';
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('productModal').style.display = 'block';
});

// 商品表单提交
document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productId = document.getElementById('editProductId').value;
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const stock = parseInt(document.getElementById('productStock').value);
    const token = localStorage.getItem('token');
    
    try {
        const url = productId ? `/api/products/${productId}` : '/api/products';
        const method = productId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                description,
                price,
                category,
                stock
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(productId ? '商品更新成功' : '商品添加成功');
            document.getElementById('productModal').style.display = 'none';
            await loadAdminProducts();
        } else {
            alert((productId ? '更新' : '添加') + '商品失败: ' + data.error);
        }
    } catch (error) {
        console.error('商品操作错误:', error);
        alert('操作失败，请重试');
    }
});

// 编辑商品
function editProduct(productId) {
    const product = adminProducts.find(p => p._id === productId);
    
    if (!product) {
        alert('商品不存在');
        return;
    }
    
    document.getElementById('productModalTitle').textContent = '编辑商品';
    document.getElementById('editProductId').value = product._id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStock').value = product.stock;
    
    document.getElementById('productModal').style.display = 'block';
}

// 删除商品
async function deleteProduct(productId) {
    if (!confirm('确定要删除这个商品吗？')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('商品删除成功');
            await loadAdminProducts();
        } else {
            alert('删除商品失败: ' + data.error);
        }
    } catch (error) {
        console.error('删除商品错误:', error);
        alert('删除失败，请重试');
    }
}

// 查看订单
function viewOrder(orderId) {
    const order = adminOrders.find(o => o._id === orderId);
    
    if (!order) {
        alert('订单不存在');
        return;
    }
    
    document.getElementById('orderDetails').innerHTML = `
        <p><strong>商品名称:</strong> ${order.productName}</p>
        <p><strong>用户:</strong> ${order.userInfo.username} (${order.userInfo.email})</p>
        <p><strong>数量:</strong> ${order.quantity}</p>
        <p><strong>总价:</strong> ${order.totalPrice} 钻石</p>
        <p><strong>联系方式:</strong> ${order.contactInfo}</p>
        <p><strong>状态:</strong> <span class="order-status status-${order.status}">${getStatusText(order.status)}</span></p>
        <p><strong>下单时间:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        ${order.adminNotes ? `<p><strong>管理员备注:</strong> ${order.adminNotes}</p>` : ''}
        
        <div class="form-group">
            <label for="adminNotes">管理员备注</label>
            <textarea id="adminNotes">${order.adminNotes || ''}</textarea>
        </div>
        <button class="btn btn-primary" onclick="saveOrderNotes('${order._id}')">保存备注</button>
    `;
    
    document.getElementById('orderModal').style.display = 'block';
}

// 保存订单备注
async function saveOrderNotes(orderId) {
    const adminNotes = document.getElementById('adminNotes').value;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: adminOrders.find(o => o._id === orderId).status,
                adminNotes
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('备注保存成功');
            await loadAdminOrders();
        } else {
            alert('保存备注失败: ' + data.error);
        }
    } catch (error) {
        console.error('保存备注错误:', error);
        alert('保存失败，请重试');
    }
}

// 更新订单状态
async function updateOrderStatus(orderId, status) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            await loadAdminOrders();
        } else {
            alert('更新状态失败: ' + data.error);
        }
    } catch (error) {
        console.error('更新状态错误:', error);
        alert('更新失败，请重试');
    }
}

// 查看用户
function viewUser(userId) {
    const user = adminUsers.find(u => u._id === userId);
    
    if (!user) {
        alert('用户不存在');
        return;
    }
    
    document.getElementById('userDetails').innerHTML = `
        <p><strong>用户名:</strong> ${user.username}</p>
        <p><strong>邮箱:</strong> ${user.email}</p>
        <p><strong>角色:</strong> ${user.role}</p>
        <p><strong>钻石:</strong> ${user.diamonds}</p>
        <p><strong>注册时间:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
        <p><strong>最后更新:</strong> ${new Date(user.updatedAt).toLocaleString()}</p>
    `;
    
    document.getElementById('userModal').style.display = 'block';
}

// 为用户充值
function rechargeUser(userId) {
    const user = adminUsers.find(u => u._id === userId);
    
    if (!user) {
        alert('用户不存在');
        return;
    }
    
    const diamonds = prompt(`为 ${user.username} 充值钻石数量:`, '100');
    
    if (diamonds === null) return;
    
    const diamondsNum = parseInt(diamonds);
    
    if (isNaN(diamondsNum) || diamondsNum <= 0) {
        alert('请输入有效的钻石数量');
        return;
    }
    
    const action = confirm('选择操作方式:\n确定 - 增加钻石\n取消 - 设置钻石数量');
    
    rechargeUserDiamonds(userId, diamondsNum, action ? 'add' : 'set');
}

// 执行充值操作
async function rechargeUserDiamonds(userId, diamonds, action) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`/api/users/${userId}/diamonds`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ diamonds, action })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('充值成功');
            await loadAdminUsers();
        } else {
            alert('充值失败: ' + data.error);
        }
    } catch (error) {
        console.error('充值错误:', error);
        alert('充值失败，请重试');
    }
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

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initAdmin);
