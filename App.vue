<script>
	export default {
		onLaunch: function() {
			console.log('App Launch');
			// 检测Token有效性
			this.checkToken();
		},
		onShow: function() {
			console.log('App Show');
		},
		onHide: function() {
			console.log('App Hide');
		},
		methods: {
			// 检查登录状态
			checkToken() {
				const userInfo = uni.getStorageSync('userInfo');
				if (!userInfo) {
					// 未登录，跳转到登录页
					if (getCurrentPages().length === 0) {
						uni.reLaunch({
							url: '/pages/login/login'
						});
					} else {
						const currentRoute = getCurrentPages()[getCurrentPages().length - 1].route;
						if (currentRoute !== 'pages/login/login') {
							uni.redirectTo({
								url: '/pages/login/login'
							});
						}
					}
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	page {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: 14px;
		line-height: 1.5;
		background-color: #f5f5f5;
		color: #333;
	}
	
	/* 按钮基础样式 */
	button {
		margin: 0;
		padding: 0;
		font-size: 14px;
		line-height: 1;
		background-color: transparent;
	}
	
	button::after {
		border: none;
	}
</style>
