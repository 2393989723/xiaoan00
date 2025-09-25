// 检查用户认证状态
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
        return { isAuthenticated: true, user };
    }
    
    return { isAuthenticated: false };
}

// 显示用户信息
function displayUserInfo() {
    const auth = checkAuth();
    const navUser = document.getElementById('navUser');
    
    if (auth.isAuthenticated && navUser) {
        navUser.innerHTML = `
            <span>欢迎，${auth.user.username}</span>
            ${auth.user.role === 'admin' ? '<a href="/admin" class="nav-link">管理后台</a>' : ''}
            <button onclick="logout()" class="btn btn-secondary">退出</button>
        `;
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// 页面加载时检查认证状态
document.addEventListener('DOMContentLoaded', function() {
    displayUserInfo();
    
    // 如果用户已登录，重定向到仪表板（登录/注册页面）
    const auth = checkAuth();
    const currentPage = window.location.pathname;
    
    if (auth.isAuthenticated && (currentPage === '/login' || currentPage === '/register')) {
        window.location.href = '/dashboard';
    }
    
    // 如果用户未登录，重定向到登录页面（需要认证的页面）
    if (!auth.isAuthenticated && (currentPage === '/dashboard' || currentPage === '/admin')) {
        window.location.href = '/login';
    }
    
    // 检查管理员权限
    if (currentPage === '/admin' && auth.user.role !== 'admin') {
        alert('无权访问管理后台');
        window.location.href = '/dashboard';
    }
});
