// 管理员账户配置
import adminUsers from '../static/admin-config.json';

// 验证管理员登录
export const verifyAdminLogin = (username, password) => {
	// 查找用户
	const user = Object.values(adminUsers).find(
		u => u.username === username && u.password === password
	);
	
	if (user) {
		// 返回不含密码的用户信息
		const { password, ...userInfo } = user;
		return {
			success: true,
			data: userInfo
		};
	}
	
	return {
		success: false,
		message: '用户名或密码错误'
	};
};

// 检查用户权限
export const checkPermission = (role, action) => {
	const user = adminUsers[role];
	if (!user) return false;
	
	return user.permissions.includes(action);
};

// 获取管理员账号列表(不包含密码)
export const getAdminsList = () => {
	return Object.entries(adminUsers).map(([key, user]) => {
		const { password, ...info } = user;
		return {
			key,
			...info
		};
	});
};

export default {
	verifyAdminLogin,
	checkPermission,
	getAdminsList
}; 