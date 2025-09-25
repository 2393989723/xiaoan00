// 检查用户认证状态
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? { isAuthenticated: true, user } : { isAuthenticated: false };
}

// 显示用户信息
function displayUserInfo() {
    const auth = checkAuth();
    const navUser = document.getElementById('navUser');
    
    if (auth.isAuthenticated && navUser) {
        navUser.innerHTML = `
            <span>欢迎，${auth.user.username}</span>
            ${auth.user.role === 'admin' ? '<a href="admin.html" class="nav-link">管理后台</a>' : ''}
            <button onclick="logout()" class="btn btn-secondary">退出</button>
        `;
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// 页面加载时检查认证状态
document.addEventListener('DOMContentLoaded', function() {
    displayUserInfo();
    
    // 如果用户已登录，重定向到仪表板（登录/注册页面）
    const auth = checkAuth();
    const currentPage = window.location.pathname.split('/').pop();
    
    if (auth.isAuthenticated && (currentPage === 'login.html' || currentPage === 'register.html')) {
        window.location.href = 'dashboard.html';
    }
    
    // 如果用户未登录，重定向到登录页面（需要认证的页面）
    if (!auth.isAuthenticated && (currentPage === 'dashboard.html' || currentPage === 'admin.html')) {
        window.location.href = 'login.html';
    }
    
    // 检查管理员权限
    if (currentPage === 'admin.html' && auth.user.role !== 'admin') {
        alert('无权访问管理后台');
        window.location.href = 'dashboard.html';
    }
});
