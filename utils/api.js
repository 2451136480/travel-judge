// API接口封装

// 基础URL
const BASE_URL = '/api';

// 获取本地存储的token
const getToken = () => {
	const userInfo = uni.getStorageSync('userInfo');
	return userInfo ? userInfo.token : '';
};

// 封装请求方法
const request = (url, method, data) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: BASE_URL + url,
			method,
			data,
			header: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + getToken()
			},
			success: (res) => {
				if (res.statusCode === 200) {
					// 请求成功
					if (res.data.code === 0) {
						resolve(res.data);
					} else if (res.data.code === 1001) {
						// token无效，需要重新登录
						uni.removeStorageSync('userInfo');
						uni.showToast({
							title: '登录已过期，请重新登录',
							icon: 'none'
						});
						setTimeout(() => {
							uni.redirectTo({
								url: '/pages/login/login'
							});
						}, 1500);
						reject(res.data);
					} else {
						// 业务错误
						uni.showToast({
							title: res.data.msg || '请求失败',
							icon: 'none'
						});
						reject(res.data);
					}
				} else {
					// HTTP状态码错误
					uni.showToast({
						title: '服务器响应错误：' + res.statusCode,
						icon: 'none'
					});
					reject(res);
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				});
				reject(err);
			}
		});
	});
};

const api = {
	// 用户相关接口
	user: {
		// 登录
		login(data) {
			return request('/user/login', 'POST', data);
		},
		// 获取用户信息
		getInfo() {
			return request('/user/info', 'GET');
		}
	},
	
	// 游记相关接口
	travel: {
		// 获取游记列表
		getList(params) {
			return request('/travel/list', 'GET', params);
		},
		// 获取游记详情
		getDetail(id) {
			return request('/travel/detail', 'GET', { id });
		},
		// 审核通过游记
		approve(id) {
			return request('/travel/approve', 'POST', { id });
		},
		// 审核拒绝游记
		reject(id, rejectReason) {
			return request('/travel/reject', 'POST', { id, rejectReason });
		},
		// 删除游记
		delete(id) {
			return request('/travel/delete', 'DELETE', { id });
		}
	}
};

export default api; 