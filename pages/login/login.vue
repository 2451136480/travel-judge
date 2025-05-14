<template>
	<view class="login-container">
		<view class="login-box">
			<view class="logo-container">
				<image class="logo" src="/static/logo.png"></image>
			</view>
			<view class="title">旅游日记审核平台</view>
			
			<view class="form">
				<view class="input-group">
					<text class="label">用户名</text>
					<input type="text" v-model="username" placeholder="请输入用户名" />
				</view>
				<view class="input-group">
					<text class="label">密码</text>
					<input type="password" v-model="password" placeholder="请输入密码" />
				</view>
				
				<view class="role-select">
					<text class="role-label">角色：</text>
					<view class="role-options">
						<view :class="['role-option', role === 'reviewer' ? 'active' : '']" 
							@click="role = 'reviewer'">审核人员</view>
						<view :class="['role-option', role === 'admin' ? 'active' : '']" 
							@click="role = 'admin'">管理员</view>
					</view>
				</view>
				
				<button class="login-btn" @click="handleLogin">登录</button>
				
				<!-- 默认账号信息提示 -->
				<view class="account-tips">
					<view class="tips-title">默认账号：</view>
					<view class="tips-content">
						<view class="tips-item">
							<text class="tips-label">管理员：</text>
							<text class="tips-value">admin / admin123</text>
						</view>
						<view class="tips-item">
							<text class="tips-label">审核员：</text>
							<text class="tips-value">reviewer / reviewer123</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 页面底部背景图 -->
		<view class="bg-container">
			<image class="bg-image" src="/static/xh.jpg" mode="aspectFill"></image>
		</view>
	</view>
</template>

<script>
import adminConfig from '../../utils/admin.js';

export default {
	data() {
		return {
			username: '',
			password: '',
			role: 'reviewer' // 默认选择审核人员角色
		}
	},
	methods: {
		handleLogin() {
			// 表单验证
			if (!this.username || !this.username.trim()) {
				uni.showToast({
					title: '请输入用户名',
					icon: 'none'
				});
				return;
			}
			
			if (!this.password || !this.password.trim()) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				});
				return;
			}
			
			// 使用utils/admin.js中的验证方法
			const result = adminConfig.verifyAdminLogin(this.username, this.password);
			
			if (result.success) {
				// 检查角色是否匹配
				if (result.data.role !== this.role) {
					uni.showToast({
						title: '用户角色不匹配',
						icon: 'none'
					});
					return;
				}
				
				// 登录成功，存储用户信息
				uni.setStorageSync('userInfo', {
					username: this.username,
					nickname: result.data.nickname,
					role: result.data.role,
					permissions: result.data.permissions
				});
				
				// 提示登录成功
				uni.showToast({
					title: '登录成功',
					icon: 'success',
					duration: 1500
				});
				
				// 跳转到首页
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}, 1500);
			} else {
				uni.showToast({
					title: result.message || '用户名或密码错误',
					icon: 'none'
				});
			}
		}
	}
}
</script>

<style>
.login-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	background-color: #f5f5f5;
	position: relative;
	overflow: hidden;
}

.login-box {
	width: 400px;
	padding: 40px;
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	z-index: 10;
}

.logo-container {
	display: flex;
	justify-content: center;
	margin-bottom: 20px;
}

.logo {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	object-fit: cover;
}

.title {
	font-size: 24px;
	text-align: center;
	color: #333;
	margin-bottom: 30px;
	font-weight: bold;
}

.form {
	margin-top: 20px;
}

.input-group {
	margin-bottom: 20px;
}

.label {
	display: block;
	font-size: 16px;
	color: #606266;
	margin-bottom: 8px;
}

input {
	width: 100%;
	height: 40px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	padding: 0 15px;
	box-sizing: border-box;
	color: #606266;
	font-size: 16px;
}

.role-select {
	margin-bottom: 25px;
	display: flex;
	align-items: center;
}

.role-label {
	font-size: 16px;
	color: #606266;
	margin-right: 10px;
}

.role-options {
	display: flex;
}

.role-option {
	padding: 8px 16px;
	border: 1px solid #dcdfe6;
	margin-right: 10px;
	border-radius: 4px;
	cursor: pointer;
	color: #606266;
}

.role-option.active {
	background-color: #007AFF;
	color: #fff;
	border-color: #007AFF;
}

.login-btn {
	width: 100%;
	height: 40px;
	background-color: #007AFF;
	border-radius: 4px;
	color: #fff;
	font-size: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	cursor: pointer;
	margin-bottom: 25px;
}

.login-btn:active {
	opacity: 0.8;
}

/* 背景图片样式 */
.bg-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
}

.bg-image {
	width: 100%;
	height: 100%;
	opacity: 0.2;
}

/* 新增账号提示样式 */
.account-tips {
	margin-top: 20px;
	padding: 15px;
	background-color: #f8f8f8;
	border-radius: 4px;
	border-left: 4px solid #909399;
}

.tips-title {
	font-size: 14px;
	color: #606266;
	margin-bottom: 10px;
	font-weight: bold;
}

.tips-content {
	font-size: 12px;
}

.tips-item {
	margin-bottom: 5px;
	display: flex;
}

.tips-label {
	color: #909399;
	margin-right: 5px;
	width: 60px;
}

.tips-value {
	color: #606266;
	font-family: monospace;
}
</style> 